<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\CashierShift;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OwnerController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        $paidOrders = Order::where('cafe_id', $cafeId)->whereIn('order_status', ['paid', 'processing', 'ready', 'completed']);
        $totalRevenue = (clone $paidOrders)->sum('grand_total');
        $todayRevenue = (clone $paidOrders)->whereDate('created_at', today())->sum('grand_total');
        $totalOrdersCount = Order::where('cafe_id', $cafeId)->count();
        $lowStocks = Stock::where('cafe_id', $cafeId)->whereColumn('current_qty', '<=', 'min_qty_alert')->get();

        $revenueChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = today()->subDays($i);
            $dayTotal = Order::where('cafe_id', $cafeId)
                ->whereIn('order_status', ['paid', 'processing', 'ready', 'completed'])
                ->whereDate('created_at', $date)
                ->sum('grand_total');

            $revenueChart[] = [
                'label' => $date->format('d M'),
                'revenue' => (float) $dayTotal,
            ];
        }

        $topMenus = OrderItem::select('menu_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->whereHas('order', function ($q) use ($cafeId) {
                $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'pending');
            })
            ->with('menu:id,name,category')
            ->groupBy('menu_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        $ownerToken = AiToken::firstOrCreate(
            [
                'cafe_id' => $cafeId,
                'user_id' => $request->user()->id,
                'token_type' => 'owner_assistant',
            ],
            [
                'token_code' => 'OWNER-AI-' . strtoupper(Str::random(6)),
                'quota_limit' => 9999,
                'expires_at' => now()->addYear(),
            ]
        );

        $ownerChatLogs = AiChatLog::where('ai_token_id', $ownerToken->id)->latest()->take(20)->get()->reverse()->values();

        return Inertia::render('Owner/Dashboard', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'today_revenue' => $todayRevenue,
                'total_orders' => $totalOrdersCount,
                'low_stock_count' => $lowStocks->count(),
            ],
            'revenueChart' => $revenueChart,
            'topMenus' => $topMenus,
            'shiftAudits' => CashierShift::with('user')->where('cafe_id', $cafeId)->latest()->take(8)->get(),
            'lowStocks' => $lowStocks,
            'recentOrders' => Order::with(['items.menu', 'payment', 'cashier'])
                ->where('cafe_id', $cafeId)
                ->latest()
                ->take(20)
                ->get(),
            'staffs' => User::where('cafe_id', $cafeId)->get(),
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
            'ownerChatLogs' => $ownerChatLogs,
        ]);
    }

    // Update Pengaturan Kafe, Kuota Token AI, & Password WiFi Struk
    public function updateCafeSettings(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'required|string|max:255',
            'tax_percent' => 'required|numeric|min:0|max:50',
            'ai_quota_per_order' => 'required|integer|min:1|max:50',
            'wifi_password' => 'nullable|string|max:100',
        ]);

        $cafe = $request->user()->cafe;
        $cafe->update([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'settings' => [
                'tax_percent' => (float) $validated['tax_percent'],
                'ai_quota_per_order' => (int) $validated['ai_quota_per_order'],
                'wifi_password' => $validated['wifi_password'] ?? '',
            ],
        ]);

        return back()->with('success', 'Pengaturan Profil Kafe, Kuota AI & Info Struk berhasil disimpan!');
    }

    public function askOwnerAi(Request $request)
    {
        $request->validate(['prompt' => 'required|string|max:500']);
        $user = $request->user();
        $cafeId = $user->cafe_id;

        $ownerToken = AiToken::where('cafe_id', $cafeId)
            ->where('user_id', $user->id)
            ->where('token_type', 'owner_assistant')
            ->firstOrFail();

        $totalRevenue = Order::where('cafe_id', $cafeId)->where('order_status', '!=', 'pending')->sum('grand_total');
        $orderCount = Order::where('cafe_id', $cafeId)->count();
        $stocksSummary = Stock::where('cafe_id', $cafeId)->get()->map(fn($s) => "{$s->name}: {$s->current_qty} {$s->unit}")->implode(', ');
        $menusSummary = Menu::where('cafe_id', $cafeId)->get()->map(fn($m) => "{$m->name} (Rp {$m->price})")->implode(', ');

        $businessContext = "Total Omzet: Rp " . number_format($totalRevenue, 0, ',', '.') .
            " dari {$orderCount} transaksi. Status Stok Gudang: [{$stocksSummary}]. Daftar Menu: [{$menusSummary}].";

        $reply = "Berdasarkan data real-time {$user->cafe->name} saat ini ({$businessContext}), saran strategis untuk pertanyaan Anda \"{$request->prompt}\": Pastikan bahan baku dengan stok rendah segera di-restock dan manfaatkan fitur Voucher Promo pada jam sepi untuk meningkatkan volume transaksi.";

        if (env('GEMINI_API_KEY')) {
            try {
                $response = Http::post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
                    'contents' => [[
                        'parts' => [[
                            'text' => "Kamu adalah AI Business Co-Worker khusus untuk Owner Kafe {$user->cafe->name}. Data operasional kafe saat ini: {$businessContext}. Berikan analisis bisnis yang tajam, praktis, dan ramah dalam bahasa Indonesia untuk pertanyaan Owner berikut: {$request->prompt}"
                        ]]
                    ]]
                ]);
                $reply = $response->json('candidates.0.content.parts.0.text') ?? $reply;
            } catch (\Exception $e) {
            }
        }

        AiChatLog::create([
            'ai_token_id' => $ownerToken->id,
            'prompt' => $request->prompt,
            'response' => $reply,
        ]);

        $ownerToken->increment('quota_used');

        return back();
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $cafeId = $request->user()->cafe_id;
        $orders = Order::with(['payment', 'cashier'])->where('cafe_id', $cafeId)->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="Laporan-Transaksi-CaffeOS-' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Kode Order', 'Antrean', 'Tanggal', 'Nama Pelanggan', 'Tipe Order', 'Metode Bayar', 'Diskon (Rp)', 'Grand Total (Rp)']);

            foreach ($orders as $ord) {
                fputcsv($handle, [
                    $ord->order_code,
                    '#' . $ord->queue_number,
                    $ord->created_at->format('Y-m-d H:i'),
                    $ord->customer_name,
                    strtoupper($ord->order_type),
                    strtoupper($ord->payment?->payment_method ?? '-'),
                    $ord->discount_total,
                    $ord->grand_total,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}

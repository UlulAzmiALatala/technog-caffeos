<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Stock;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OwnerController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        // 1. Data Monitoring Omzet & Operasional
        $paidOrders = Order::where('cafe_id', $cafeId)->whereIn('order_status', ['paid', 'processing', 'ready', 'completed']);
        $totalRevenue = (clone $paidOrders)->sum('grand_total');
        $todayRevenue = (clone $paidOrders)->whereDate('created_at', today())->sum('grand_total');
        $totalOrdersCount = Order::where('cafe_id', $cafeId)->count();
        $lowStocks = Stock::where('cafe_id', $cafeId)->whereColumn('current_qty', '<=', 'min_qty_alert')->get();

        // 2. Pastikan Owner Memiliki Token Khusus untuk "AI Co-Worker for Owner"
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

    // Fitur AI CO-WORKER FOR OWNER (Menganalisis Omzet & Stok Kafe secara Real-Time)
    public function askOwnerAi(Request $request)
    {
        $request->validate(['prompt' => 'required|string|max:500']);
        $user = $request->user();
        $cafeId = $user->cafe_id;

        $ownerToken = AiToken::where('cafe_id', $cafeId)
            ->where('user_id', $user->id)
            ->where('token_type', 'owner_assistant')
            ->firstOrFail();

        // Kumpulkan data bisnis aktual kafe sebagai konteks AI Owner
        $totalRevenue = Order::where('cafe_id', $cafeId)->where('order_status', '!=', 'pending')->sum('grand_total');
        $orderCount = Order::where('cafe_id', $cafeId)->count();
        $stocksSummary = Stock::where('cafe_id', $cafeId)->get()->map(fn($s) => "{$s->name}: {$s->current_qty} {$s->unit}")->implode(', ');
        $menusSummary = Menu::where('cafe_id', $cafeId)->get()->map(fn($m) => "{$m->name} (Rp {$m->price})")->implode(', ');

        $businessContext = "Total Omzet: Rp " . number_format($totalRevenue, 0, ',', '.') .
            " dari {$orderCount} transaksi. Status Stok Gudang: [{$stocksSummary}]. Daftar Menu: [{$menusSummary}].";

        $reply = "Berdasarkan data real-time {$user->cafe->name} saat ini ({$businessContext}), saran strategis untuk pertanyaan Anda \"{$request->prompt}\": Pastikan bahan baku dengan stok rendah segera di-restock dan promosikan paket bundling kopi pada jam sibuk untuk mendongkrak rata-rata nilai transaksi.";

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
                // Gunakan fallback lokal jika API tidak terjangkau
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

    // Fitur EXPORT Laporan Transaksi ke CSV/Excel (Sesuai Flowchart Owner)
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
            fputcsv($handle, ['Kode Order', 'Antrean', 'Tanggal', 'Nama Pelanggan', 'Tipe Order', 'Metode Bayar', 'Status', 'Grand Total (Rp)']);

            foreach ($orders as $ord) {
                fputcsv($handle, [
                    $ord->order_code,
                    '#' . $ord->queue_number,
                    $ord->created_at->format('Y-m-d H:i'),
                    $ord->customer_name,
                    strtoupper($ord->order_type),
                    strtoupper($ord->payment?->payment_method ?? '-'),
                    strtoupper($ord->order_status),
                    $ord->grand_total,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}

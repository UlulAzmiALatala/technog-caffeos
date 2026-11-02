<?php

namespace App\Http\Controllers;

use App\Models\AiToken;
use App\Models\Customer;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PosController extends Controller
{
    // 1. Halaman Utama POS Kasir / Barista / Owner
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        // Pastikan Template ke-3 (Neo-Brutalist Pop) otomatis tersedia di database
        Template::firstOrCreate(
            ['slug' => 'neo-brutal'],
            [
                'name' => 'Neo-Brutalist Pop',
                'layout_config' => ['sidebar' => 'left', 'cardStyle' => 'brutal', 'mode' => 'pop'],
                'is_active' => true,
            ]
        );

        return Inertia::render('Pos/Workspace', [
            'menus' => Menu::with('stocks')
                ->where('cafe_id', $cafeId)
                ->where('is_available', true)
                ->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
            'templates' => Template::where('is_active', true)->get(),
            'recentOrders' => Order::with(['items.menu', 'payment', 'table', 'aiToken'])
                ->where('cafe_id', $cafeId)
                ->latest()
                ->take(15)
                ->get(),
        ]);
    }

    // 2. Ganti Template UI secara Real-Time
    public function switchTemplate(Request $request)
    {
        $request->validate(['template_id' => 'required|exists:templates,id']);
        $request->user()->cafe->update(['template_id' => $request->template_id]);

        return back()->with('success', 'Template UI Kafe berhasil diubah!');
    }

    // 3. Engine Checkout Transaksi (Cash & Online Payment) + Generate AI Token
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:25',
            'table_id' => 'nullable|exists:tables,id',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'payment_method' => 'required|in:cash,qris,va,ewallet',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        $cafeId = $request->user()->cafe_id;

        return DB::transaction(function () use ($validated, $cafeId, $request) {
            // Hitung nomor antrean harian (Call Queue)
            $todayCount = Order::where('cafe_id', $cafeId)->whereDate('created_at', today())->count();
            $queueNumber = $todayCount + 1;

            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $menu = Menu::with('stocks')->findOrFail($item['menu_id']);
                $itemSubtotal = ($menu->price - $menu->discount) * $item['qty'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'menu_id' => $menu->id,
                    'qty' => $item['qty'],
                    'unit_price' => $menu->price,
                    'discount' => $menu->discount,
                    'subtotal' => $itemSubtotal,
                    'notes' => $item['notes'] ?? null,
                ];

                // Potong Stok Bahan Baku Otomatis sesuai Resep (menu_stocks)
                foreach ($menu->stocks as $stock) {
                    $totalNeeded = $stock->pivot->qty_needed * $item['qty'];
                    $stock->decrement('current_qty', $totalNeeded);
                }
            }

            // Simpan atau update data ke tabel customers jika nomor HP diisi
            $customer = null;
            if (!empty($validated['customer_phone'])) {
                $customer = Customer::firstOrCreate(
                    ['cafe_id' => $cafeId, 'phone' => $validated['customer_phone']],
                    [
                        'name' => $validated['customer_name'],
                        'member_code' => 'MBR-' . strtoupper(Str::random(5)),
                    ]
                );
            }

            // A. Simpan Header Order
            $order = Order::create([
                'cafe_id' => $cafeId,
                'customer_id' => $customer?->id,
                'table_id' => $validated['table_id'] ?? null,
                'cashier_id' => $request->user()->id,
                'order_code' => 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'queue_number' => $queueNumber,
                'customer_name' => $validated['customer_name'],
                'order_type' => $validated['order_type'],
                'order_status' => 'paid',
                'subtotal' => $subtotal,
                'grand_total' => $subtotal,
            ]);

            // B. Simpan Detail Item
            $order->items()->createMany($orderItemsData);

            // C. Simpan Pembayaran
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid',
                'amount_paid' => $subtotal,
                'paid_at' => now(),
            ]);

            // D. Generate AI Token Otomatis (Syarat membuka AI Chatbot Co-Worker)
            $aiToken = AiToken::create([
                'cafe_id' => $cafeId,
                'order_id' => $order->id,
                'token_code' => 'AI-' . strtoupper(Str::random(8)),
                'token_type' => 'customer_order',
                'quota_limit' => 5,
                'expires_at' => now()->addHours(4),
            ]);

            return back()->with([
                'success' => "Order #{$order->queue_number} berhasil! Stok terpotong otomatis.",
                'ai_token' => $aiToken->token_code,
            ]);
        });
    }

    // 4. Validasi Pembayaran Tunai (Cash) dari Pelanggan Scan QR -> Terbitkan Token AI
    public function approveCashOrder($orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::with(['items.menu.stocks', 'payment'])->findOrFail($orderId);

            if ($order->order_status !== 'pending') {
                return back();
            }

            // Potong stok bahan baku setelah uang tunai diterima kasir
            foreach ($order->items as $item) {
                foreach ($item->menu->stocks as $stock) {
                    $stock->decrement('current_qty', $stock->pivot->qty_needed * $item->qty);
                }
            }

            $order->update([
                'order_status' => 'paid',
                'cashier_id' => auth()->id(),
            ]);

            $order->payment->update([
                'payment_status' => 'paid',
                'amount_paid' => $order->grand_total,
                'paid_at' => now(),
            ]);

            $aiToken = AiToken::create([
                'cafe_id' => $order->cafe_id,
                'order_id' => $order->id,
                'token_code' => 'AI-' . strtoupper(Str::random(8)),
                'token_type' => 'customer_order',
                'quota_limit' => 5,
                'expires_at' => now()->addHours(4),
            ]);

            return back()->with([
                'success' => "Pembayaran Tunai Order #{$order->queue_number} berhasil divalidasi!",
                'ai_token' => $aiToken->token_code,
            ]);
        });
    }
}

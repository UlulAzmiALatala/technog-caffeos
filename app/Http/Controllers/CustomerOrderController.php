<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\Customer;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CustomerOrderController extends Controller
{
    public function scanTable($qrCode)
    {
        $table = DiningTable::with('cafe.template')->where('qr_code', $qrCode)->firstOrFail();
        $cafeId = $table->cafe_id;

        // Cari 3 ID Menu Paling Laris untuk diberi badge "BEST SELLER" di layar HP Pelanggan
        $bestSellerIds = OrderItem::select('menu_id', DB::raw('SUM(qty) as total_qty'))
            ->whereHas('order', function ($q) use ($cafeId) {
                $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled');
            })
            ->groupBy('menu_id')
            ->orderByDesc('total_qty')
            ->take(3)
            ->pluck('menu_id')
            ->toArray();

        return Inertia::render('Customer/SelfOrder', [
            'cafe' => $table->cafe,
            'table' => $table,
            'menus' => Menu::where('cafe_id', $cafeId)->where('is_available', true)->get(),
            'vouchers' => Voucher::where('cafe_id', $cafeId)
                ->where('is_active', true)
                ->whereColumn('used_count', '<', 'quota')
                ->get(),
            'bestSellerIds' => $bestSellerIds,
            'activeTemplate' => $table->cafe->template->slug ?? 'cyber-dark',
        ]);
    }

    public function submitOrder(Request $request, $qrCode)
    {
        $table = DiningTable::with('cafe')->where('qr_code', $qrCode)->firstOrFail();
        $cafeId = $table->cafe_id;

        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:30',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'payment_method' => 'required|in:cash,qris,ewallet',
            'voucher_id' => 'nullable|exists:vouchers,id',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:100',
        ]);

        return DB::transaction(function () use ($validated, $table, $cafeId) {
            $todayCount = Order::where('cafe_id', $cafeId)->whereDate('created_at', today())->count();
            $queueNumber = $todayCount + 1;

            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $menu = Menu::with('stocks')->findOrFail($item['menu_id']);
                $sub = ($menu->price - $menu->discount) * $item['qty'];
                $subtotal += $sub;

                $itemsData[] = [
                    'menu_id' => $menu->id,
                    'qty' => $item['qty'],
                    'unit_price' => $menu->price,
                    'discount' => $menu->discount,
                    'subtotal' => $sub,
                    'notes' => $item['notes'] ?? null,
                ];

                // Jika bayar non-tunai (QRIS/E-Wallet), otomatis langsung potong stok resep gudang
                if ($validated['payment_method'] !== 'cash') {
                    foreach ($menu->stocks as $stock) {
                        $stock->decrement('current_qty', $stock->pivot->qty_needed * $item['qty']);
                    }
                }
            }

            // Hitung potongan Voucher Promo jika pelanggan memilih voucher di HP
            $discountTotal = 0;
            if (!empty($validated['voucher_id'])) {
                $voucher = Voucher::where('cafe_id', $cafeId)
                    ->where('id', $validated['voucher_id'])
                    ->where('is_active', true)
                    ->first();

                if ($voucher && $subtotal >= $voucher->min_order_amount && $voucher->used_count < $voucher->quota) {
                    $discountTotal = $voucher->discount_type === 'percent'
                        ? round(($subtotal * $voucher->discount_value) / 100)
                        : min($subtotal, $voucher->discount_value);

                    $voucher->increment('used_count');
                }
            }

            $grandTotal = max(0, $subtotal - $discountTotal);

            // Otomatis daftarkan/update Member CRM jika pelanggan mengisi nomor WhatsApp
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

            $isOnlinePaid = $validated['payment_method'] !== 'cash';

            $order = Order::create([
                'cafe_id' => $cafeId,
                'customer_id' => $customer?->id,
                'table_id' => $table->id,
                'order_code' => 'QR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'queue_number' => $queueNumber,
                'customer_name' => $validated['customer_name'],
                'order_type' => $validated['order_type'],
                'order_status' => $isOnlinePaid ? 'paid' : 'pending',
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'grand_total' => $grandTotal,
            ]);

            $order->items()->createMany($itemsData);

            // Jika Dine-In, otomatis ubah status meja di Denah Floor Plan menjadi 'occupied' (Terisi)
            if ($validated['order_type'] === 'dine_in') {
                $table->update(['status' => 'occupied']);
            }

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $isOnlinePaid ? 'paid' : 'unpaid',
                'amount_paid' => $isOnlinePaid ? $grandTotal : 0,
                'paid_at' => $isOnlinePaid ? now() : null,
            ]);

            if ($isOnlinePaid) {
                $quota = (int) ($table->cafe->settings['ai_quota_per_order'] ?? 5);
                AiToken::create([
                    'cafe_id' => $cafeId,
                    'order_id' => $order->id,
                    'token_code' => 'AI-' . strtoupper(Str::random(8)),
                    'token_type' => 'customer_order',
                    'quota_limit' => $quota,
                    'expires_at' => now()->addHours(4),
                ]);
            }

            return redirect()
                ->route('customer.order-status', $order->order_code)
                ->with('success', "Pesanan Antrean #{$order->queue_number} berhasil dikirim ke Dapur Barista!");
        });
    }

    public function orderStatus($orderCode)
    {
        $order = Order::with(['items.menu', 'payment', 'aiToken', 'table', 'cafe.template', 'customer'])
            ->where('order_code', $orderCode)
            ->firstOrFail();

        $chatLogs = $order->aiToken
            ? AiChatLog::where('ai_token_id', $order->aiToken->id)->latest()->get()->reverse()->values()
            : [];

        return Inertia::render('Customer/OrderStatusAndAi', [
            'order' => $order,
            'chatLogs' => $chatLogs,
            'activeTemplate' => $order->cafe?->template?->slug ?? 'cyber-dark',
        ]);
    }

    public function askAi(Request $request)
    {
        $request->validate([
            'token_code' => 'required|string',
            'prompt' => 'required|string|max:800',
        ]);

        $aiToken = AiToken::with(['order.items.menu', 'cafe'])->where('token_code', $request->token_code)->first();

        if (!$aiToken || !$aiToken->isValid()) {
            return back()->withErrors([
                'ai_error' => 'Akses Ditolak: Token AI belum aktif, kuota habis, atau pembayaran belum divalidasi kasir!',
            ]);
        }

        $cafe = $aiToken->cafe;
        $order = $aiToken->order;
        $prompt = trim($request->prompt);
        $qLower = strtolower($prompt);

        $menus = Menu::where('cafe_id', $cafe->id)->where('is_available', true)->get();
        $menuListText = $menus->map(fn($m) => "{$m->name} (Rp " . number_format($m->price, 0, ',', '.') . " - {$m->description})")->implode('; ');
        $vouchersText = Voucher::where('cafe_id', $cafe->id)->where('is_active', true)->get()->map(fn($v) => "{$v->code} ({$v->name})")->implode(', ');
        if (empty($vouchersText)) {
            $vouchersText = 'Belum ada voucher aktif';
        }
        $myItemsText = $order ? $order->items->map(fn($i) => "{$i->qty}x " . ($i->menu ? $i->menu->name : 'Menu'))->implode(', ') : '-';
        $wifiPass = $cafe->settings['wifi_password'] ?? 'kopitechnog123';

        $systemInstruction = "Kamu adalah AI Co-Worker & Teman Nongkrong Pintar untuk pelanggan bernama {$order->customer_name} di kafe '{$cafe->name}'.
Data Pesanan Pelanggan Saat Ini: Antrean #{$order->queue_number}, Status Dapur: " . strtoupper($order->order_status) . ", Item: {$myItemsText}.
Password WiFi Kafe: {$wifiPass}. Promo Aktif: {$vouchersText}. Daftar Menu Kafe: {$menuListText}.

ATURAN MENJAWAB:
1. Jika pelanggan bertanya tentang pesanan mereka, menu kopi, harga, promo, atau WiFi kafe, jawab dengan data akurat di atas.
2. Jika pelanggan bertanya tentang topik umum apa pun (berita politik, tugas kuliah, coding, bisnis, sejarah, sains, atau curhat), jawablah secara bebas, cerdas, mendalam, dan ramah dalam Bahasa Indonesia!";

        $reply = AiAssistantController::callExternalAi($systemInstruction, $prompt);

        if (!$reply) {
            if (preg_match('/\b(status|pesanan|antrean|kapan|lama)\b/i', $qLower)) {
                $reply = "Halo Kak {$order->customer_name}! Pesanan Anda **Antrean #{$order->queue_number}** ({$myItemsText}) saat ini berstatus **" . strtoupper($order->order_status) . "**.";
            } elseif (preg_match('/\b(wifi|internet|password|sandi)\b/i', $qLower)) {
                $reply = "📶 Password Free WiFi di **{$cafe->name}** adalah: **`{$wifiPass}`**.";
            } elseif (preg_match('/\b(promo|diskon|voucher)\b/i', $qLower)) {
                $reply = "🏷️ Promo aktif di **{$cafe->name}**: **{$vouchersText}**.";
            } else {
                $reply = "☕ Halo Kak {$order->customer_name}! Pesanan **#{$order->queue_number}** ({$myItemsText}) sedang berstatus **" . strtoupper($order->order_status) . "**. Password WiFi kami: **`{$wifiPass}`**.";
            }
        }

        AiChatLog::create([
            'ai_token_id' => $aiToken->id,
            'prompt' => $prompt,
            'response' => $reply,
        ]);

        $aiToken->increment('quota_used');

        return back()->with('success', 'AI Co-Worker telah membalas pesan Anda!');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
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

        return Inertia::render('Customer/SelfOrder', [
            'cafe' => $table->cafe,
            'table' => $table,
            'menus' => Menu::where('cafe_id', $table->cafe_id)->where('is_available', true)->get(),
            'activeTemplate' => $table->cafe->template->slug,
        ]);
    }

    public function submitOrder(Request $request, $qrCode)
    {
        $table = DiningTable::where('qr_code', $qrCode)->firstOrFail();

        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'payment_method' => 'required|in:cash,qris,ewallet',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $table) {
            $todayCount = Order::where('cafe_id', $table->cafe_id)->whereDate('created_at', today())->count();
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
                ];

                if ($validated['payment_method'] !== 'cash') {
                    foreach ($menu->stocks as $stock) {
                        $stock->decrement('current_qty', $stock->pivot->qty_needed * $item['qty']);
                    }
                }
            }

            $isOnlinePaid = $validated['payment_method'] !== 'cash';

            $order = Order::create([
                'cafe_id' => $table->cafe_id,
                'table_id' => $table->id,
                'order_code' => 'QR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'queue_number' => $queueNumber,
                'customer_name' => $validated['customer_name'],
                'order_type' => $validated['order_type'],
                'order_status' => $isOnlinePaid ? 'paid' : 'pending',
                'subtotal' => $subtotal,
                'grand_total' => $subtotal,
            ]);

            $order->items()->createMany($itemsData);

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $isOnlinePaid ? 'paid' : 'unpaid',
                'amount_paid' => $isOnlinePaid ? $subtotal : 0,
                'paid_at' => $isOnlinePaid ? now() : null,
            ]);

            if ($isOnlinePaid) {
                $quota = (int) ($table->cafe->settings['ai_quota_per_order'] ?? 5);
                AiToken::create([
                    'cafe_id' => $table->cafe_id,
                    'order_id' => $order->id,
                    'token_code' => 'AI-' . strtoupper(Str::random(8)),
                    'token_type' => 'customer_order',
                    'quota_limit' => $quota,
                    'expires_at' => now()->addHours(4),
                ]);
            }

            return redirect()->route('customer.order-status', $order->order_code);
        });
    }

    public function orderStatus($orderCode)
    {
        $order = Order::with(['items.menu', 'payment', 'aiToken', 'table', 'cafe'])
            ->where('order_code', $orderCode)
            ->firstOrFail();

        $chatLogs = $order->aiToken
            ? AiChatLog::where('ai_token_id', $order->aiToken->id)->latest()->get()
            : [];

        return Inertia::render('Customer/OrderStatusAndAi', [
            'order' => $order,
            'chatLogs' => $chatLogs,
        ]);
    }

    public function askAi(Request $request)
    {
        $request->validate([
            'token_code' => 'required|string',
            'prompt' => 'required|string|max:600',
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
        $vouchersText = Voucher::where('cafe_id', $cafe->id)->where('is_active', true)->get()->map(fn($v) => "{$v->code} ({$v->name})")->implode(', ') ?: 'Belum ada voucher';
        $myItemsText = $order?->items->map(fn($i) => "{$i->qty}x {$i->menu?->name}")->implode(', ') ?? '-';
        $wifiPass = $cafe->settings['wifi_password'] ?? 'kopitechnog123';

        $systemInstruction = "Kamu adalah AI Co-Worker & Teman Nongkrong Pintar untuk pelanggan bernama {$order->customer_name} di kafe '{$cafe->name}'.
Data Pesanan Pelanggan Saat Ini: Antrean #{$order->queue_number}, Status Dapur: " . strtoupper($order->order_status) . ", Item: {$myItemsText}.
Password WiFi Kafe: {$wifiPass}. Promo Aktif: {$vouchersText}. Daftar Menu Kafe: {$menuListText}.

ATURAN MENJAWAB:
1. Jika pelanggan bertanya tentang pesanan mereka, menu kopi, harga, promo, atau WiFi kafe, jawab dengan data kafe di atas.
2. Jika pelanggan bertanya tentang topik umum apa pun (berita politik seperti 'Mengapa Presiden Prabowo disadap?', bantuan tugas kuliah, coding, bisnis, sejarah, atau curhat), jawablah secara bebas, cerdas, mendalam, dan ramah dalam Bahasa Indonesia!";

        // Panggil Gemini / 9Router via Helper Universal
        $reply = AiAssistantController::callExternalAi($systemInstruction, $prompt);

        if (!$reply) {
            if (Str::contains($qLower, ['status', 'pesanan', 'antrean', 'kapan', 'lama'])) {
                $reply = "Halo Kak {$order->customer_name}! Pesanan Anda **Antrean #{$order->queue_number}** ({$myItemsText}) saat ini berstatus **" . strtoupper($order->order_status) . "**.";
            } elseif (Str::contains($qLower, ['wifi', 'internet', 'password', 'sandi'])) {
                $reply = "📶 Password Free WiFi di **{$cafe->name}** adalah: **`{$wifiPass}`**.";
            } elseif (Str::contains($qLower, ['promo', 'diskon', 'voucher'])) {
                $reply = "🏷️ Promo aktif di **{$cafe->name}**: **{$vouchersText}**.";
            } elseif (Str::contains($qLower, ['rekomendasi', 'menu', 'kopi', 'enak', 'harga'])) {
                $reply = "☕ Daftar menu favorit di **{$cafe->name}**:\n" .
                    $menus->map(fn($m) => "• **{$m->name}** (Rp " . number_format($m->price, 0, ',', '.') . "): {$m->description}")->implode("\n");
            } else {
                $reply = "Halo Kak {$order->customer_name}! Pesanan **#{$order->queue_number}** ({$myItemsText}) sedang berstatus **" . strtoupper($order->order_status) . "**. *(Catatan Admin: Pasang `GEMINI_API_KEY` atau `AI_ROUTER_URL` di `.env` agar AI Co-Worker dapat menjawab pertanyaan pengetahuan umum bebas seperti \"{$prompt}\")*.";
            }
        }

        AiChatLog::create([
            'ai_token_id' => $aiToken->id,
            'prompt' => $prompt,
            'response' => $reply,
        ]);

        $aiToken->increment('quota_used');

        return back();
    }
}

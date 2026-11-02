<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Models\AiToken;
use App\Models\Cafe;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CustomerOrderController extends Controller
{
    // 1. Halaman Self-Ordering saat Pelanggan Scan QR Code Meja
    public function scanTable($qrCode)
    {
        $table = DiningTable::with('cafe.template')->where('qr_code', $qrCode)->firstOrFail();
        $cafe = $table->cafe;

        return Inertia::render('Customer/SelfOrder', [
            'cafe' => $cafe,
            'table' => $table,
            'activeTemplate' => $cafe->template->slug ?? 'cyber-dark',
            'menus' => Menu::where('cafe_id', $cafe->id)->where('is_available', true)->get(),
        ]);
    }

    // 2. Proses Checkout dari HP Pelanggan (Online Payment vs Cash)
    public function submitOrder(Request $request, $qrCode)
    {
        $table = DiningTable::where('qr_code', $qrCode)->firstOrFail();

        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'payment_method' => 'required|in:cash,qris',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $table) {
            $cafeId = $table->cafe_id;
            $queueNumber = Order::where('cafe_id', $cafeId)->whereDate('created_at', today())->count() + 1;

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
                ];

                // Jika Online Payment (QRIS), stok langsung dipotong; jika Cash, tunggu validasi kasir
                if ($validated['payment_method'] === 'qris') {
                    foreach ($menu->stocks as $stock) {
                        $stock->decrement('current_qty', $stock->pivot->qty_needed * $item['qty']);
                    }
                }
            }

            // Sesuai Flowchart Gambar 1:
            // Online Payment -> langsung Paid & dapat Token AI
            // Cash -> berstatus Pending (Menunggu Validasi Kasir)
            $isOnlinePaid = $validated['payment_method'] === 'qris';

            $order = Order::create([
                'cafe_id' => $cafeId,
                'table_id' => $table->id,
                'order_code' => 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'queue_number' => $queueNumber,
                'customer_name' => $validated['customer_name'],
                'order_type' => $validated['order_type'],
                'order_status' => $isOnlinePaid ? 'paid' : 'pending',
                'subtotal' => $subtotal,
                'grand_total' => $subtotal,
            ]);

            $order->items()->createMany($orderItemsData);

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $isOnlinePaid ? 'paid' : 'unpaid',
                'amount_paid' => $isOnlinePaid ? $subtotal : 0,
                'paid_at' => $isOnlinePaid ? now() : null,
            ]);

            $tokenCode = null;
            if ($isOnlinePaid) {
                $aiToken = AiToken::create([
                    'cafe_id' => $cafeId,
                    'order_id' => $order->id,
                    'token_code' => 'AI-' . strtoupper(Str::random(8)),
                    'token_type' => 'customer_order',
                    'quota_limit' => 5,
                    'expires_at' => now()->addHours(4),
                ]);
                $tokenCode = $aiToken->token_code;
            }

            return redirect()->route('customer.order-status', $order->order_code)->with([
                'success' => $isOnlinePaid
                    ? 'Pembayaran QRIS Berhasil! Token AI Co-Worker Anda telah aktif.'
                    : 'Pesanan diterima! Silakan bayar tunai di kasir untuk mengaktifkan Token AI.',
                'ai_token' => $tokenCode,
            ]);
        });
    }

    // 3. Halaman Status Order & AI Chatbot Co-Worker (Terkunci jika belum bayar)
    public function orderStatus($orderCode)
    {
        $order = Order::with(['items.menu', 'payment', 'table', 'aiToken', 'cafe'])
            ->where('order_code', $orderCode)
            ->firstOrFail();

        $chatLogs = $order->aiToken
            ? AiChatLog::where('ai_token_id', $order->aiToken->id)->oldest()->get()
            : [];

        return Inertia::render('Customer/OrderStatusAndAi', [
            'order' => $order,
            'chatLogs' => $chatLogs,
        ]);
    }

    // 4. Endpoint Chat dengan AI Chatbot Co-Worker (Memotong Kuota Token AI)
    public function askAi(Request $request)
    {
        $request->validate([
            'token_code' => 'required|exists:ai_tokens,token_code',
            'prompt' => 'required|string|max:500',
        ]);

        $aiToken = AiToken::with('cafe.menus')->where('token_code', $request->token_code)->firstOrFail();

        if ($aiToken->quota_used >= $aiToken->quota_limit || now()->greaterThan($aiToken->expires_at)) {
            return back()->withErrors(['prompt' => 'Kuota Token AI Anda sudah habis atau kedaluwarsa.']);
        }

        // Konteks Katalog Menu Kafe untuk AI Barista
        $menuContext = $aiToken->cafe->menus->map(fn($m) => "{$m->name} (Rp {$m->price}): {$m->description}")->implode('; ');
        $reply = "Sebagai AI Co-Worker {$aiToken->cafe->name}, untuk pertanyaan \"{$request->prompt}\": Kami sangat merekomendasikan menu andalan kami ({$menuContext}). Ada lagi yang bisa saya bantu sembari menunggu pesanan Anda disiapkan Barista?";

        // Jika GEMINI_API_KEY diisi di .env, gunakan respons asli dari Gemini API
        if (env('GEMINI_API_KEY')) {
            try {
                $response = Http::post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
                    'contents' => [[
                        'parts' => [[
                            'text' => "Kamu adalah AI Barista & Co-Worker di kafe {$aiToken->cafe->name}. Daftar menu kafe: {$menuContext}. Jawab pertanyaan pelanggan ini dengan ramah, singkat, dan membantu dalam bahasa Indonesia: {$request->prompt}"
                        ]]
                    ]]
                ]);
                $reply = $response->json('candidates.0.content.parts.0.text') ?? $reply;
            } catch (\Exception $e) {
                // Fallback ke balasan pintar lokal jika koneksi API terkendala
            }
        }

        AiChatLog::create([
            'ai_token_id' => $aiToken->id,
            'prompt' => $request->prompt,
            'response' => $reply,
        ]);

        $aiToken->increment('quota_used');

        return back();
    }
}

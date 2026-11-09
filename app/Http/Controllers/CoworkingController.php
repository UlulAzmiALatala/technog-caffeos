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

class CoworkingController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];

        // Daftar Paket Co-Working Pass & B2B Catering Default
        $packages = $settings['coworking_packages'] ?? [
            [
                'id' => 'pkg-1',
                'name' => ' Half-Day Digital Nomad Pass (4 Jam)',
                'type' => 'coworking',
                'price' => 45000,
                'ai_quota' => 25,
                'duration_hours' => 4,
                'perks' => 'Meja Co-Working + Free 1 Kopi + 25x Kuota AI Co-Worker + High-Speed WiFi',
            ],
            [
                'id' => 'pkg-2',
                'name' => 'Full-Day Executive Co-Working Pass (10 Jam)',
                'type' => 'coworking',
                'price' => 85000,
                'ai_quota' => 60,
                'duration_hours' => 10,
                'perks' => 'Meja VIP Colokan + Free 2 Kopi & Pastry + 60x Kuota AI Co-Worker',
            ],
            [
                'id' => 'pkg-3',
                'name' => 'Paket B2B Coffee Break Meeting (20 Cup)',
                'type' => 'catering',
                'price' => 450000,
                'ai_quota' => 100,
                'duration_hours' => 24,
                'perks' => '20 Cup Signature Kopi Susu + Invoice Resmi Instansi + 100x Team AI Token',
            ],
            [
                'id' => 'pkg-4',
                'name' => 'Paket Corporate Event / Workshop (50 Cup)',
                'type' => 'catering',
                'price' => 1100000,
                'ai_quota' => 250,
                'duration_hours' => 24,
                'perks' => '50 Cup Mixed Coffee & Non-Coffee + Reservasi Area VIP + Faktur Pajak/Invoice',
            ],
        ];

        // Riwayat Transaksi Co-Working & B2B Catering (Yang memiliki Kuota AI >= 20)
        $b2bOrders = Order::with(['payment', 'aiToken', 'table', 'items.menu'])
            ->where('cafe_id', $cafeId)
            ->whereHas('aiToken', fn($q) => $q->where('quota_limit', '>=', 20))
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Coworking/Index', [
            'packages' => $packages,
            'b2bOrders' => $b2bOrders,
            'menus' => Menu::where('cafe_id', $cafeId)->where('is_available', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
            'templates' => Template::where('is_active', true)->get(),
        ]);
    }

    // 1. Tambah Paket Co-Working / Catering Baru
    public function storePackage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'type' => 'required|in:coworking,catering',
            'price' => 'required|numeric|min:10000',
            'ai_quota' => 'required|integer|min:10',
            'perks' => 'required|string|max:255',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $packages = $settings['coworking_packages'] ?? [];

        $packages[] = [
            'id' => 'pkg-' . time(),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'price' => (float) $validated['price'],
            'ai_quota' => (int) $validated['ai_quota'],
            'duration_hours' => $validated['type'] === 'coworking' ? 8 : 24,
            'perks' => $validated['perks'],
        ];

        $settings['coworking_packages'] = $packages;
        $cafe->update(['settings' => $settings]);

        return back()->with('success', "Paket '{$validated['name']}' berhasil ditambahkan ke katalog Co-Working & B2B!");
    }

    // 2. Proses Checkout Paket Co-Working Pass / B2B Catering & Terbitkan High-Quota AI Token + Invoice
    public function checkoutPackage(Request $request)
    {
        $validated = $request->validate([
            'package_name' => 'required|string|max:150',
            'price' => 'required|numeric|min:1000',
            'ai_quota' => 'required|integer|min:10',
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:30',
            'table_id' => 'nullable|exists:tables,id',
            'complimentary_menu_id' => 'nullable|exists:menus,id',
            'complimentary_qty' => 'required|integer|min:1',
            'payment_method' => 'required|in:qris,cash,va',
        ]);

        $user = $request->user();
        $cafeId = $user->cafe_id;

        return DB::transaction(function () use ($validated, $user, $cafeId) {
            $todayCount = Order::where('cafe_id', $cafeId)->whereDate('created_at', today())->count();
            $queueNumber = $todayCount + 1;

            $customer = null;
            if (!empty($validated['customer_phone'])) {
                $customer = Customer::firstOrCreate(
                    ['cafe_id' => $cafeId, 'phone' => $validated['customer_phone']],
                    [
                        'name' => $validated['customer_name'],
                        'member_code' => 'VIP-' . strtoupper(Str::random(5)),
                    ]
                );
            }

            $order = Order::create([
                'cafe_id' => $cafeId,
                'customer_id' => $customer?->id,
                'table_id' => $validated['table_id'] ?: null,
                'cashier_id' => $user->id,
                'order_code' => 'B2B-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'queue_number' => $queueNumber,
                'customer_name' => $validated['customer_name'],
                'order_type' => 'dine_in',
                'order_status' => 'paid',
                'subtotal' => $validated['price'],
                'discount_total' => 0,
                'grand_total' => $validated['price'],
            ]);

            // Jika menyertakan menu minuman pendamping paket, potong stok resepnya otomatis
            if (!empty($validated['complimentary_menu_id'])) {
                $menu = Menu::with('stocks')->find($validated['complimentary_menu_id']);
                if ($menu) {
                    $order->items()->create([
                        'menu_id' => $menu->id,
                        'qty' => $validated['complimentary_qty'],
                        'unit_price' => round($validated['price'] / $validated['complimentary_qty']),
                        'discount' => 0,
                        'subtotal' => $validated['price'],
                        'notes' => $validated['package_name'],
                    ]);

                    foreach ($menu->stocks as $stock) {
                        $stock->decrement('current_qty', $stock->pivot->qty_needed * $validated['complimentary_qty']);
                    }
                }
            }

            if (!empty($validated['table_id'])) {
                DiningTable::where('id', $validated['table_id'])->update(['status' => 'occupied']);
            }

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid',
                'amount_paid' => $validated['price'],
                'change_amount' => 0,
                'paid_at' => now(),
            ]);

            $aiToken = AiToken::create([
                'cafe_id' => $cafeId,
                'order_id' => $order->id,
                'token_code' => 'PRO-AI-' . strtoupper(Str::random(6)),
                'token_type' => 'customer_order',
                'quota_limit' => $validated['ai_quota'],
                'expires_at' => now()->addHours(24),
            ]);

            return back()->with([
                'success' => "Transaksi '{$validated['package_name']}' untuk {$validated['customer_name']} berhasil! Invoice {$order->order_code} siap dicetak.",
                'ai_token' => $aiToken->token_code,
            ]);
        });
    }
}

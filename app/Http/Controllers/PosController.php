<?php

namespace App\Http\Controllers;

use App\Models\AiToken;
use App\Models\CashierShift;
use App\Models\Customer;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Template;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        Template::firstOrCreate(
            ['slug' => 'neo-brutal'],
            [
                'name' => 'Neo-Brutalist Pop',
                'layout_config' => ['sidebar' => 'left', 'cardStyle' => 'brutal', 'mode' => 'pop'],
                'is_active' => true,
            ]
        );

        if (Voucher::where('cafe_id', $cafeId)->count() === 0) {
            Voucher::create([
                'cafe_id' => $cafeId,
                'code' => 'HEMAT20',
                'name' => 'Promo Spesial Diskon 20%',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'min_order_amount' => 15000,
                'quota' => 100,
                'is_active' => true,
            ]);
        }

        $activeShift = CashierShift::with('user')
            ->where('cafe_id', $cafeId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        $shiftStats = [
            'cash_sales' => 0,
            'qris_sales' => 0,
            'expected_cash' => 0,
        ];

        if ($activeShift) {
            // Total penjualan tunai bersih adalah grand_total dari order yang dibayar cash
            $cashSales = Order::where('cafe_id', $cafeId)
                ->where('created_at', '>=', $activeShift->opened_at)
                ->whereHas('payment', function ($q) {
                    $q->where('payment_status', 'paid')->where('payment_method', 'cash');
                })
                ->sum('grand_total');

            $qrisSales = Order::where('cafe_id', $cafeId)
                ->where('created_at', '>=', $activeShift->opened_at)
                ->whereHas('payment', function ($q) {
                    $q->where('payment_status', 'paid')->where('payment_method', '!=', 'cash');
                })
                ->sum('grand_total');

            $shiftStats = [
                'cash_sales' => (float) $cashSales,
                'qris_sales' => (float) $qrisSales,
                'expected_cash' => (float) $activeShift->opening_cash + (float) $cashSales,
            ];
        }

        return Inertia::render('Pos/Workspace', [
            'menus' => Menu::with('stocks')
                ->where('cafe_id', $cafeId)
                ->where('is_available', true)
                ->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
            'templates' => Template::where('is_active', true)->get(),
            'vouchers' => Voucher::where('cafe_id', $cafeId)
                ->where('is_active', true)
                ->whereColumn('used_count', '<', 'quota')
                ->get(),
            'recentOrders' => Order::with(['items.menu', 'payment', 'table', 'aiToken'])
                ->where('cafe_id', $cafeId)
                ->latest()
                ->take(15)
                ->get(),
            'activeShift' => $activeShift,
            'shiftStats' => $shiftStats,
            'shiftHistory' => CashierShift::with('user')
                ->where('cafe_id', $cafeId)
                ->latest()
                ->take(15)
                ->get(),
        ]);
    }

    // Halaman Layar TV Monitor Antrean Live (Dapur Proses vs Siap Saji)
    public function queueBoard(Request $request)
    {
        $cafe = $request->user()->cafe;

        return Inertia::render('Pos/QueueBoard', [
            'cafe' => $cafe,
            'processingOrders' => Order::where('cafe_id', $cafe->id)
                ->whereIn('order_status', ['paid', 'processing'])
                ->whereDate('created_at', today())
                ->oldest()
                ->get(),
            'readyOrders' => Order::where('cafe_id', $cafe->id)
                ->where('order_status', 'ready')
                ->whereDate('created_at', today())
                ->latest('updated_at')
                ->get(),
        ]);
    }

    public function openShift(Request $request)
    {
        $validated = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $cafeId = $request->user()->cafe_id;

        $existing = CashierShift::where('cafe_id', $cafeId)->where('status', 'open')->first();
        if ($existing) {
            return back()->with('success', 'Shift kasir sudah terbuka.');
        }

        CashierShift::create([
            'cafe_id' => $cafeId,
            'user_id' => $request->user()->id,
            'opening_cash' => $validated['opening_cash'],
            'expected_cash' => $validated['opening_cash'],
            'status' => 'open',
            'notes' => $validated['notes'] ?? null,
            'opened_at' => now(),
        ]);

        return back()->with(
            'success',
            'Shift Kasir berhasil dibuka dengan Modal Awal Rp ' . number_format($validated['opening_cash'], 0, ',', '.')
        );
    }

    public function closeShift(Request $request)
    {
        $validated = $request->validate([
            'actual_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $cafeId = $request->user()->cafe_id;

        $activeShift = CashierShift::where('cafe_id', $cafeId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->firstOrFail();

        $cashSales = Order::where('cafe_id', $cafeId)
            ->where('created_at', '>=', $activeShift->opened_at)
            ->whereHas('payment', function ($q) {
                $q->where('payment_status', 'paid')->where('payment_method', 'cash');
            })
            ->sum('grand_total');

        $qrisSales = Order::where('cafe_id', $cafeId)
            ->where('created_at', '>=', $activeShift->opened_at)
            ->whereHas('payment', function ($q) {
                $q->where('payment_status', 'paid')->where('payment_method', '!=', 'cash');
            })
            ->sum('grand_total');

        $expectedCash = (float) $activeShift->opening_cash + (float) $cashSales;
        $actualCash = (float) $validated['actual_cash'];
        $difference = $actualCash - $expectedCash;

        $activeShift->update([
            'total_cash_sales' => $cashSales,
            'total_qris_sales' => $qrisSales,
            'expected_cash' => $expectedCash,
            'actual_cash' => $actualCash,
            'difference' => $difference,
            'status' => 'closed',
            'notes' => $validated['notes'] ?? $activeShift->notes,
            'closed_at' => now(),
        ]);

        $statusText = $difference == 0
            ? 'BALANCE (Sesuai)'
            : ($difference < 0 ? 'MINUS Rp ' . number_format(abs($difference), 0, ',', '.') : 'SURPLUS Rp ' . number_format($difference, 0, ',', '.'));

        return back()->with('success', "Shift Kasir resmi ditutup! Status Laci: {$statusText}.");
    }

    public function switchTemplate(Request $request)
    {
        $request->validate(['template_id' => 'required|exists:templates,id']);
        $request->user()->cafe->update(['template_id' => $request->template_id]);

        return back()->with('success', 'Template UI Kafe berhasil diubah!');
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:25',
            'table_id' => 'nullable|exists:tables,id',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'payment_method' => 'required|in:cash,qris,va,ewallet',
            'voucher_id' => 'nullable|exists:vouchers,id',
            'cash_received' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        $cafeId = $request->user()->cafe_id;
        $cafeSettings = $request->user()->cafe->settings ?? [];
        $aiQuotaLimit = (int) ($cafeSettings['ai_quota_per_order'] ?? 5);

        return DB::transaction(function () use ($validated, $cafeId, $aiQuotaLimit, $request) {
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

                foreach ($menu->stocks as $stock) {
                    $totalNeeded = $stock->pivot->qty_needed * $item['qty'];
                    $stock->decrement('current_qty', $totalNeeded);
                }
            }

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
            $amountPaid = $validated['payment_method'] === 'cash' && !empty($validated['cash_received'])
                ? max($grandTotal, (float) $validated['cash_received'])
                : $grandTotal;
            $changeAmount = max(0, $amountPaid - $grandTotal);

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
                'discount_total' => $discountTotal,
                'grand_total' => $grandTotal,
            ]);

            $order->items()->createMany($orderItemsData);

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid',
                'amount_paid' => $amountPaid,
                'change_amount' => $changeAmount,
                'paid_at' => now(),
            ]);

            $aiToken = AiToken::create([
                'cafe_id' => $cafeId,
                'order_id' => $order->id,
                'token_code' => 'AI-' . strtoupper(Str::random(8)),
                'token_type' => 'customer_order',
                'quota_limit' => $aiQuotaLimit,
                'expires_at' => now()->addHours(4),
            ]);

            return back()->with([
                'success' => "Order #{$order->queue_number} berhasil! " . ($changeAmount > 0 ? "Kembalian Tunai: Rp " . number_format($changeAmount, 0, ',', '.') : ""),
                'ai_token' => $aiToken->token_code,
            ]);
        });
    }

    public function approveCashOrder($orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::with(['items.menu.stocks', 'payment'])->findOrFail($orderId);

            if ($order->order_status !== 'pending') {
                return back();
            }

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
                'success' => "Pembayaran Tunai Order #{$order->queue_number} berhasil divalidasi & masuk ke Laci Shift!",
                'ai_token' => $aiToken->token_code,
            ]);
        });
    }
}

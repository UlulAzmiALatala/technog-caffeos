<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        // 1. ANALISIS HEATMAP JAM SIBUK (PEAK HOURS DISTRIBUTION)
        $validOrders = Order::where('cafe_id', $cafeId)
            ->where('order_status', '!=', 'cancelled')
            ->get();

        $hourlySlots = [
            '08:00 - 10:00' => ['label' => '08:00 - 10:00 (Morning Coffee)', 'orders' => 0, 'revenue' => 0],
            '11:00 - 13:00' => ['label' => '11:00 - 13:00 (Lunch Rush)', 'orders' => 0, 'revenue' => 0],
            '14:00 - 16:00' => ['label' => '14:00 - 16:00 (Afternoon Co-Work)', 'orders' => 0, 'revenue' => 0],
            '17:00 - 19:00' => ['label' => '17:00 - 19:00 (After Office)', 'orders' => 0, 'revenue' => 0],
            '20:00 - 23:00' => ['label' => '20:00 - 23:00 (Night Hangout)', 'orders' => 0, 'revenue' => 0],
        ];

        foreach ($validOrders as $ord) {
            $hour = (int) $ord->created_at->format('H');
            $slotKey = match (true) {
                $hour < 11 => '08:00 - 10:00',
                $hour < 14 => '11:00 - 13:00',
                $hour < 17 => '14:00 - 16:00',
                $hour < 20 => '17:00 - 19:00',
                default => '20:00 - 23:00',
            };

            $hourlySlots[$slotKey]['orders'] += 1;
            $hourlySlots[$slotKey]['revenue'] += (float) $ord->grand_total;
        }

        // 2. PREDIKSI HABISNYA STOK (STOCK BURN-RATE & RUN-OUT FORECASTING)
        $activeDaysCount = max(1, $validOrders->groupBy(fn($o) => $o->created_at->format('Y-m-d'))->count());

        $orderItems = OrderItem::with('menu.stocks')
            ->whereHas('order', fn($q) => $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled'))
            ->get();

        // Hitung total konsumsi per stock_id
        $consumedByStock = [];
        foreach ($orderItems as $item) {
            if ($item->menu && $item->menu->stocks) {
                foreach ($item->menu->stocks as $st) {
                    $used = (float) $st->pivot->qty_needed * (int) $item->qty;
                    $consumedByStock[$st->id] = ($consumedByStock[$st->id] ?? 0) + $used;
                }
            }
        }

        $stockForecasts = Stock::where('cafe_id', $cafeId)->get()->map(function ($st) use ($consumedByStock, $activeDaysCount) {
            $totalUsed = (float) ($consumedByStock[$st->id] ?? 0);
            // Jika belum banyak histori, gunakan estimasi konsumsi harian minimum dari resep
            $dailyBurnRate = $totalUsed > 0
                ? round($totalUsed / $activeDaysCount, 1)
                : ($st->unit === 'pcs' ? 15 : 150);

            $daysRemaining = $dailyBurnRate > 0
                ? (int) floor((float) $st->current_qty / $dailyBurnRate)
                : 99;

            $recommendedOrderQty = max(0, round(($dailyBurnRate * 14) - (float) $st->current_qty));

            return [
                'id' => $st->id,
                'name' => $st->name,
                'unit' => $st->unit,
                'current_qty' => (float) $st->current_qty,
                'daily_burn_rate' => $dailyBurnRate,
                'days_remaining' => $daysRemaining,
                'recommended_po_qty' => $recommendedOrderQty,
                'urgency' => $daysRemaining <= 3 ? 'CRITICAL' : ($daysRemaining <= 7 ? 'WARNING' : 'SAFE'),
            ];
        })->sortBy('days_remaining')->values();

        // 3. DATA DASAR UNTUK WHAT-IF PROFIT SIMULATOR
        $totalRevenue = (float) $validOrders->sum('grand_total');
        $totalOrders = max(1, $validOrders->count());
        $avgOrderValue = round($totalRevenue / $totalOrders);
        $dailyAvgOrders = max(5, round($totalOrders / $activeDaysCount));
        $monthlyExpenses = (float) Expense::where('cafe_id', $cafeId)->sum('amount') ?: 4500000;

        return Inertia::render('Analytics/Index', [
            'hourlyHeatmap' => array_values($hourlySlots),
            'stockForecasts' => $stockForecasts,
            'baselineMetrics' => [
                'avg_order_value' => $avgOrderValue ?: 35000,
                'daily_avg_orders' => $dailyAvgOrders,
                'monthly_fixed_expenses' => $monthlyExpenses,
                'menus_count' => Menu::where('cafe_id', $cafeId)->count(),
            ],
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }
}

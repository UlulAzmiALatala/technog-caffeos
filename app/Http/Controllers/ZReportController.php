<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ZReportController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $period = $request->query('period', 'all'); // 'today' | 'month' | 'all'

        $ordersQuery = Order::where('cafe_id', $cafeId);
        $expensesQuery = Expense::where('cafe_id', $cafeId);

        if ($period === 'today') {
            $ordersQuery->whereDate('created_at', today());
            $expensesQuery->whereDate('expense_date', today());
        } elseif ($period === 'month') {
            $ordersQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
            $expensesQuery->whereMonth('expense_date', now()->month)->whereYear('expense_date', now()->year);
        }

        $allOrders = (clone $ordersQuery)->with('payment')->get();
        $validOrders = $allOrders->where('order_status', '!=', 'cancelled');
        $voidedOrders = $allOrders->where('order_status', 'cancelled');

        $grossSubtotal = (float) $validOrders->sum('subtotal');
        $totalDiscount = (float) $validOrders->sum('discount_total');
        $netSalesRevenue = (float) $validOrders->sum('grand_total');

        // Pajak Daerah Restoran (PB1 Default 10%)
        $taxPercent = (float) ($cafe->settings['tax_percent'] ?? 10);
        $estimatedTaxAmount = round($netSalesRevenue * ($taxPercent / (100 + $taxPercent)));
        $revenueBeforeTax = $netSalesRevenue - $estimatedTaxAmount;

        // Rekapitulasi per Metode Pembayaran
        $paymentBreakdown = [
            'qris' => 0,
            'cash' => 0,
            'ewallet' => 0,
            'va' => 0,
        ];

        foreach ($validOrders as $ord) {
            $method = $ord->payment?->payment_method ?? 'cash';
            if (isset($paymentBreakdown[$method])) {
                $paymentBreakdown[$method] += (float) $ord->grand_total;
            }
        }

        // Rekapitulasi per Tipe Layanan
        $orderTypeBreakdown = [
            'dine_in' => $validOrders->where('order_type', 'dine_in')->count(),
            'takeaway' => $validOrders->where('order_type', 'takeaway')->count(),
            'delivery' => $validOrders->where('order_type', 'delivery')->count(),
        ];

        // Rincian Pengeluaran Operasional per Kategori
        $expenses = $expensesQuery->get();
        $totalExpenses = (float) $expenses->sum('amount');
        $expensesByCategory = $expenses->groupBy('category')->map(fn($group) => (float) $group->sum('amount'));

        $netProfit = $revenueBeforeTax - $totalExpenses;

        // Top 5 Menu Terjual
        $topItems = OrderItem::select('menu_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->whereHas('order', function ($q) use ($cafeId, $period) {
                $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled');
                if ($period === 'today') {
                    $q->whereDate('created_at', today());
                } elseif ($period === 'month') {
                    $q->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
                }
            })
            ->with('menu:id,name,category')
            ->groupBy('menu_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        $latestShifts = CashierShift::with('user')
            ->where('cafe_id', $cafeId)
            ->latest('opened_at')
            ->take(5)
            ->get();

        return Inertia::render('Reports/Index', [
            'cafe' => $cafe,
            'currentPeriod' => $period,
            'summary' => [
                'valid_orders_count' => $validOrders->count(),
                'voided_orders_count' => $voidedOrders->count(),
                'voided_amount' => (float) $voidedOrders->sum('grand_total'),
                'gross_subtotal' => $grossSubtotal,
                'total_discount' => $totalDiscount,
                'net_sales_revenue' => $netSalesRevenue,
                'tax_percent' => $taxPercent,
                'estimated_tax_pb1' => $estimatedTaxAmount,
                'revenue_before_tax' => $revenueBeforeTax,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
            ],
            'paymentBreakdown' => $paymentBreakdown,
            'orderTypeBreakdown' => $orderTypeBreakdown,
            'expensesByCategory' => $expensesByCategory,
            'topItems' => $topItems,
            'latestShifts' => $latestShifts,
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }
}

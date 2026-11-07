<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;
        $dateFilter = $request->input('date');
        $statusFilter = $request->input('status', 'ALL');

        // Query Riwayat Order dengan Filter Tanggal & Status
        $ordersQuery = Order::with(['items.menu', 'payment', 'table', 'cashier', 'aiToken'])
            ->where('cafe_id', $cafeId);

        if ($dateFilter) {
            $ordersQuery->whereDate('created_at', $dateFilter);
        }

        if ($statusFilter !== 'ALL') {
            $ordersQuery->where('order_status', $statusFilter);
        }

        // Kalkulasi Ringkasan Keuangan (Laba Rugi Kafe)
        $validOrders = Order::where('cafe_id', $cafeId)
            ->whereIn('order_status', ['paid', 'processing', 'ready', 'completed']);

        $grossRevenue = (clone $validOrders)->sum('subtotal');
        $totalDiscount = (clone $validOrders)->sum('discount_total');
        $netSales = (clone $validOrders)->sum('grand_total');
        $totalExpenses = Expense::where('cafe_id', $cafeId)->sum('amount');
        $netProfit = $netSales - $totalExpenses;

        return Inertia::render('Finance/Index', [
            'summary' => [
                'gross_revenue' => (float) $grossRevenue,
                'total_discount' => (float) $totalDiscount,
                'net_sales' => (float) $netSales,
                'total_expenses' => (float) $totalExpenses,
                'net_profit' => (float) $netProfit,
            ],
            'filters' => [
                'date' => $dateFilter ?? '',
                'status' => $statusFilter,
            ],
            'orders' => $ordersQuery->latest()->take(50)->get(),
            'expenses' => Expense::with('user')->where('cafe_id', $cafeId)->latest('expense_date')->latest()->take(30)->get(),
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Catat Pengeluaran Operasional Baru (Kas Keluar)
    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:1',
            'payment_source' => 'required|in:cash_drawer,bank_transfer',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string|max:255',
        ]);

        Expense::create([
            'cafe_id' => $request->user()->cafe_id,
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return back()->with('success', "Pengeluaran '{$validated['title']}' berhasil dicatat ke pembukuan!");
    }

    public function destroyExpense(Expense $expense)
    {
        $expense->delete();
        return back()->with('success', 'Data pengeluaran berhasil dihapus.');
    }

    // 2. Void / Batalkan Pesanan & Kembalikan Stok Bahan Baku Otomatis ke Gudang
    public function voidOrder(Order $order)
    {
        if ($order->order_status === 'cancelled') {
            return back();
        }

        return DB::transaction(function () use ($order) {
            $order->load(['items.menu.stocks', 'payment']);

            // Jika sebelumnya sudah lunas, kembalikan stok resep ke tabel stocks
            if ($order->order_status !== 'pending') {
                foreach ($order->items as $item) {
                    if ($item->menu && $item->menu->stocks) {
                        foreach ($item->menu->stocks as $stock) {
                            $restoreQty = $stock->pivot->qty_needed * $item->qty;
                            $stock->increment('current_qty', $restoreQty);
                        }
                    }
                }
            }

            $order->update(['order_status' => 'cancelled']);

            if ($order->payment) {
                $order->payment->update(['payment_status' => 'refunded']);
            }

            return back()->with(
                'success',
                "Order #{$order->queue_number} ({$order->order_code}) berhasil di-VOID & stok bahan baku telah dikembalikan ke gudang!"
            );
        });
    }
}

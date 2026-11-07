<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\Stock;
use App\Models\StockLog;
use App\Models\Supplier;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        // Buat 1 Supplier Starter jika belum ada
        if (Supplier::where('cafe_id', $cafeId)->count() === 0) {
            Supplier::create([
                'cafe_id' => $cafeId,
                'name' => 'PT Nusantara Coffee Roasters',
                'contact_person' => 'Bpk. Hendra',
                'phone' => '081122334455',
                'category' => 'Biji Kopi & Sirup',
                'address' => 'Kawasan Industri Blok C, Yogyakarta',
            ]);
        }

        return Inertia::render('Inventory/Index', [
            'stocks' => Stock::where('cafe_id', $cafeId)->orderBy('name')->get(),
            'suppliers' => Supplier::where('cafe_id', $cafeId)->latest()->get(),
            'stockLogs' => StockLog::with(['stock', 'supplier', 'user'])
                ->where('cafe_id', $cafeId)
                ->latest()
                ->take(35)
                ->get(),
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Tambah Supplier Bahan Baku Baru
    public function storeSupplier(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'required|string|max:30',
            'category' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
        ]);

        Supplier::create([
            'cafe_id' => $request->user()->cafe_id,
            ...$validated,
        ]);

        return back()->with('success', "Supplier '{$validated['name']}' berhasil ditambahkan!");
    }

    public function destroySupplier(Supplier $supplier)
    {
        $supplier->delete();
        return back()->with('success', 'Data supplier berhasil dihapus.');
    }

    // 2. Catat Mutasi Stok: Belanja PO Masuk / Stock Opname / Barang Rusak (Waste)
    public function storeStockLog(Request $request)
    {
        $validated = $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'type' => 'required|in:purchase_in,opname_adjustment,waste_out',
            'qty' => 'required|numeric|min:0.1',
            'total_cost' => 'nullable|numeric|min:0',
            'record_expense' => 'nullable|boolean',
            'notes' => 'nullable|string|max:255',
        ]);

        $cafeId = $request->user()->cafe_id;
        $userId = $request->user()->id;

        return DB::transaction(function () use ($validated, $cafeId, $userId) {
            $stock = Stock::where('cafe_id', $cafeId)->findOrFail($validated['stock_id']);

            // Jika waste_out (barang tumpah/basi), maka qty_change bernilai negatif (mengurangi stok)
            $qtyChange = $validated['type'] === 'waste_out'
                ? -abs((float) $validated['qty'])
                : abs((float) $validated['qty']);

            if ($validated['type'] === 'opname_adjustment') {
                // Jika Stock Opname, nilai qty yang diinput adalah selisih hasil hitung fisik
                $stock->increment('current_qty', $qtyChange);
            } elseif ($validated['type'] === 'waste_out') {
                $stock->decrement('current_qty', abs($qtyChange));
            } else {
                // Purchase Order Masuk
                $stock->increment('current_qty', $qtyChange);
            }

            $totalCost = (float) ($validated['total_cost'] ?? 0);

            StockLog::create([
                'cafe_id' => $cafeId,
                'stock_id' => $stock->id,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'user_id' => $userId,
                'type' => $validated['type'],
                'qty_change' => $qtyChange,
                'total_cost' => $totalCost,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Jika Belanja PO Masuk dan dicentang catat ke pengeluaran Keuangan (Expenses)
            if ($validated['type'] === 'purchase_in' && !empty($validated['record_expense']) && $totalCost > 0) {
                Expense::create([
                    'cafe_id' => $cafeId,
                    'user_id' => $userId,
                    'title' => "Belanja PO Stok: {$stock->name} (+{$qtyChange} {$stock->unit})",
                    'category' => 'Belanja Stok PO Supplier',
                    'amount' => $totalCost,
                    'payment_source' => 'bank_transfer',
                    'expense_date' => today(),
                    'notes' => $validated['notes'] ?? 'Otomatis tercatat dari modul Supply Chain PO',
                ]);
            }

            return back()->with(
                'success',
                "Mutasi stok {$stock->name} ({$validated['type']}) berhasil disimpan! Stok gudang otomatis diperbarui."
            );
        });
    }
}

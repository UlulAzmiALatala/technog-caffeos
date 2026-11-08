<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Models\StockLog;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MenuEngineeringController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];

        // Ambil harga modal per unit (gram/ml/pcs) dari settings atau estimasi otomatis
        $stockUnitCosts = $settings['stock_unit_costs'] ?? [];

        $stocks = Stock::where('cafe_id', $cafeId)->orderBy('name')->get()->map(function ($st) use ($stockUnitCosts, $cafeId) {
            // Jika belum diatur manual, cek dari rata-rata Purchase Order terakhir atau beri nilai default wajar
            if (isset($stockUnitCosts[$st->id])) {
                $unitCost = (float) $stockUnitCosts[$st->id];
            } else {
                $lastPo = StockLog::where('cafe_id', $cafeId)
                    ->where('stock_id', $st->id)
                    ->where('type', 'purchase_in')
                    ->where('qty_change', '>', 0)
                    ->where('total_cost', '>', 0)
                    ->latest()
                    ->first();

                $unitCost = $lastPo
                    ? round($lastPo->total_cost / $lastPo->qty_change, 2)
                    : ($st->unit === 'pcs' ? 800 : 25); // Default Rp 25/gram atau Rp 800/pcs cup
            }

            return [
                'id' => $st->id,
                'name' => $st->name,
                'unit' => $st->unit,
                'current_qty' => (float) $st->current_qty,
                'unit_cost' => $unitCost,
            ];
        });

        $stockCostMap = $stocks->pluck('unit_cost', 'id');

        // Hitung total kuantitas terjual per menu
        $salesByMenu = OrderItem::select('menu_id', DB::raw('SUM(qty) as total_sold'))
            ->whereHas('order', function ($q) use ($cafeId) {
                $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled');
            })
            ->groupBy('menu_id')
            ->pluck('total_sold', 'menu_id');

        // Kalkulasi HPP (COGS), Margin, dan Profit per Menu
        $menusRaw = Menu::with('stocks')->where('cafe_id', $cafeId)->get()->map(function ($menu) use ($stockCostMap, $salesByMenu) {
            $hpp = 0;
            $recipeBreakdown = [];

            foreach ($menu->stocks as $st) {
                $costPerUnit = (float) ($stockCostMap[$st->id] ?? 25);
                $qtyNeeded = (float) $st->pivot->qty_needed;
                $ingredientCost = round($costPerUnit * $qtyNeeded);
                $hpp += $ingredientCost;

                $recipeBreakdown[] = [
                    'stock_name' => $st->name,
                    'qty_needed' => $qtyNeeded,
                    'unit' => $st->unit,
                    'cost' => $ingredientCost,
                ];
            }

            $sellingPrice = (float) $menu->price - (float) $menu->discount;
            $grossProfit = $sellingPrice - $hpp;
            $marginPercent = $sellingPrice > 0 ? round(($grossProfit / $sellingPrice) * 100, 1) : 0;
            $qtySold = (int) ($salesByMenu[$menu->id] ?? 0);

            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'category' => $menu->category,
                'price' => (float) $menu->price,
                'selling_price' => $sellingPrice,
                'hpp' => $hpp,
                'gross_profit' => $grossProfit,
                'margin_percent' => $marginPercent,
                'qty_sold' => $qtySold,
                'total_profit_contribution' => $grossProfit * $qtySold,
                'recipe_breakdown' => $recipeBreakdown,
            ];
        });

        // Hitung nilai rata-rata untuk membagi 4 Kuadran Matriks Menu Engineering
        $avgQtySold = $menusRaw->avg('qty_sold') ?: 1;
        $avgGrossProfit = $menusRaw->avg('gross_profit') ?: 5000;

        $engineeredMenus = $menusRaw->map(function ($m) use ($avgQtySold, $avgGrossProfit) {
            $highPop = $m['qty_sold'] >= $avgQtySold;
            $highProf = $m['gross_profit'] >= $avgGrossProfit;

            if ($highPop && $highProf) {
                $quadrant = 'STAR';
                $advice = 'Pertahankan kualitas & stok! Ini menu primadona kafe Anda.';
            } elseif ($highPop && !$highProf) {
                $quadrant = 'PLOWHORSE';
                $advice = 'Sangat laris tapi margin tipis. Naikkan harga Rp 2.000 atau efisiensi takaran resep.';
            } elseif (!$highPop && $highProf) {
                $quadrant = 'PUZZLE';
                $advice = 'Untung per cup besar tapi jarang dipesan. Buat promo bundling atau pasang di banner kasir!';
            } else {
                $quadrant = 'DOG';
                $advice = 'Kurang laris & margin rendah. Evaluasi rasa atau ganti dengan varian menu baru.';
            }

            return array_merge($m, [
                'quadrant' => $quadrant,
                'advice' => $advice,
            ]);
        });

        return Inertia::render('MenuEngineering/Index', [
            'stocks' => $stocks,
            'engineeredMenus' => $engineeredMenus,
            'benchmarks' => [
                'avg_qty_sold' => round($avgQtySold, 1),
                'avg_gross_profit' => round($avgGrossProfit),
                'avg_margin' => round($engineeredMenus->avg('margin_percent') ?? 0, 1),
            ],
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Simpan Harga Modal Bahan Baku per Satuan (gram/ml/pcs)
    public function updateStockCosts(Request $request)
    {
        $validated = $request->validate([
            'costs' => 'required|array',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $settings['stock_unit_costs'] = $validated['costs'];
        $cafe->update(['settings' => $settings]);

        return back()->with('success', 'Harga modal satuan bahan baku berhasil diperbarui! Kalkulasi HPP seluruh menu telah disinkronkan.');
    }

    // 2. Sesuaikan Harga Jual Menu Langsung dari Matriks
    public function updateMenuPrice(Request $request, Menu $menu)
    {
        $request->validate(['price' => 'required|numeric|min:1000']);
        $menu->update(['price' => $request->price]);

        return back()->with('success', "Harga jual '{$menu->name}' berhasil disesuaikan menjadi Rp " . number_format($request->price, 0, ',', '.'));
    }
}

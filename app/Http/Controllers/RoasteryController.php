<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Stock;
use App\Models\StockLog;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoasteryController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];

        // Daftar Riwayat Batch Roasting Biji Kopi
        $roastBatches = $settings['roast_batches'] ?? [
            [
                'id' => 'rst-1',
                'batch_code' => 'BATCH-202611-01',
                'bean_origin' => 'Arabika Gayo Wine Process',
                'roast_level' => 'Medium',
                'green_weight_gram' => 5000,
                'roasted_weight_gram' => 4200,
                'shrinkage_percent' => 16.0,
                'roast_temp_celsius' => 208,
                'duration_minutes' => 12.5,
                'roaster_name' => $request->user()->name,
                'roasted_at' => now()->subDays(2)->format('d M Y H:i'),
            ],
            [
                'id' => 'rst-2',
                'batch_code' => 'BATCH-202611-02',
                'bean_origin' => 'House Blend Toraja x Kintamani',
                'roast_level' => 'Medium-Dark',
                'green_weight_gram' => 6000,
                'roasted_weight_gram' => 4950,
                'shrinkage_percent' => 17.5,
                'roast_temp_celsius' => 214,
                'duration_minutes' => 14.0,
                'roaster_name' => $request->user()->name,
                'roasted_at' => now()->subDay()->format('d M Y H:i'),
            ],
        ];

        // Daftar Log Kalibrasi Dial-In Espresso & Cupping QC Barista
        $dialInLogs = $settings['dial_in_logs'] ?? [
            [
                'id' => 'dl-1',
                'bean_name' => 'House Blend Toraja x Kintamani',
                'grind_setting' => '2.4 (Fine Espresso)',
                'dose_in_gram' => 18.0,
                'yield_out_gram' => 36.0,
                'brew_ratio' => '1 : 2.0',
                'time_seconds' => 28,
                'sca_score' => 86.5,
                'tasting_notes' => 'Dark chocolate, caramel sweetness, medium acidity, thick crema',
                'barista_name' => $request->user()->name,
                'logged_at' => now()->format('d M Y H:i'),
            ],
        ];

        return Inertia::render('Roastery/Index', [
            'roastBatches' => $roastBatches,
            'dialInLogs' => $dialInLogs,
            'stocks' => Stock::where('cafe_id', $cafeId)->orderBy('name')->get(),
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Simpan Batch Roasting Baru & Otomatis Tambahkan Hasil Biji Kopi Matang ke Stok Gudang
    public function storeRoastBatch(Request $request)
    {
        $validated = $request->validate([
            'bean_origin' => 'required|string|max:150',
            'roast_level' => 'required|string|max:50',
            'green_weight_gram' => 'required|numeric|min:100',
            'roasted_weight_gram' => 'required|numeric|min:50',
            'roast_temp_celsius' => 'required|numeric|min:150|max:260',
            'duration_minutes' => 'required|numeric|min:5|max:40',
            'target_stock_id' => 'nullable|exists:stocks,id',
        ]);

        $user = $request->user();
        $cafe = $user->cafe;
        $settings = $cafe->settings ?? [];
        $batches = $settings['roast_batches'] ?? [];

        $green = (float) $validated['green_weight_gram'];
        $roasted = (float) $validated['roasted_weight_gram'];
        $shrinkage = $green > 0 ? round((($green - $roasted) / $green) * 100, 1) : 0;

        $batchCode = 'BATCH-' . now()->format('ymd') . '-' . rand(10, 99);

        array_unshift($batches, [
            'id' => 'rst-' . time(),
            'batch_code' => $batchCode,
            'bean_origin' => $validated['bean_origin'],
            'roast_level' => $validated['roast_level'],
            'green_weight_gram' => $green,
            'roasted_weight_gram' => $roasted,
            'shrinkage_percent' => $shrinkage,
            'roast_temp_celsius' => (float) $validated['roast_temp_celsius'],
            'duration_minutes' => (float) $validated['duration_minutes'],
            'roaster_name' => $user->name,
            'roasted_at' => now()->format('d M Y H:i'),
        ]);

        $settings['roast_batches'] = array_slice($batches, 0, 30);
        $cafe->update(['settings' => $settings]);

        // Jika memilih target stok biji kopi di gudang, otomatis tambahkan stok hasil sangrai!
        if (!empty($validated['target_stock_id'])) {
            $stock = Stock::where('cafe_id', $cafe->id)->find($validated['target_stock_id']);
            if ($stock) {
                $stock->increment('current_qty', $roasted);

                StockLog::create([
                    'cafe_id' => $cafe->id,
                    'stock_id' => $stock->id,
                    'user_id' => $user->id,
                    'type' => 'purchase_in',
                    'qty_change' => $roasted,
                    'total_cost' => 0,
                    'notes' => "Hasil Roastery {$batchCode}: {$validated['bean_origin']} (Susut {$shrinkage}%)",
                ]);
            }
        }

        return back()->with(
            'success',
            "Batch Roasting {$batchCode} ({$roasted}g matang, susut {$shrinkage}%) berhasil disimpan & disinkronkan ke Gudang!"
        );
    }

    // 2. Simpan Log Kalibrasi Dial-In Espresso Harian & Skor Cupping SCA
    public function storeDialInLog(Request $request)
    {
        $validated = $request->validate([
            'bean_name' => 'required|string|max:150',
            'grind_setting' => 'required|string|max:50',
            'dose_in_gram' => 'required|numeric|min:5|max:35',
            'yield_out_gram' => 'required|numeric|min:10|max:100',
            'time_seconds' => 'required|integer|min:10|max:60',
            'sca_score' => 'required|numeric|min:60|max:100',
            'tasting_notes' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $cafe = $user->cafe;
        $settings = $cafe->settings ?? [];
        $logs = $settings['dial_in_logs'] ?? [];

        $dose = (float) $validated['dose_in_gram'];
        $yield = (float) $validated['yield_out_gram'];
        $ratio = $dose > 0 ? round($yield / $dose, 1) : 2.0;

        array_unshift($logs, [
            'id' => 'dl-' . time(),
            'bean_name' => $validated['bean_name'],
            'grind_setting' => $validated['grind_setting'],
            'dose_in_gram' => $dose,
            'yield_out_gram' => $yield,
            'brew_ratio' => "1 : {$ratio}",
            'time_seconds' => (int) $validated['time_seconds'],
            'sca_score' => (float) $validated['sca_score'],
            'tasting_notes' => $validated['tasting_notes'],
            'barista_name' => $user->name,
            'logged_at' => now()->format('d M Y H:i'),
        ]);

        $settings['dial_in_logs'] = array_slice($logs, 0, 30);
        $cafe->update(['settings' => $settings]);

        return back()->with(
            'success',
            "Kalibrasi Dial-In Espresso (Rasio 1:{$ratio} dalam {$validated['time_seconds']} detik, Skor SCA: {$validated['sca_score']}) berhasil dicatat!"
        );
    }
}

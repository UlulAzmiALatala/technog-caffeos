<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\OrderItem;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperationsController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];

        // Hitung total cup terjual di kafe untuk mengukur beban pemakaian mesin kopi secara otomatis
        $totalCupsBrewed = (int) OrderItem::whereHas('order', function ($q) use ($cafeId) {
            $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled');
        })->sum('qty');

        // Daftar Aset Mesin Kafe Default jika belum ada di settings
        $equipments = $settings['equipments'] ?? [
            [
                'id' => 'eq-1',
                'name' => 'Espresso Machine La Marzocco 2-Group',
                'category' => 'Mesin Utama Barista',
                'max_shots_limit' => 500,
                ' baseline_shots' => 0,
                'last_service' => now()->subDays(12)->format('d M Y'),
                'status' => 'optimal',
            ],
            [
                'id' => 'eq-2',
                'name' => 'Commercial Espresso Grinder Mazzer',
                'category' => 'Grinder Biji Kopi',
                'max_shots_limit' => 400,
                'baseline_shots' => 0,
                'last_service' => now()->subDays(18)->format('d M Y'),
                'status' => 'optimal',
            ],
            [
                'id' => 'eq-3',
                'name' => 'Crystal Ice Cube Maker 100Kg',
                'category' => 'Pendingin & Es',
                'max_shots_limit' => 800,
                'baseline_shots' => 0,
                'last_service' => now()->subDays(25)->format('d M Y'),
                'status' => 'optimal',
            ],
        ];

        // Hitung beban pemakaian (wear level) tiap mesin terhadap total cup yang diproduksi
        $computedEquipments = collect($equipments)->map(function ($eq) use ($totalCupsBrewed) {
            $baseline = (int) ($eq['baseline_shots'] ?? 0);
            $usedSinceService = max(0, $totalCupsBrewed - $baseline);
            $limit = max(1, (int) ($eq['max_shots_limit'] ?? 500));
            $usagePercent = min(100, round(($usedSinceService / $limit) * 100));

            return array_merge($eq, [
                'used_shots' => $usedSinceService,
                'usage_percent' => $usagePercent,
                'needs_maintenance' => $usagePercent >= 80,
            ]);
        });

        // Ambil Jadwal Shift Roster Mingguan Karyawan
        $staffs = User::where('cafe_id', $cafeId)->get();
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        $weeklyRoster = $settings['weekly_roster'] ?? [];

        foreach ($staffs as $st) {
            if (!isset($weeklyRoster[$st->id])) {
                $weeklyRoster[$st->id] = [
                    'Senin' => 'PAGI (08:00 - 16:00)',
                    'Selasa' => 'PAGI (08:00 - 16:00)',
                    'Rabu' => 'SORE (15:00 - 23:00)',
                    'Kamis' => 'SORE (15:00 - 23:00)',
                    'Jumat' => 'FULL / PEAK',
                    'Sabtu' => 'FULL / PEAK',
                    'Minggu' => 'LIBUR (OFF)',
                ];
            }
        }

        return Inertia::render('Operations/Index', [
            'equipments' => $computedEquipments,
            'totalCupsBrewed' => $totalCupsBrewed,
            'staffs' => $staffs,
            'days' => $days,
            'weeklyRoster' => $weeklyRoster,
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Tambah Aset Mesin / Peralatan Kafe Baru
    public function storeEquipment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'max_shots_limit' => 'required|integer|min:50',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $equipments = $settings['equipments'] ?? [];

        $equipments[] = [
            'id' => 'eq-' . time(),
            'name' => $validated['name'],
            'category' => $validated['category'],
            'max_shots_limit' => (int) $validated['max_shots_limit'],
            'baseline_shots' => 0,
            'last_service' => now()->format('d M Y'),
            'status' => 'optimal',
        ];

        $settings['equipments'] = $equipments;
        $cafe->update(['settings' => $settings]);

        return back()->with('success', "Aset mesin '{$validated['name']}' berhasil didaftarkan ke sistem monitoring!");
    }

    // 2. Catat Servis / Kalibrasi Mesin & Otomatis Masuk ke Ledger Pengeluaran (/finance)
    public function logMaintenance(Request $request)
    {
        $validated = $request->validate([
            'equipment_id' => 'required|string',
            'service_cost' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];

        $totalCupsBrewed = (int) OrderItem::whereHas('order', function ($q) use ($cafeId) {
            $q->where('cafe_id', $cafeId)->where('order_status', '!=', 'cancelled');
        })->sum('qty');

        $equipmentName = 'Mesin Kafe';
        $equipments = collect($settings['equipments'] ?? [])->map(function ($eq) use ($validated, $totalCupsBrewed, &$equipmentName) {
            if ($eq['id'] === $validated['equipment_id']) {
                $equipmentName = $eq['name'];
                $eq['baseline_shots'] = $totalCupsBrewed;
                $eq['last_service'] = now()->format('d M Y H:i');
            }
            return $eq;
        })->toArray();

        $settings['equipments'] = $equipments;
        $cafe->update(['settings' => $settings]);

        if ((float) $validated['service_cost'] > 0) {
            Expense::create([
                'cafe_id' => $cafeId,
                'user_id' => $request->user()->id,
                'title' => "Maintenance & Kalibrasi: {$equipmentName}",
                'category' => 'Perawatan Mesin & Aset',
                'amount' => $validated['service_cost'],
                'payment_source' => 'cash_drawer',
                'expense_date' => today(),
                'notes' => $validated['notes'] ?? 'Servis berkala & reset counter shot mesin',
            ]);
        }

        return back()->with(
            'success',
            "Maintenance '{$equipmentName}' selesai! Counter beban mesin di-reset ke 0% & biaya servis tercatat di Keuangan."
        );
    }

    // 3. Simpan Jadwal Shift Roster Mingguan Karyawan
    public function updateRoster(Request $request)
    {
        $validated = $request->validate([
            'roster' => 'required|array',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $settings['weekly_roster'] = $validated['roster'];
        $cafe->update(['settings' => $settings]);

        return back()->with('success', 'Jadwal Shift Roster Mingguan seluruh karyawan berhasil diperbarui!');
    }
}

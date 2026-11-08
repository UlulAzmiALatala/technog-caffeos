<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CashierShift;
use App\Models\DiningTable;
use App\Models\Expense;
use App\Models\Order;
use App\Models\StockLog;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GovernanceController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // 1. KALKULASI OTOMATIS PAYROLL & KOMISI KARYAWAN BULAN INI
        $staffs = User::where('cafe_id', $cafeId)->get()->map(function ($staff) use ($cafeId, $currentMonth, $currentYear) {
            // Hitung jumlah kehadiran terverifikasi Wajah & GPS bulan ini
            $presentDays = Attendance::where('cafe_id', $cafeId)
                ->where('user_id', $staff->id)
                ->whereMonth('work_date', $currentMonth)
                ->whereYear('work_date', $currentYear)
                ->count();

            // Hitung jumlah order yang ditangani bulan ini
            $ordersHandled = Order::where('cafe_id', $cafeId)
                ->where('cashier_id', $staff->id)
                ->where('order_status', '!=', 'cancelled')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();

            // Standar Gaji Pokok berdasarkan Role
            $baseSalary = match ($staff->role) {
                'owner' => 4500000,
                'cashier' => 2800000,
                'barista' => 3000000,
                default => 2500000,
            };

            $attendanceAllowance = $presentDays * 50000; // Rp 50.000 per kehadiran biometrik
            $transactionBonus = $ordersHandled * 2500;   // Rp 2.500 per transaksi sukses
            $takeHomePay = $baseSalary + $attendanceAllowance + $transactionBonus;

            // Cek apakah gaji bulan ini sudah dicairkan ke tabel Expenses
            $periodTag = now()->format('M Y');
            $alreadyPaid = Expense::where('cafe_id', $cafeId)
                ->where('category', 'Payroll Gaji Karyawan')
                ->where('title', 'like', "%{$staff->name}%({$periodTag})%")
                ->exists();

            return [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'phone' => $staff->phone,
                'role' => $staff->role,
                'present_days' => $presentDays,
                'orders_handled' => $ordersHandled,
                'base_salary' => $baseSalary,
                'attendance_allowance' => $attendanceAllowance,
                'transaction_bonus' => $transactionBonus,
                'take_home_pay' => $takeHomePay,
                'already_paid' => $alreadyPaid,
                'period_label' => $periodTag,
            ];
        });

        // 2. KUMPULKAN REKAM JEJAK AUDIT TRAIL (CCTV SYSTEM LOG) LINTAS MODUL
        $cctvLogs = collect();

        // A. Log Transaksi & Void Order
        Order::with('cashier')
            ->where('cafe_id', $cafeId)
            ->latest('updated_at')
            ->take(15)
            ->get()
            ->each(function ($ord) use ($cctvLogs) {
                $isVoid = $ord->order_status === 'cancelled';
                $cctvLogs->push([
                    'id' => 'ord-' . $ord->id,
                    'category' => $isVoid ? 'SECURITY_VOID' : 'POS_ORDER',
                    'severity' => $isVoid ? 'danger' : 'info',
                    'actor' => $ord->cashier?->name ?? 'Self-Order QR Pelanggan',
                    'role' => $ord->cashier?->role ?? 'customer',
                    'title' => $isVoid
                        ? "VOID / PEMBATALAN STRUK #{$ord->queue_number} ({$ord->order_code})"
                        : "Transaksi Order #{$ord->queue_number} ({$ord->order_code})",
                    'description' => $isVoid
                        ? "Pesanan atas nama {$ord->customer_name} senilai Rp " . number_format($ord->grand_total, 0, ',', '.') . " dibatalkan & stok resep dikembalikan ke gudang."
                        : "Checkout pelanggan {$ord->customer_name} ({$ord->order_type}) senilai Rp " . number_format($ord->grand_total, 0, ',', '.'),
                    'timestamp' => $ord->updated_at,
                ]);
            });

        // B. Log Buka/Tutup Shift Laci Kasir & Selisih Uang
        CashierShift::with('user')
            ->where('cafe_id', $cafeId)
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->each(function ($sh) use ($cctvLogs) {
                $hasMinus = $sh->status === 'closed' && (float) $sh->difference < 0;
                $cctvLogs->push([
                    'id' => 'shift-' . $sh->id,
                    'category' => 'CASH_DRAWER',
                    'severity' => $hasMinus ? 'warning' : 'success',
                    'actor' => $sh->user?->name ?? 'Kasir',
                    'role' => $sh->user?->role ?? 'cashier',
                    'title' => $sh->status === 'open'
                        ? 'Buka Laci Shift Kasir (Petty Cash)'
                        : 'Tutup Laci Shift & Rekonsiliasi Tunai',
                    'description' => $sh->status === 'open'
                        ? 'Modal awal laci diinput sebesar Rp ' . number_format($sh->opening_cash, 0, ',', '.')
                        : 'Uang fisik aktual Rp ' . number_format($sh->actual_cash, 0, ',', '.') . ' (Selisih: Rp ' . number_format($sh->difference, 0, ',', '.') . ')',
                    'timestamp' => $sh->updated_at,
                ]);
            });

        // C. Log Mutasi Gudang, PO & Barang Rusak (Waste)
        StockLog::with(['user', 'stock'])
            ->where('cafe_id', $cafeId)
            ->latest()
            ->take(10)
            ->get()
            ->each(function ($log) use ($cctvLogs) {
                $isWaste = $log->type === 'waste_out';
                $cctvLogs->push([
                    'id' => 'stk-' . $log->id,
                    'category' => 'INVENTORY',
                    'severity' => $isWaste ? 'warning' : 'info',
                    'actor' => $log->user?->name ?? 'Barista',
                    'role' => $log->user?->role ?? 'barista',
                    'title' => strtoupper(str_replace('_', ' ', $log->type)) . ': ' . ($log->stock?->name ?? 'Bahan Baku'),
                    'description' => "Perubahan kuantitas: {$log->qty_change} {$log->stock?->unit}. Catatan: " . ($log->notes ?: '-'),
                    'timestamp' => $log->created_at,
                ]);
            });

        // D. Log Verifikasi Wajah Biometrik & GPS
        Attendance::with('user')
            ->where('cafe_id', $cafeId)
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->each(function ($att) use ($cctvLogs) {
                $outside = $att->status === 'outside_radius';
                $cctvLogs->push([
                    'id' => 'att-' . $att->id,
                    'category' => 'BIOMETRIC_AUTH',
                    'severity' => $outside ? 'warning' : 'success',
                    'actor' => $att->user?->name ?? 'Staf',
                    'role' => $att->user?->role ?? 'staff',
                    'title' => "Verifikasi Wajah Biometrik ({$att->face_confidence}% Match)",
                    'description' => "Clock-In pada jarak {$att->distance_meters} meter dari titik GPS kafe. Status: " . strtoupper($att->status),
                    'timestamp' => $att->updated_at,
                ]);
            });

        $sortedCctvLogs = $cctvLogs->sortByDesc('timestamp')->values()->take(35);

        return Inertia::render('Governance/Index', [
            'staffPayrolls' => $staffs,
            'cctvLogs' => $sortedCctvLogs,
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // Cairkan Slip Gaji Karyawan & Catat Otomatis ke Pengeluaran Keuangan (/finance)
    public function disburseSalary(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'period_label' => 'required|string',
        ]);

        $cafeId = $request->user()->cafe_id;
        $staff = User::where('cafe_id', $cafeId)->findOrFail($validated['staff_id']);

        $title = "Slip Gaji & Insentif: {$staff->name} ({$validated['period_label']})";

        Expense::create([
            'cafe_id' => $cafeId,
            'user_id' => $request->user()->id,
            'title' => $title,
            'category' => 'Payroll Gaji Karyawan',
            'amount' => $validated['amount'],
            'payment_source' => 'bank_transfer',
            'expense_date' => today(),
            'notes' => "Otomatis dicairkan dari modul Payroll Biometrik untuk role " . strtoupper($staff->role),
        ]);

        return back()->with(
            'success',
            "Gaji {$staff->name} sebesar Rp " . number_format($validated['amount'], 0, ',', '.') . " berhasil dicairkan & tercatat di Ledger Keuangan!"
        );
    }
}

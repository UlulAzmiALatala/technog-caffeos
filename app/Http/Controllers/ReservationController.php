<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Reservation;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        return Inertia::render('Reservations/Index', [
            'tables' => DiningTable::where('cafe_id', $cafeId)->orderBy('table_number')->get(),
            'reservations' => Reservation::with('table')
                ->where('cafe_id', $cafeId)
                ->latest('reservation_time')
                ->take(30)
                ->get(),
            'templates' => Template::where('is_active', true)->get(),
        ]);
    }

    // 1. Buat Jadwal Booking / Reservasi Meja Baru
    public function storeReservation(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:30',
            'guest_count' => 'required|integer|min:1',
            'reservation_time' => 'required|date',
            'dp_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $cafeId = $request->user()->cafe_id;

        return DB::transaction(function () use ($validated, $cafeId) {
            $reservation = Reservation::create([
                'cafe_id' => $cafeId,
                'table_id' => $validated['table_id'],
                'booking_code' => 'BKG-' . strtoupper(Str::random(5)),
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'guest_count' => $validated['guest_count'],
                'reservation_time' => $validated['reservation_time'],
                'dp_amount' => $validated['dp_amount'] ?? 0,
                'status' => 'booked',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Otomatis ubah status meja di Denah Floor Plan menjadi 'reserved'
            DiningTable::where('id', $validated['table_id'])->update(['status' => 'reserved']);

            return back()->with(
                'success',
                "Reservasi {$reservation->booking_code} atas nama {$validated['customer_name']} berhasil dibuat! Status meja otomatis menjadi RESERVED."
            );
        });
    }

    // 2. Update Status Reservasi (Check-In Tamu / Selesai / Batal)
    public function updateReservationStatus(Request $request, Reservation $reservation)
    {
        $request->validate([
            'status' => 'required|in:booked,checked_in,completed,cancelled',
        ]);

        return DB::transaction(function () use ($request, $reservation) {
            $reservation->update(['status' => $request->status]);

            // Sinkronkan status meja di Floor Plan secara otomatis
            if ($request->status === 'checked_in') {
                $reservation->table?->update(['status' => 'occupied']);
            } elseif (in_array($request->status, ['completed', 'cancelled'])) {
                $reservation->table?->update(['status' => 'available']);
            }

            return back()->with('success', "Status Reservasi {$reservation->booking_code} diperbarui menjadi " . strtoupper($request->status));
        });
    }

    // 3. Klik Langsung Meja di Denah Floor Plan untuk Ubah Status (Available / Occupied / Reserved)
    public function updateTableStatus(Request $request, DiningTable $table)
    {
        $request->validate([
            'status' => 'required|in:available,occupied,reserved',
        ]);

        $table->update(['status' => $request->status]);

        return back()->with(
            'success',
            "Status Meja #{$table->table_number} diubah menjadi " . strtoupper($request->status)
        );
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KdsController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        // Ambil antrean aktif hari ini lengkap dengan komposisi resep stok untuk panduan Barista
        $activeOrders = Order::with(['items.menu.stocks', 'table', 'payment', 'delivery'])
            ->where('cafe_id', $cafeId)
            ->whereIn('order_status', ['paid', 'processing', 'ready'])
            ->latest()
            ->take(30)
            ->get();

        $completedTodayCount = Order::where('cafe_id', $cafeId)
            ->where('order_status', 'completed')
            ->whereDate('created_at', today())
            ->count();

        return Inertia::render('Kds/Index', [
            'activeOrders' => $activeOrders,
            'completedTodayCount' => $completedTodayCount,
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // Bump Status Cepat dari Layar KDS Barista
    public function bumpStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'next_status' => 'required|in:processing,ready,completed',
        ]);

        $order->update(['order_status' => $validated['next_status']]);

        $statusLabel = match ($validated['next_status']) {
            'processing' => 'SEDANG DIRACIK BARISTA',
            'ready' => 'SIAP DISAJIKAN KE PELANGGAN',
            'completed' => 'SELESAI & DISERAHKAN',
        };

        return back()->with(
            'success',
            "KDS Bump: Antrean #{$order->queue_number} ({$order->customer_name}) berhasil dinaikkan ke status {$statusLabel}!"
        );
    }
}

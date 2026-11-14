<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DeliveryOrderController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];
        $ojolMetaMap = $settings['ojol_dispatches'] ?? [];

        $deliveryOrders = Order::with(['items.menu', 'payment', 'delivery', 'customer'])
            ->where('cafe_id', $cafeId)
            ->where('order_type', 'delivery')
            ->latest()
            ->take(30)
            ->get()
            ->map(function ($ord) use ($ojolMetaMap) {
                $meta = $ojolMetaMap[$ord->id] ?? [];
                return [
                    'id' => $ord->id,
                    'order_code' => $ord->order_code,
                    'queue_number' => $ord->queue_number,
                    'customer_name' => $ord->customer_name,
                    'customer_phone' => $ord->customer?->phone ?? ($meta['customer_phone'] ?? '-'),
                    'order_status' => $ord->order_status,
                    'payment_status' => $ord->payment?->payment_status ?? 'unpaid',
                    'payment_method' => $ord->payment?->payment_method ?? 'qris',
                    'grand_total' => (float) $ord->grand_total,
                    'items' => $ord->items,
                    'courier_brand' => $meta['courier_brand'] ?? 'GoSend Instant',
                    'shipping_cost' => (float) ($meta['shipping_cost'] ?? 12000),
                    'delivery_address' => $meta['delivery_address'] ?? ($ord->delivery?->recipient_address ?? 'Alamat Pelanggan'),
                    'driver_name' => $meta['driver_name'] ?? ($ord->delivery?->driver_name ?? null),
                    'driver_phone' => $meta['driver_phone'] ?? ($ord->delivery?->driver_phone ?? null),
                    'license_plate' => $meta['license_plate'] ?? 'DN 4521 XY',
                    'delivery_status' => $meta['delivery_status'] ?? ($ord->delivery?->delivery_status ?? 'waiting_driver'),
                    'created_at' => $ord->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('Delivery/Index', [
            'deliveryOrders' => $deliveryOrders,
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // Simpan Penugasan Driver Ojol (GoSend / GrabExpress / Maxim / Kurir Kafe) & Update Status Pengiriman
    public function assignOjolDriver(Request $request, Order $order)
    {
        $validated = $request->validate([
            'courier_brand' => 'required|string|max:60',
            'driver_name' => 'required|string|max:120',
            'driver_phone' => 'required|string|max:30',
            'license_plate' => 'required|string|max:25',
            'delivery_status' => 'required|in:waiting_driver,driver_assigned,on_the_way,delivered',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $ojolMetaMap = $settings['ojol_dispatches'] ?? [];

        $existing = $ojolMetaMap[$order->id] ?? [];
        $ojolMetaMap[$order->id] = array_merge($existing, [
            'courier_brand' => $validated['courier_brand'],
            'driver_name' => $validated['driver_name'],
            'driver_phone' => $validated['driver_phone'],
            'license_plate' => strtoupper($validated['license_plate']),
            'delivery_status' => $validated['delivery_status'],
            'updated_at' => now()->format('H:i'),
        ]);

        $settings['ojol_dispatches'] = $ojolMetaMap;
        $cafe->update(['settings' => $settings]);

        // Sinkronkan juga ke tabel deliveries jika tabel & kolomnya tersedia
        if (Schema::hasTable('deliveries')) {
            $cols = Schema::getColumnListing('deliveries');
            $payload = [];
            if (in_array('driver_name', $cols)) $payload['driver_name'] = $validated['driver_name'];
            if (in_array('driver_phone', $cols)) $payload['driver_phone'] = $validated['driver_phone'];
            if (in_array('delivery_status', $cols)) $payload['delivery_status'] = $validated['delivery_status'];

            if (!empty($payload)) {
                Delivery::updateOrCreate(['order_id' => $order->id], $payload);
            }
        }

        // Jika driver sudah berangkat atau tiba, perbarui juga status order utama
        if ($validated['delivery_status'] === 'on_the_way') {
            $order->update(['order_status' => 'ready']);
        } elseif ($validated['delivery_status'] === 'delivered') {
            $order->update(['order_status' => 'completed']);
        }

        return back()->with(
            'success',
            "Driver {$validated['courier_brand']} ({$validated['driver_name']} - {$validated['license_plate']}) berhasil ditugaskan untuk Order #{$order->queue_number}!"
        );
    }
}

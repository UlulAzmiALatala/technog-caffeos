<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\DiningTable;
use App\Models\Template;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function index(Request $request)
    {
        $cafe = $request->user()->cafe;
        $cafeId = $cafe->id;
        $settings = $cafe->settings ?? [];

        $redeemedMap = $settings['redeemed_points'] ?? [];
        $rewardCatalog = $settings['reward_catalog'] ?? [
            ['id' => 'rew-1', 'title' => 'Gratis 1 Cup Kopi Susu Gula Aren', 'points_cost' => 10],
            ['id' => 'rew-2', 'title' => 'Potongan Langsung Rp 25.000', 'points_cost' => 20],
            ['id' => 'rew-3', 'title' => 'Exclusive Tumbler Stainless TechnoG', 'points_cost' => 50],
        ];

        // Hitung Poin Loyalitas & Tier Member Otomatis (1 Poin tiap Rp 10.000 belanja)
        $customers = Customer::withCount('orders')
            ->withSum('orders', 'grand_total')
            ->where('cafe_id', $cafeId)
            ->latest()
            ->get()
            ->map(function ($cust) use ($redeemedMap) {
                $totalSpent = (float) ($cust->orders_sum_grand_total ?? 0);
                $earnedPoints = (int) floor($totalSpent / 10000);
                $usedPoints = (int) ($redeemedMap[$cust->id] ?? 0);
                $availablePoints = max(0, $earnedPoints - $usedPoints);

                if ($totalSpent >= 500000) {
                    $tier = 'VIP SULTAN';
                } elseif ($totalSpent >= 200000) {
                    $tier = 'GOLD';
                } elseif ($totalSpent >= 75000) {
                    $tier = 'SILVER';
                } else {
                    $tier = 'BRONZE';
                }

                return [
                    'id' => $cust->id,
                    'member_code' => $cust->member_code,
                    'name' => $cust->name,
                    'phone' => $cust->phone,
                    'orders_count' => $cust->orders_count,
                    'total_spent' => $totalSpent,
                    'earned_points' => $earnedPoints,
                    'used_points' => $usedPoints,
                    'available_points' => $availablePoints,
                    'tier' => $tier,
                ];
            });

        return Inertia::render('Marketing/Index', [
            'customers' => $customers,
            'rewardCatalog' => $rewardCatalog,
            'vouchers' => Voucher::where('cafe_id', $cafeId)->where('is_active', true)->get(),
            'templates' => Template::where('is_active', true)->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->get(),
        ]);
    }

    // 1. Tukar Poin Member dengan Hadiah (Redeem Point)
    public function redeemPoints(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'points_cost' => 'required|integer|min:1',
            'reward_title' => 'required|string',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $redeemedMap = $settings['redeemed_points'] ?? [];

        $custId = $validated['customer_id'];
        $redeemedMap[$custId] = (int) ($redeemedMap[$custId] ?? 0) + (int) $validated['points_cost'];

        $settings['redeemed_points'] = $redeemedMap;
        $cafe->update(['settings' => $settings]);

        $customer = Customer::find($custId);

        return back()->with(
            'success',
            "Penukaran {$validated['points_cost']} Poin untuk {$customer?->name} ({$validated['reward_title']}) berhasil diproses!"
        );
    }

    // 2. Tambah Item Hadiah Baru ke Katalog Reward
    public function storeReward(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'points_cost' => 'required|integer|min:1',
        ]);

        $cafe = $request->user()->cafe;
        $settings = $cafe->settings ?? [];
        $catalog = $settings['reward_catalog'] ?? [];

        $catalog[] = [
            'id' => 'rew-' . time(),
            'title' => $validated['title'],
            'points_cost' => (int) $validated['points_cost'],
        ];

        $settings['reward_catalog'] = $catalog;
        $cafe->update(['settings' => $settings]);

        return back()->with('success', "Hadiah '{$validated['title']}' berhasil ditambahkan ke Katalog Loyalitas!");
    }
}

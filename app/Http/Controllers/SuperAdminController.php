<?php

namespace App\Http\Controllers;

use App\Models\Cafe;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function index(Request $request)
    {
        $cafes = Cafe::with('template')
            ->withCount(['orders', 'users', 'menus'])
            ->withSum('orders', 'grand_total')
            ->latest()
            ->get();

        $templates = Template::withCount('cafes')->get();

        $platformStats = [
            'total_cafes' => $cafes->count(),
            'active_cafes' => $cafes->where('is_active', true)->count(),
            'total_platform_orders' => Order::count(),
            'total_platform_gmv' => (float) Order::where('order_status', '!=', 'cancelled')->sum('grand_total'),
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'platformStats' => $platformStats,
            'cafes' => $cafes,
            'templates' => $templates,
            'tables' => DiningTable::where('cafe_id', $request->user()->cafe_id)->get(),
        ]);
    }

    // Aktifkan / Suspend Status Tenant Kafe
    public function toggleCafeStatus(Cafe $cafe)
    {
        $cafe->update(['is_active' => !$cafe->is_active]);
        $status = $cafe->is_active ? 'DIAKTIFKAN' : 'DISUSPEND';

        return back()->with('success', "Status Tenant Kafe '{$cafe->name}' berhasil {$status}!");
    }

    // Ubah Template Aktif milik Tenant Kafe tertentu dari Pusat
    public function updateCafeTemplate(Request $request, Cafe $cafe)
    {
        $request->validate(['template_id' => 'required|exists:templates,id']);
        $cafe->update(['template_id' => $request->template_id]);

        return back()->with('success', "Template untuk '{$cafe->name}' berhasil diperbarui oleh Super Admin!");
    }

    // 1-Click Impersonate (Masuk ke Akun Owner Kafe Klien untuk Bantuan Teknis)
    public function impersonateCafe(Cafe $cafe)
    {
        $owner = User::where('cafe_id', $cafe->id)->where('role', 'owner')->first()
            ?? User::where('cafe_id', $cafe->id)->first();

        if (!$owner) {
            return back()->with('success', 'Kafe ini belum memiliki akun user.');
        }

        Auth::login($owner);

        return redirect()->route('owner.dashboard')->with(
            'success',
            "Anda sekarang masuk sebagai Owner dari '{$cafe->name}'!"
        );
    }

    // Tambah Master Template Baru ke Katalog SaaS
    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:templates,slug',
        ]);

        Template::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug']),
            'layout_config' => ['sidebar' => 'left', 'mode' => 'custom'],
            'is_active' => true,
        ]);

        return back()->with('success', "Master Template '{$validated['name']}' berhasil ditambahkan ke katalog SaaS!");
    }
}

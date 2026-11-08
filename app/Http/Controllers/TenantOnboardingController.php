<?php

namespace App\Http\Controllers;

use App\Models\Cafe;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Stock;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantOnboardingController extends Controller
{
    public function landing()
    {
        $sampleTable = DiningTable::first();

        return Inertia::render('Welcome', [
            'templates' => Template::where('is_active', true)->get(),
            'totalCafes' => Cafe::count(),
            'totalOrders' => Order::count(),
            'sampleTableQr' => $sampleTable?->qr_code ?? 'CAFEOS-TBL-01',
        ]);
    }

    public function quickDemoLogin(Request $request)
    {
        $role = $request->input('role', 'owner');
        $user = User::where('role', $role)->first() ?? User::first();

        if ($user) {
            Auth::login($user);
            return match ($user->role) {
                'owner' => redirect()->route('owner.dashboard')->with('success', "Berhasil masuk ke sesi Demo sebagai OWNER ({$user->name})!"),
                'barista' => redirect()->route('kds.index')->with('success', "Berhasil masuk ke sesi Demo sebagai BARISTA ({$user->name})!"),
                default => redirect()->route('pos.index')->with('success', "Berhasil masuk ke sesi Demo sebagai CASHIER ({$user->name})!"),
            };
        }

        return back();
    }

    public function registerCafe(Request $request)
    {
        $validated = $request->validate([
            'cafe_name' => 'required|string|max:150',
            'address' => 'required|string|max:255',
            'template_id' => 'required|exists:templates,id',
            'owner_name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:25',
            'password' => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($validated) {
            $cafe = Cafe::create([
                'template_id' => $validated['template_id'],
                'name' => $validated['cafe_name'],
                'slug' => Str::slug($validated['cafe_name']) . '-' . Str::lower(Str::random(4)),
                'address' => $validated['address'],
                'settings' => [
                    'tax_percent' => 10,
                    'ai_quota_per_order' => 5,
                    'wifi_password' => 'kopitechnog123',
                ],
                'is_active' => true,
            ]);

            $owner = User::create([
                'cafe_id' => $cafe->id,
                'name' => $validated['owner_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'role' => 'owner',
                'password' => Hash::make($validated['password']),
                'is_active' => true,
            ]);

            // Buat 2 Meja QR Starter Otomatis
            DiningTable::insert([
                [
                    'cafe_id' => $cafe->id,
                    'table_number' => '01',
                    'location' => 'Indoor Area',
                    'qr_code' => 'QR-' . strtoupper(Str::random(6)) . '-01',
                    'status' => 'available',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'cafe_id' => $cafe->id,
                    'table_number' => 'VIP-01',
                    'location' => 'VIP Co-Working',
                    'qr_code' => 'QR-' . strtoupper(Str::random(6)) . '-VIP',
                    'status' => 'available',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // Buat Stok & Menu Starter Otomatis
            $arabika = Stock::create([
                'cafe_id' => $cafe->id,
                'name' => 'Biji Kopi Arabika House Blend',
                'type' => 'raw_material',
                'unit' => 'gram',
                'current_qty' => 5000,
                'min_qty_alert' => 500,
            ]);

            $susu = Stock::create([
                'cafe_id' => $cafe->id,
                'name' => 'Fresh Milk Barista Grade',
                'type' => 'raw_material',
                'unit' => 'ml',
                'current_qty' => 10000,
                'min_qty_alert' => 1000,
            ]);

            $menu = Menu::create([
                'cafe_id' => $cafe->id,
                'name' => 'Signature Kopi Susu ' . $cafe->name,
                'category' => 'Coffee',
                'price' => 25000,
                'discount' => 0,
                'description' => 'Racikan espresso house blend dengan susu segar creamy.',
                'treatment' => 'Double ristretto 18g + 120ml susu dingin',
                'is_available' => true,
            ]);

            $menu->stocks()->sync([
                $arabika->id => ['qty_needed' => 18],
                $susu->id => ['qty_needed' => 120],
            ]);

            Auth::login($owner);

            return redirect()->route('owner.dashboard')->with(
                'success',
                "Selamat datang di TechnoG CaffeOS! Workspace untuk '{$cafe->name}' telah siap digunakan."
            );
        });
    }
}

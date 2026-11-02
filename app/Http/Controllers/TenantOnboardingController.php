<?php

namespace App\Http\Controllers;

use App\Models\Cafe;
use App\Models\DiningTable;
use App\Models\Menu;
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
    // 1. Halaman Utama SaaS Katalog Template TechnoG CaffeOS
    public function landing()
    {
        // Pastikan ke-3 template selalu tersedia
        Template::firstOrCreate(
            ['slug' => 'neo-brutal'],
            [
                'name' => 'Neo-Brutalist Pop',
                'layout_config' => ['sidebar' => 'left', 'cardStyle' => 'brutal', 'mode' => 'pop'],
                'is_active' => true,
            ]
        );

        return Inertia::render('Welcome', [
            'templates' => Template::where('is_active', true)->get(),
            'cafes' => Cafe::with('template')->latest()->take(6)->get(),
        ]);
    }

    // 2. Pendaftaran Tenant Kafe Baru (Multi-Tenant SaaS Onboarding)
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
            // A. Buat Tenant Kafe Baru dengan Template Pilihan
            $cafe = Cafe::create([
                'template_id' => $validated['template_id'],
                'name' => $validated['cafe_name'],
                'slug' => Str::slug($validated['cafe_name']) . '-' . rand(100, 999),
                'address' => $validated['address'],
                'theme_color' => '#10B981',
                'settings' => ['tax_percent' => 10, 'ai_quota_per_order' => 5],
            ]);

            // B. Buat Akun Owner Kafe
            $owner = User::create([
                'cafe_id' => $cafe->id,
                'name' => $validated['owner_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => 'owner',
                'is_active' => true,
            ]);

            // C. Buat Meja QR & Stok Starter Otomatis agar Kafe Baru Siap Pakai
            $prefix = strtoupper(Str::substr(Str::slug($cafe->name, ''), 0, 4));
            foreach (['01', '02'] as $num) {
                DiningTable::create([
                    'cafe_id' => $cafe->id,
                    'table_number' => $num,
                    'qr_code' => "{$prefix}-TBL-{$num}-" . rand(100, 999),
                    'location' => 'Indoor',
                    'status' => 'available',
                ]);
            }

            $beans = Stock::create([
                'cafe_id' => $cafe->id,
                'name' => 'House Blend Coffee Beans',
                'type' => 'raw_material',
                'unit' => 'gram',
                'current_qty' => 3000,
                'min_qty_alert' => 300,
            ]);

            $signatureMenu = Menu::create([
                'cafe_id' => $cafe->id,
                'name' => 'Signature Kopi ' . $cafe->name,
                'category' => 'Coffee',
                'description' => 'Menu kopi andalan dengan biji kopi pilihan.',
                'treatment' => 'Double shot espresso + es batu.',
                'price' => 20000,
                'is_available' => true,
            ]);

            $signatureMenu->stocks()->attach([$beans->id => ['qty_needed' => 18]]);

            // D. Langsung Login sebagai Owner Kafe Baru
            Auth::login($owner);

            return redirect()->route('owner.dashboard')->with(
                'success',
                "Selamat datang di {$cafe->name}! Kafe dan Template pilihan Anda telah aktif."
            );
        });
    }

    // 3. Fitur 1-Click Quick Login Role (Memudahkan Testing Owner vs Cashier vs Barista)
    public function quickDemoLogin(Request $request)
    {
        $request->validate(['role' => 'required|in:owner,cashier,barista']);

        $user = User::where('role', $request->role)->firstOrFail();
        Auth::login($user);

        return match ($user->role) {
            'owner' => redirect()->route('owner.dashboard'),
            'barista' => redirect()->route('management.index'),
            default => redirect()->route('pos.index'),
        };
    }
}

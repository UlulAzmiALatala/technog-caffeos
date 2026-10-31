<?php

namespace Database\Seeders;

use App\Models\Cafe;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Stock;
use App\Models\Template;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat 2 Pilihan Template UI Kasir
        $cyberDark = Template::create([
            'name' => 'CyberDark Glassmorphism',
            'slug' => 'cyber-dark',
            'layout_config' => ['sidebar' => 'left', 'cardStyle' => 'glass', 'mode' => 'dark'],
        ]);

        $minimalWood = Template::create([
            'name' => 'Minimalist Warm Wood',
            'slug' => 'minimalist-wood',
            'layout_config' => ['sidebar' => 'top', 'cardStyle' => 'clean', 'mode' => 'light'],
        ]);

        // 2. Buat Tenant Kafe Pertama
        $cafe = Cafe::create([
            'template_id' => $cyberDark->id,
            'name' => 'TechnoG Roastery & Space',
            'slug' => 'technog-cafe',
            'address' => 'Jl. Teknologi Digital No. 99, Yogyakarta',
            'theme_color' => '#10B981',
            'settings' => ['tax_percent' => 10, 'ai_quota_per_order' => 5],
        ]);

        // 3. Buat 3 Role Akun Internal (Owner, Cashier, Barista)
        User::insert([
            [
                'cafe_id' => $cafe->id,
                'name' => 'Andri Rizki (Owner)',
                'email' => 'owner@technog.id',
                'phone' => '081234567890',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'cafe_id' => $cafe->id,
                'name' => 'Kasir TechnoG',
                'email' => 'cashier@technog.id',
                'phone' => '081234567891',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'cafe_id' => $cafe->id,
                'name' => 'Barista TechnoG',
                'email' => 'barista@technog.id',
                'phone' => '081234567892',
                'password' => Hash::make('password'),
                'role' => 'barista',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 4. Buat Meja beserta Kode QR Unik
        foreach (['01', '02', '03', 'VIP-01'] as $num) {
            DiningTable::create([
                'cafe_id' => $cafe->id,
                'table_number' => $num,
                'qr_code' => 'CAFEOS-TBL-' . $num,
                'location' => str_contains($num, 'VIP') ? 'VIP Room' : 'Indoor',
                'status' => 'available',
            ]);
        }

        // 5. Buat Stok Bahan Baku
        $arabica = Stock::create(['cafe_id' => $cafe->id, 'name' => 'Biji Kopi Arabika', 'type' => 'raw_material', 'unit' => 'gram', 'current_qty' => 5000, 'min_qty_alert' => 500]);
        $milk = Stock::create(['cafe_id' => $cafe->id, 'name' => 'Fresh Milk UHT', 'type' => 'raw_material', 'unit' => 'ml', 'current_qty' => 10000, 'min_qty_alert' => 1000]);
        $aren = Stock::create(['cafe_id' => $cafe->id, 'name' => 'Gula Aren Organik', 'type' => 'raw_material', 'unit' => 'ml', 'current_qty' => 2000, 'min_qty_alert' => 250]);

        // 6. Buat Menu & Hubungkan dengan Resep Stok (menu_stocks)
        $kopiSusu = Menu::create([
            'cafe_id' => $cafe->id,
            'name' => 'Es Kopi Susu TechnoG',
            'category' => 'Coffee',
            'description' => 'Perpaduan espresso arabika creamy dengan gula aren organik. Cocok untuk menemani kerja dan coding.',
            'treatment' => 'Double shot espresso + 120ml susu + 25ml gula aren, shake dengan es batu.',
            'price' => 22000,
        ]);

        $americano = Menu::create([
            'cafe_id' => $cafe->id,
            'name' => 'Iced Americano Bold',
            'category' => 'Coffee',
            'description' => 'Kopi hitam dingin rendah kalori dengan karakter fruity dan segar.',
            'treatment' => 'Double shot espresso dituang di atas air mineral dingin 150ml dan es.',
            'price' => 18000,
        ]);

        // Pasang takaran resep per porsi
        $kopiSusu->stocks()->attach([
            $arabica->id => ['qty_needed' => 18],
            $milk->id => ['qty_needed' => 120],
            $aren->id => ['qty_needed' => 25],
        ]);

        $americano->stocks()->attach([
            $arabica->id => ['qty_needed' => 18],
        ]);
    }
}

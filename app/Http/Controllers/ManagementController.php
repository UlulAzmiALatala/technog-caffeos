<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Delivery;
use App\Models\DiningTable;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Stock;
use App\Models\Template;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ManagementController extends Controller
{
    public function index(Request $request)
    {
        $cafeId = $request->user()->cafe_id;

        return Inertia::render('Management/Dashboard', [
            'menus' => Menu::with('stocks')->where('cafe_id', $cafeId)->latest()->get(),
            'stocks' => Stock::where('cafe_id', $cafeId)->orderBy('name')->get(),
            'tables' => DiningTable::where('cafe_id', $cafeId)->orderBy('table_number')->get(),
            'templates' => Template::where('is_active', true)->get(),
            'staffs' => User::where('cafe_id', $cafeId)->latest()->get(),
            'vouchers' => Voucher::where('cafe_id', $cafeId)->latest()->get(),
            'customers' => Customer::withCount('orders')
                ->withSum('orders', 'grand_total')
                ->where('cafe_id', $cafeId)
                ->latest()
                ->get(),
            'orders' => Order::with(['items.menu', 'table', 'payment', 'delivery'])
                ->where('cafe_id', $cafeId)
                ->latest()
                ->take(30)
                ->get(),
        ]);
    }

    // 1. INPUT & RESTOCK BAHAN BAKU
    public function storeStock(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'type' => 'required|in:raw_material,packaging,other',
            'unit' => 'required|string|max:20',
            'current_qty' => 'required|numeric|min:0',
            'min_qty_alert' => 'required|numeric|min:0',
        ]);

        Stock::create([
            ...$validated,
            'cafe_id' => $request->user()->cafe_id,
        ]);

        return back()->with('success', 'Stok bahan baku baru berhasil ditambahkan!');
    }

    public function restock(Request $request, Stock $stock)
    {
        $request->validate(['add_qty' => 'required|numeric|min:1']);
        $stock->increment('current_qty', $request->add_qty);

        return back()->with('success', "Stok {$stock->name} berhasil ditambah!");
    }

    // 2. INPUT MENU BARU + UPLOAD FOTO ASLI + KOMPOSISI RESEP STOK
    public function storeMenu(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'treatment' => 'nullable|string',
            'image_file' => 'nullable|image|max:4096', // Maksimal 4MB
            'recipes' => 'nullable|array',
            'recipes.*.stock_id' => 'required|exists:stocks,id',
            'recipes.*.qty_needed' => 'required|numeric|min:0.1',
        ]);

        $imagePath = null;
        if ($request->hasFile('image_file')) {
            $stored = $request->file('image_file')->store('menus', 'public');
            $imagePath = '/storage/' . $stored;
        }

        $menu = Menu::create([
            'cafe_id' => $request->user()->cafe_id,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'discount' => $validated['discount'] ?? 0,
            'description' => $validated['description'] ?? '',
            'treatment' => $validated['treatment'] ?? '',
            'image' => $imagePath,
            'is_available' => true,
        ]);

        if (!empty($validated['recipes'])) {
            $syncData = [];
            foreach ($validated['recipes'] as $recipe) {
                $syncData[$recipe['stock_id']] = ['qty_needed' => $recipe['qty_needed']];
            }
            $menu->stocks()->sync($syncData);
        }

        return back()->with('success', "Menu {$menu->name} beserta foto & resepnya berhasil ditambahkan!");
    }

    public function toggleMenuAvailability(Menu $menu)
    {
        $menu->update(['is_available' => !$menu->is_available]);
        return back()->with('success', "Status ketersediaan {$menu->name} diperbarui!");
    }

    public function destroyMenu(Menu $menu)
    {
        if ($menu->image && str_starts_with($menu->image, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $menu->image));
        }
        $menu->delete();
        return back()->with('success', 'Menu berhasil dihapus.');
    }

    // 3. INPUT MEJA & GENERATE QR CODE BARU
    public function storeTable(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|max:20',
            'location' => 'required|string|max:100',
        ]);

        DiningTable::create([
            'cafe_id' => $request->user()->cafe_id,
            'table_number' => $validated['table_number'],
            'location' => $validated['location'],
            'qr_code' => 'CAFEOS-TBL-' . strtoupper($validated['table_number']) . '-' . rand(100, 999),
            'status' => 'available',
        ]);

        return back()->with('success', "Meja #{$validated['table_number']} berhasil dibuat!");
    }

    // 4. MANAGE ORDER DAPUR & PENUGASAN DRIVER DELIVERY
    public function updateOrderStatus(Request $request, Order $order)
    {
        $request->validate([
            'order_status' => 'required|in:pending,paid,processing,ready,completed,cancelled',
        ]);

        $order->update(['order_status' => $request->order_status]);

        return back()->with('success', "Status Antrean #{$order->queue_number} diubah menjadi " . strtoupper($request->order_status));
    }

    public function assignDriver(Request $request, Order $order)
    {
        $validated = $request->validate([
            'driver_name' => 'required|string|max:150',
            'driver_phone' => 'required|string|max:25',
            'recipient_address' => 'required|string',
        ]);

        Delivery::updateOrCreate(
            ['order_id' => $order->id],
            [
                'driver_name' => $validated['driver_name'],
                'driver_phone' => $validated['driver_phone'],
                'recipient_address' => $validated['recipient_address'],
                'tracking_status' => 'on_the_way',
            ]
        );

        return back()->with('success', "Driver {$validated['driver_name']} berhasil ditugaskan untuk Antrean #{$order->queue_number}!");
    }

    // 5. KELOLA AKUN KARYAWAN
    public function storeStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:25',
            'role' => 'required|in:cashier,barista,owner',
            'password' => 'required|string|min:6',
        ]);

        User::create([
            'cafe_id' => $request->user()->cafe_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return back()->with('success', "Akun {$validated['role']} ({$validated['name']}) berhasil ditambahkan!");
    }

    // 6. KELOLA VOUCHER PROMO
    public function storeVoucher(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:150',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'quota' => 'required|integer|min:1',
        ]);

        Voucher::create([
            'cafe_id' => $request->user()->cafe_id,
            'code' => strtoupper(trim($validated['code'])),
            'name' => $validated['name'],
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0,
            'quota' => $validated['quota'],
            'is_active' => true,
        ]);

        return back()->with('success', "Voucher Promo {$validated['code']} berhasil diterbitkan!");
    }

    public function toggleVoucher(Voucher $voucher)
    {
        $voucher->update(['is_active' => !$voucher->is_active]);
        return back()->with('success', "Status Voucher {$voucher->code} diperbarui!");
    }

    public function destroyVoucher(Voucher $voucher)
    {
        $voucher->delete();
        return back()->with('success', 'Voucher berhasil dihapus.');
    }
}

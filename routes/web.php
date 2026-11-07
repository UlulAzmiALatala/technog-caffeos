<?php

use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\ManagementController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TenantOnboardingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 1. Landing Page SaaS TechnoG CaffeOS & Onboarding Kafe Baru
Route::get('/', [TenantOnboardingController::class, 'landing'])->name('welcome');
Route::post('/saas/register-cafe', [TenantOnboardingController::class, 'registerCafe'])->name('saas.register-cafe');
Route::post('/saas/quick-demo', [TenantOnboardingController::class, 'quickDemoLogin'])->name('saas.quick-demo');

// 2. Route Publik untuk Pelanggan (Scan QR Code Meja, Self-Order, & AI Chatbot Co-Worker)
Route::get('/order/qr/{qrCode}', [CustomerOrderController::class, 'scanTable'])->name('customer.scan');
Route::post('/order/qr/{qrCode}', [CustomerOrderController::class, 'submitOrder'])->name('customer.submit-order');
Route::get('/order/status/{orderCode}', [CustomerOrderController::class, 'orderStatus'])->name('customer.order-status');
Route::post('/order/ai-chat', [CustomerOrderController::class, 'askAi'])->name('customer.ask-ai');

// 3. Smart Redirect Setelah Login Berdasarkan Role User
Route::get('/dashboard', function (Request $request) {
    return match ($request->user()->role) {
        'owner' => redirect()->route('owner.dashboard'),
        'barista' => redirect()->route('management.index'),
        default => redirect()->route('pos.index'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// 4. Grup Route Eksklusif OWNER (Super Admin: Monitoring, Export, & AI Co-Worker for Owner)
Route::middleware(['auth', 'role:owner'])->group(function () {
    Route::get('/owner', [OwnerController::class, 'index'])->name('owner.dashboard');
    Route::post('/owner/ai-chat', [OwnerController::class, 'askOwnerAi'])->name('owner.ask-ai');
    Route::get('/owner/export-csv', [OwnerController::class, 'exportCsv'])->name('owner.export');
});

// 5. Grup Route Operasional POS, Shift Kasir & Manajemen Dapur (Owner, Cashier, & Barista)
Route::middleware(['auth', 'role:owner,cashier,barista'])->group(function () {
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');
    Route::post('/pos/switch-template', [PosController::class, 'switchTemplate'])->name('pos.switch-template');
    Route::post('/pos/orders/{order}/approve-cash', [PosController::class, 'approveCashOrder'])->name('pos.approve-cash');

    // Route Buka & Tutup Shift Kasir (Petty Cash)
    Route::post('/pos/shift/open', [PosController::class, 'openShift'])->name('pos.shift.open');
    Route::post('/pos/shift/close', [PosController::class, 'closeShift'])->name('pos.shift.close');

    Route::get('/management', [ManagementController::class, 'index'])->name('management.index');
    Route::post('/management/stocks', [ManagementController::class, 'storeStock'])->name('management.stocks.store');
    Route::post('/management/stocks/{stock}/restock', [ManagementController::class, 'restock'])->name('management.stocks.restock');
    Route::post('/management/menus', [ManagementController::class, 'storeMenu'])->name('management.menus.store');
    Route::post('/management/menus/{menu}/toggle', [ManagementController::class, 'toggleMenuAvailability'])->name('management.menus.toggle');
    Route::delete('/management/menus/{menu}', [ManagementController::class, 'destroyMenu'])->name('management.menus.destroy');
    Route::post('/management/tables', [ManagementController::class, 'storeTable'])->name('management.tables.store');
    Route::post('/management/orders/{order}/status', [ManagementController::class, 'updateOrderStatus'])->name('management.orders.status');
    Route::post('/management/orders/{order}/driver', [ManagementController::class, 'assignDriver'])->name('management.orders.driver');
    Route::post('/management/staffs', [ManagementController::class, 'storeStaff'])->name('management.staffs.store');
});

// 6. Grup Route Profile Bawaan Laravel Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

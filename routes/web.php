<?php

use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\GovernanceController;
use App\Http\Controllers\HrAndFeedbackController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ManagementController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\MenuEngineeringController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\TenantOnboardingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 1. Landing Page SaaS TechnoG CaffeOS & Onboarding Kafe Baru
Route::get('/', [TenantOnboardingController::class, 'landing'])->name('welcome');
Route::post('/saas/register-cafe', [TenantOnboardingController::class, 'registerCafe'])->name('saas.register-cafe');
Route::post('/saas/quick-demo', [TenantOnboardingController::class, 'quickDemoLogin'])->name('saas.quick-demo');

// 2. Route Publik untuk Pelanggan (Scan QR Code Meja, Self-Order, Waiter Call, Rating, & AI Co-Worker)
Route::get('/order/qr/{qrCode}', [CustomerOrderController::class, 'scanTable'])->name('customer.scan');
Route::post('/order/qr/{qrCode}', [CustomerOrderController::class, 'submitOrder'])->name('customer.submit-order');
Route::get('/order/status/{orderCode}', [CustomerOrderController::class, 'orderStatus'])->name('customer.order-status');
Route::post('/order/status/{orderCode}/action', [HrAndFeedbackController::class, 'submitCustomerAction'])->name('customer.action');
Route::post('/order/ai-chat', [CustomerOrderController::class, 'askAi'])->name('customer.ask-ai');

// 3. Smart Redirect Setelah Login Berdasarkan Role User
Route::get('/dashboard', function (Request $request) {
    return match ($request->user()->role) {
        'owner' => redirect()->route('owner.dashboard'),
        'barista' => redirect()->route('management.index'),
        default => redirect()->route('pos.index'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// 4. GRUP KHUSUS OWNER (Super Admin HQ, Monitoring Bisnis, Payroll, Audit CCTV, & Tambah Karyawan)
Route::middleware(['auth', 'role:owner'])->group(function () {
    Route::get('/super-admin', [SuperAdminController::class, 'index'])->name('superadmin.dashboard');
    Route::post('/super-admin/cafes/{cafe}/toggle', [SuperAdminController::class, 'toggleCafeStatus'])->name('superadmin.cafes.toggle');
    Route::post('/super-admin/cafes/{cafe}/template', [SuperAdminController::class, 'updateCafeTemplate'])->name('superadmin.cafes.template');
    Route::post('/super-admin/cafes/{cafe}/impersonate', [SuperAdminController::class, 'impersonateCafe'])->name('superadmin.cafes.impersonate');
    Route::post('/super-admin/templates', [SuperAdminController::class, 'storeTemplate'])->name('superadmin.templates.store');

    Route::get('/owner', [OwnerController::class, 'index'])->name('owner.dashboard');
    Route::post('/owner/ai-chat', [OwnerController::class, 'askOwnerAi'])->name('owner.ask-ai');
    Route::post('/owner/settings', [OwnerController::class, 'updateCafeSettings'])->name('owner.settings.update');
    Route::get('/owner/export-csv', [OwnerController::class, 'exportCsv'])->name('owner.export');

    // Route Payroll Slip Gaji Otomatis & Audit Trail (CCTV)
    Route::get('/governance', [GovernanceController::class, 'index'])->name('governance.index');
    Route::post('/governance/pay-salary', [GovernanceController::class, 'disburseSalary'])->name('governance.pay-salary');

    Route::post('/management/staffs', [ManagementController::class, 'storeStaff'])->name('management.staffs.store');
});

// 5. GRUP KHUSUS OWNER & CASHIER (Kasir POS, Shift Laci, Keuangan, Loyalty Marketing WA, & Promo Voucher)
Route::middleware(['auth', 'role:owner,cashier'])->group(function () {
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');
    Route::post('/pos/orders/{order}/approve-cash', [PosController::class, 'approveCashOrder'])->name('pos.approve-cash');

    Route::post('/pos/shift/open', [PosController::class, 'openShift'])->name('pos.shift.open');
    Route::post('/pos/shift/close', [PosController::class, 'closeShift'])->name('pos.shift.close');

    // Route Loyalty Point Member, Tukar Hadiah & WhatsApp Marketing Blast
    Route::get('/marketing', [MarketingController::class, 'index'])->name('marketing.index');
    Route::post('/marketing/redeem', [MarketingController::class, 'redeemPoints'])->name('marketing.redeem');
    Route::post('/marketing/rewards', [MarketingController::class, 'storeReward'])->name('marketing.rewards.store');

    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/expenses', [FinanceController::class, 'storeExpense'])->name('finance.expenses.store');
    Route::delete('/finance/expenses/{expense}', [FinanceController::class, 'destroyExpense'])->name('finance.expenses.destroy');
    Route::post('/finance/orders/{order}/void', [FinanceController::class, 'voidOrder'])->name('finance.orders.void');

    Route::post('/management/vouchers', [ManagementController::class, 'storeVoucher'])->name('management.vouchers.store');
    Route::post('/management/vouchers/{voucher}/toggle', [ManagementController::class, 'toggleVoucher'])->name('management.vouchers.toggle');
    Route::delete('/management/vouchers/{voucher}', [ManagementController::class, 'destroyVoucher'])->name('management.vouchers.destroy');
});

// 6. GRUP KHUSUS OWNER & BARISTA (HPP Menu Engineering, Gudang Supply Chain, PO Supplier, & Input Resep)
Route::middleware(['auth', 'role:owner,barista'])->group(function () {
    // Route Kalkulator HPP Resep & Matriks Statistik Menu Engineering
    Route::get('/menu-engineering', [MenuEngineeringController::class, 'index'])->name('menu-engineering.index');
    Route::post('/menu-engineering/stock-costs', [MenuEngineeringController::class, 'updateStockCosts'])->name('menu-engineering.stocks.costs');
    Route::post('/menu-engineering/menus/{menu}/price', [MenuEngineeringController::class, 'updateMenuPrice'])->name('menu-engineering.menus.price');

    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/suppliers', [InventoryController::class, 'storeSupplier'])->name('inventory.suppliers.store');
    Route::delete('/inventory/suppliers/{supplier}', [InventoryController::class, 'destroySupplier'])->name('inventory.suppliers.destroy');
    Route::post('/inventory/logs', [InventoryController::class, 'storeStockLog'])->name('inventory.logs.store');

    Route::post('/management/stocks', [ManagementController::class, 'storeStock'])->name('management.stocks.store');
    Route::post('/management/stocks/{stock}/restock', [ManagementController::class, 'restock'])->name('management.stocks.restock');
    Route::post('/management/menus', [ManagementController::class, 'storeMenu'])->name('management.menus.store');
    Route::delete('/management/menus/{menu}', [ManagementController::class, 'destroyMenu'])->name('management.menus.destroy');
});

// 7. GRUP BERSAMA: OWNER, CASHIER, & BARISTA (Dapur, TV Antrean, Denah Meja, & HR Absensi/Layanan)
Route::middleware(['auth', 'role:owner,cashier,barista'])->group(function () {
    Route::get('/queue-board', [PosController::class, 'queueBoard'])->name('pos.queue-board');
    Route::post('/pos/switch-template', [PosController::class, 'switchTemplate'])->name('pos.switch-template');

    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::post('/reservations', [ReservationController::class, 'storeReservation'])->name('reservations.store');
    Route::post('/reservations/{reservation}/status', [ReservationController::class, 'updateReservationStatus'])->name('reservations.status');
    Route::post('/reservations/tables/{table}/status', [ReservationController::class, 'updateTableStatus'])->name('reservations.tables.status');

    Route::get('/hr', [HrAndFeedbackController::class, 'index'])->name('hr.index');
    Route::post('/hr/enroll-face', [HrAndFeedbackController::class, 'enrollMasterFace'])->name('hr.enroll-face');
    Route::post('/hr/clock-in', [HrAndFeedbackController::class, 'clockIn'])->name('hr.clock-in');
    Route::post('/hr/clock-out', [HrAndFeedbackController::class, 'clockOut'])->name('hr.clock-out');
    Route::post('/hr/set-cafe-location', [HrAndFeedbackController::class, 'setCafeLocation'])->name('hr.set-cafe-location');
    Route::post('/hr/calls/{feedback}/resolve', [HrAndFeedbackController::class, 'resolveCall'])->name('hr.calls.resolve');

    Route::get('/management', [ManagementController::class, 'index'])->name('management.index');
    Route::post('/management/menus/{menu}/toggle', [ManagementController::class, 'toggleMenuAvailability'])->name('management.menus.toggle');
    Route::post('/management/tables', [ManagementController::class, 'storeTable'])->name('management.tables.store');
    Route::post('/management/orders/{order}/status', [ManagementController::class, 'updateOrderStatus'])->name('management.orders.status');
    Route::post('/management/orders/{order}/driver', [ManagementController::class, 'assignDriver'])->name('management.orders.driver');
});

// 8. Grup Route Profile Bawaan Laravel Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

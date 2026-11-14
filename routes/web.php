<?php

use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CoworkingController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Controllers\EventHubController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\GovernanceController;
use App\Http\Controllers\HrAndFeedbackController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\KdsController;
use App\Http\Controllers\ManagementController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\MenuEngineeringController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QrStudioController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RoasteryController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\TenantOnboardingController;
use App\Http\Controllers\ZReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 1. Landing Page SaaS TechnoG CaffeOS & Onboarding Kafe Baru
Route::get('/', [TenantOnboardingController::class, 'landing'])->name('welcome');
Route::post('/saas/register-cafe', [TenantOnboardingController::class, 'registerCafe'])->name('saas.register-cafe');
Route::post('/saas/quick-demo', [TenantOnboardingController::class, 'quickDemoLogin'])->name('saas.quick-demo');

// 2. Route Publik untuk Pelanggan (Scan QR Code Meja, Self-Order, Delivery Ojol, Waiter Call, Rating, & AI Co-Worker)
Route::get('/order/qr/{qrCode}', [CustomerOrderController::class, 'scanTable'])->name('customer.scan');
Route::post('/order/qr/{qrCode}', [CustomerOrderController::class, 'submitOrder'])->name('customer.submit-order');
Route::get('/order/status/{orderCode}', [CustomerOrderController::class, 'orderStatus'])->name('customer.order-status');
Route::post('/order/status/{orderCode}/action', [HrAndFeedbackController::class, 'submitCustomerAction'])->name('customer.action');
Route::post('/order/ai-chat', [CustomerOrderController::class, 'askAi'])->name('customer.ask-ai');

// 3. Smart Redirect Setelah Login Berdasarkan Role User
Route::get('/dashboard', function (Request $request) {
    return match ($request->user()->role) {
        'owner' => redirect()->route('owner.dashboard'),
        'barista' => redirect()->route('kds.index'),
        default => redirect()->route('pos.index'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// 4. GRUP KHUSUS OWNER (Pusat Komando, Analitik, Super Admin HQ & Payroll Audit CCTV)
Route::middleware(['auth', 'role:owner'])->group(function () {
    // Executive Lounge & Pengaturan Kafe
    Route::get('/owner', [OwnerController::class, 'index'])->name('owner.dashboard');
    Route::post('/owner/ai-chat', [AiAssistantController::class, 'askStaffAi'])->name('owner.ask-ai');
    Route::post('/owner/settings', [OwnerController::class, 'updateCafeSettings'])->name('owner.settings.update');
    Route::get('/owner/export-csv', [OwnerController::class, 'exportCsv'])->name('owner.export');

    // Prediksi Statistik (Stock Burn-Rate), Heatmap Jam Sibuk & Simulator Profit
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    // Super Admin SaaS Multi-Tenant HQ
    Route::get('/super-admin', [SuperAdminController::class, 'index'])->name('superadmin.dashboard');
    Route::post('/super-admin/cafes/{cafe}/toggle', [SuperAdminController::class, 'toggleCafeStatus'])->name('superadmin.cafes.toggle');
    Route::post('/super-admin/cafes/{cafe}/template', [SuperAdminController::class, 'updateCafeTemplate'])->name('superadmin.cafes.template');
    Route::post('/super-admin/cafes/{cafe}/impersonate', [SuperAdminController::class, 'impersonateCafe'])->name('superadmin.cafes.impersonate');
    Route::post('/super-admin/templates', [SuperAdminController::class, 'storeTemplate'])->name('superadmin.templates.store');

    // Payroll Slip Gaji Otomatis & Audit Trail (CCTV)
    Route::get('/governance', [GovernanceController::class, 'index'])->name('governance.index');
    Route::post('/governance/pay-salary', [GovernanceController::class, 'disburseSalary'])->name('governance.pay-salary');

    // Registrasi Akun Staf Baru
    Route::post('/management/staffs', [ManagementController::class, 'storeStaff'])->name('management.staffs.store');
});

// 5. GRUP KHUSUS OWNER & CASHIER (Kasir POS, Studio QR, Co-Working, Event, Loyalty WA, Keuangan & Z-Report)
Route::middleware(['auth', 'role:owner,cashier'])->group(function () {
    // Kasir POS Engine & Shift Laci
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');
    Route::post('/pos/orders/{order}/approve-cash', [PosController::class, 'approveCashOrder'])->name('pos.approve-cash');
    Route::post('/pos/shift/open', [PosController::class, 'openShift'])->name('pos.shift.open');
    Route::post('/pos/shift/close', [PosController::class, 'closeShift'])->name('pos.shift.close');

    // Studio Desain & Cetak Standee QR Code Meja Akrilik
    Route::get('/qr-studio', [QrStudioController::class, 'index'])->name('qr-studio.index');
    Route::post('/qr-studio/tables/{table}/regenerate', [QrStudioController::class, 'regenerateQr'])->name('qr-studio.regenerate');

    // Co-Working Space Pass, Paket B2B Catering & Cetak Invoice Resmi
    Route::get('/coworking', [CoworkingController::class, 'index'])->name('coworking.index');
    Route::post('/coworking/packages', [CoworkingController::class, 'storePackage'])->name('coworking.packages.store');
    Route::post('/coworking/checkout', [CoworkingController::class, 'checkoutPackage'])->name('coworking.checkout');

    // Manajemen Event Komunitas & Tiket Workshop Barista
    Route::get('/events', [EventHubController::class, 'index'])->name('events.index');
    Route::post('/events', [EventHubController::class, 'storeEvent'])->name('events.store');
    Route::post('/events/tickets/sell', [EventHubController::class, 'sellTicket'])->name('events.tickets.sell');

    // Loyalty Point Member, Tukar Hadiah & WhatsApp Marketing Blast
    Route::get('/marketing', [MarketingController::class, 'index'])->name('marketing.index');
    Route::post('/marketing/redeem', [MarketingController::class, 'redeemPoints'])->name('marketing.redeem');
    Route::post('/marketing/rewards', [MarketingController::class, 'storeReward'])->name('marketing.rewards.store');

    // Ledger Keuangan & Void Struk
    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/expenses', [FinanceController::class, 'storeExpense'])->name('finance.expenses.store');
    Route::delete('/finance/expenses/{expense}', [FinanceController::class, 'destroyExpense'])->name('finance.expenses.destroy');
    Route::post('/finance/orders/{order}/void', [FinanceController::class, 'voidOrder'])->name('finance.orders.void');

    // Laporan Tutup Buku Harian (Z-Report), Pajak PB1 & Laba Rugi Resmi Siap Cetak A4
    Route::get('/reports', [ZReportController::class, 'index'])->name('reports.index');

    // Kelola Voucher Diskon
    Route::post('/management/vouchers', [ManagementController::class, 'storeVoucher'])->name('management.vouchers.store');
    Route::post('/management/vouchers/{voucher}/toggle', [ManagementController::class, 'toggleVoucher'])->name('management.vouchers.toggle');
    Route::delete('/management/vouchers/{voucher}', [ManagementController::class, 'destroyVoucher'])->name('management.vouchers.destroy');
});

// 6. GRUP KHUSUS OWNER & BARISTA (HPP Menu Matrix, Roastery & Kalibrasi QC, Gudang Supply Chain PO)
Route::middleware(['auth', 'role:owner,barista'])->group(function () {
    // Kalkulator HPP Resep & Matriks Statistik Menu Engineering
    Route::get('/menu-engineering', [MenuEngineeringController::class, 'index'])->name('menu-engineering.index');
    Route::post('/menu-engineering/stock-costs', [MenuEngineeringController::class, 'updateStockCosts'])->name('menu-engineering.stocks.costs');
    Route::post('/menu-engineering/menus/{menu}/price', [MenuEngineeringController::class, 'updateMenuPrice'])->name('menu-engineering.menus.price');

    // Roastery Batch Tracker & Kalibrasi Dial-In Espresso Harian
    Route::get('/roastery', [RoasteryController::class, 'index'])->name('roastery.index');
    Route::post('/roastery/batch', [RoasteryController::class, 'storeRoastBatch'])->name('roastery.batch.store');
    Route::post('/roastery/dial-in', [RoasteryController::class, 'storeDialInLog'])->name('roastery.dial-in.store');

    // Gudang Supply Chain, PO Supplier & Stock Opname
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/suppliers', [InventoryController::class, 'storeSupplier'])->name('inventory.suppliers.store');
    Route::delete('/inventory/suppliers/{supplier}', [InventoryController::class, 'destroySupplier'])->name('inventory.suppliers.destroy');
    Route::post('/inventory/logs', [InventoryController::class, 'storeStockLog'])->name('inventory.logs.store');

    // Master Stok & Resep Menu
    Route::post('/management/stocks', [ManagementController::class, 'storeStock'])->name('management.stocks.store');
    Route::post('/management/stocks/{stock}/restock', [ManagementController::class, 'restock'])->name('management.stocks.restock');
    Route::post('/management/menus', [ManagementController::class, 'storeMenu'])->name('management.menus.store');
    Route::delete('/management/menus/{menu}', [ManagementController::class, 'destroyMenu'])->name('management.menus.destroy');
});

// 7. GRUP BERSAMA: OWNER, CASHIER, & BARISTA (Delivery Ojol, Denah, TV Antrean, Smart KDS, Katalog, Mesin/Roster, HR & Global AI)
Route::middleware(['auth', 'role:owner,cashier,barista'])->group(function () {
    // Global AI Database Assistant untuk Semua Role Staf
    Route::post('/ai-assistant/ask', [AiAssistantController::class, 'askStaffAi'])->name('ai.staff.ask');

    // Manajemen Order Delivery Online & Dispatch Ojol (GoSend / GrabExpress / Maxim / Kurir Kafe)
    Route::get('/deliveries', [DeliveryOrderController::class, 'index'])->name('deliveries.index');
    Route::post('/deliveries/{order}/assign', [DeliveryOrderController::class, 'assignOjolDriver'])->name('deliveries.assign');

    // Denah Meja & Reservasi Booking
    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::post('/reservations', [ReservationController::class, 'storeReservation'])->name('reservations.store');
    Route::post('/reservations/{reservation}/status', [ReservationController::class, 'updateReservationStatus'])->name('reservations.status');
    Route::post('/reservations/tables/{table}/status', [ReservationController::class, 'updateTableStatus'])->name('reservations.tables.status');

    // Layar TV Antrean & Switcher Tema UI
    Route::get('/queue-board', [PosController::class, 'queueBoard'])->name('pos.queue-board');
    Route::post('/pos/switch-template', [PosController::class, 'switchTemplate'])->name('pos.switch-template');

    // Smart KDS Barista & SLA Stopwatch
    Route::get('/kds', [KdsController::class, 'index'])->name('kds.index');
    Route::post('/kds/orders/{order}/bump', [KdsController::class, 'bumpStatus'])->name('kds.bump');

    // Katalog Menu, Resep & Antrean Dapur
    Route::get('/management', [ManagementController::class, 'index'])->name('management.index');
    Route::post('/management/menus/{menu}/toggle', [ManagementController::class, 'toggleMenuAvailability'])->name('management.menus.toggle');
    Route::post('/management/tables', [ManagementController::class, 'storeTable'])->name('management.tables.store');
    Route::post('/management/orders/{order}/status', [ManagementController::class, 'updateOrderStatus'])->name('management.orders.status');
    Route::post('/management/orders/{order}/driver', [ManagementController::class, 'assignDriver'])->name('management.orders.driver');

    // Monitoring Mesin Kopi & Jadwal Shift Roster Mingguan
    Route::get('/operations', [OperationsController::class, 'index'])->name('operations.index');
    Route::post('/operations/equipments', [OperationsController::class, 'storeEquipment'])->name('operations.equipments.store');
    Route::post('/operations/equipments/service', [OperationsController::class, 'logMaintenance'])->name('operations.equipments.service');
    Route::post('/operations/roster', [OperationsController::class, 'updateRoster'])->name('operations.roster.save');

    // Presensi Biometrik Wajah, Geofencing GPS & Panggilan Pelayan
    Route::get('/hr', [HrAndFeedbackController::class, 'index'])->name('hr.index');
    Route::post('/hr/enroll-face', [HrAndFeedbackController::class, 'enrollMasterFace'])->name('hr.enroll-face');
    Route::post('/hr/clock-in', [HrAndFeedbackController::class, 'clockIn'])->name('hr.clock-in');
    Route::post('/hr/clock-out', [HrAndFeedbackController::class, 'clockOut'])->name('hr.clock-out');
    Route::post('/hr/set-cafe-location', [HrAndFeedbackController::class, 'setCafeLocation'])->name('hr.set-cafe-location');
    Route::post('/hr/calls/{feedback}/resolve', [HrAndFeedbackController::class, 'resolveCall'])->name('hr.calls.resolve');
});

// 8. Grup Route Profile Bawaan Laravel Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Master Supplier / Pemasok Bahan Baku
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('contact_person', 100)->nullable();
            $table->string('phone', 30);
            $table->string('category', 100)->default('Biji Kopi & Susu');
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Riwayat Mutasi Stok (Purchase Order Masuk, Stock Opname, & Waste/Rusak)
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('stock_id')->constrained('stocks')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['purchase_in', 'opname_adjustment', 'waste_out'])->default('purchase_in');
            $table->decimal('qty_change', 12, 2); // Positif jika masuk, negatif jika keluar/rusak
            $table->decimal('total_cost', 12, 2)->default(0); // Biaya belanja PO
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 3. Tabel Reservasi / Booking Meja Kafe
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('table_id')->constrained('tables')->cascadeOnDelete();
            $table->string('booking_code', 50)->unique();
            $table->string('customer_name', 150);
            $table->string('customer_phone', 30);
            $table->integer('guest_count')->default(2);
            $table->dateTime('reservation_time');
            $table->decimal('dp_amount', 12, 2)->default(0);
            $table->enum('status', ['booked', 'checked_in', 'completed', 'cancelled'])->default('booked');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('stock_logs');
        Schema::dropIfExists('suppliers');
    }
};

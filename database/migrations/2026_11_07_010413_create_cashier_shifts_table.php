<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('opening_cash', 12, 2)->default(0); // Modal awal uang kembalian di laci
            $table->decimal('total_cash_sales', 12, 2)->default(0); // Total penjualan Cash selama shift
            $table->decimal('total_qris_sales', 12, 2)->default(0); // Total penjualan QRIS/Online selama shift
            $table->decimal('expected_cash', 12, 2)->default(0); // Seharusnya ada di laci (opening + cash_sales)
            $table->decimal('actual_cash', 12, 2)->nullable(); // Uang fisik yang dihitung kasir saat tutup shift
            $table->decimal('difference', 12, 2)->nullable(); // Selisih (actual_cash - expected_cash)
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->text('notes')->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cashier_shifts');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 150); // Contoh: Beli Es Batu Kristal 5 Pak
            $table->string('category', 100)->default('Operasional Dapur'); // Bahan Baku, Operasional, Utilitas, Lainnya
            $table->decimal('amount', 12, 2);
            $table->enum('payment_source', ['cash_drawer', 'bank_transfer'])->default('cash_drawer');
            $table->date('expense_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

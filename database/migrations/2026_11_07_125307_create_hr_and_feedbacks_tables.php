<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Absensi Kehadiran Karyawan (Dengan Scan Wajah & Geolocation GPS)
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('work_date');
            $table->timestamp('clock_in')->nullable();
            $table->timestamp('clock_out')->nullable();
            $table->string('photo_in')->nullable(); // Bukti foto scan wajah masuk
            $table->string('photo_out')->nullable(); // Bukti foto scan wajah pulang
            $table->decimal('latitude', 10, 7)->nullable(); // Titik GPS Latitude
            $table->decimal('longitude', 10, 7)->nullable(); // Titik GPS Longitude
            $table->integer('distance_meters')->default(0); // Jarak dari titik kafe (Meter)
            $table->decimal('face_confidence', 5, 2)->default(98.50); // Persentase kecocokan wajah
            $table->enum('status', ['present', 'late', 'outside_radius'])->default('present');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Panggilan Pelayan (Waiter Call) & Rating Ulasan Pelanggan
        Schema::create('customer_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('customer_name', 150);
            $table->string('table_number', 30)->nullable();
            $table->integer('rating')->nullable();
            $table->text('comment')->nullable();
            $table->string('waiter_call_type', 100)->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_feedbacks');
        Schema::dropIfExists('attendances');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Master Template UI Kasir
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('preview_url')->nullable();
            $table->json('layout_config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Tabel Tenant / Kafe
        Schema::create('cafes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('templates')->cascadeOnUpdate();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->string('logo')->nullable();
            $table->text('address')->nullable();
            $table->string('theme_color', 20)->default('#10B981');
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Tabel Users (Owner, Cashier, Barista)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 25)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['owner', 'cashier', 'barista'])->default('cashier');
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('cafes');
        Schema::dropIfExists('templates');
    }
};

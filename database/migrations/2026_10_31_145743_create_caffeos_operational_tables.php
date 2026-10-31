<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 4. Tabel Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->string('member_code', 50)->unique()->nullable();
            $table->string('name', 150);
            $table->string('email', 150)->nullable();
            $table->string('phone', 25);
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // 5. Tabel Meja (Tables)
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->string('table_number', 20);
            $table->string('qr_code')->unique();
            $table->string('location', 100)->default('Indoor');
            $table->enum('status', ['available', 'occupied', 'reserved'])->default('available');
            $table->timestamps();
        });

        // 6. Tabel Menu
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('category', 100);
            $table->text('description')->nullable();
            $table->text('treatment')->nullable(); // Perlakuan penyajian untuk Barista
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        // 7. Tabel Stocks (Bahan Baku & Kemasan)
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->string('name', 150);
            $table->enum('type', ['raw_material', 'packaging', 'other'])->default('raw_material');
            $table->string('unit', 20); // gram, ml, pcs
            $table->decimal('current_qty', 12, 2)->default(0);
            $table->decimal('min_qty_alert', 12, 2)->default(10);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 8. Tabel Pivot Menu Stocks (Komposisi Resep)
        Schema::create('menu_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->foreignId('stock_id')->constrained('stocks')->cascadeOnDelete();
            $table->decimal('qty_needed', 10, 2);
        });

        // 9. Tabel Orders (Header Transaksi)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('table_id')->nullable()->constrained('tables')->nullOnDelete();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('order_code', 50)->unique();
            $table->integer('queue_number');
            $table->string('customer_name', 150);
            $table->enum('order_type', ['dine_in', 'takeaway', 'delivery'])->default('dine_in');
            $table->enum('order_status', ['pending', 'paid', 'processing', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->timestamps();
        });

        // 10. Tabel Order Items (Detail Menu yang Dibeli)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained('menus')->restrictOnDelete();
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->string('notes')->nullable();
        });

        // 11. Tabel Payments (Cash vs Online Payment)
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->enum('payment_method', ['cash', 'qris', 'va', 'ewallet'])->default('cash');
            $table->enum('payment_status', ['unpaid', 'paid', 'failed', 'refunded'])->default('unpaid');
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('change_amount', 12, 2)->default(0);
            $table->string('gateway_ref_id', 150)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // 12. Tabel Deliveries (Pengganti Tabel Driver)
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->string('driver_name', 150)->nullable();
            $table->string('driver_phone', 25)->nullable();
            $table->text('recipient_address');
            $table->string('order_locate')->nullable();
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->enum('tracking_status', ['waiting_driver', 'picked_up', 'on_the_way', 'delivered', 'cancelled'])->default('waiting_driver');
            $table->timestamps();
        });

        // 13. Tabel AI Tokens (Gatekeeper AI Chatbot Co-Worker)
        Schema::create('ai_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->unique()->constrained('orders')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('token_code', 100)->unique();
            $table->enum('token_type', ['customer_order', 'owner_assistant'])->default('customer_order');
            $table->integer('quota_limit')->default(10);
            $table->integer('quota_used')->default(0);
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 14. Tabel AI Chat Logs
        Schema::create('ai_chat_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_token_id')->constrained('ai_tokens')->cascadeOnDelete();
            $table->text('prompt');
            $table->text('response');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_logs');
        Schema::dropIfExists('ai_tokens');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('menu_stocks');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('tables');
        Schema::dropIfExists('customers');
    }
};

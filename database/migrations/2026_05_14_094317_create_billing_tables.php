<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('billing_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 36)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 64);
            $table->string('status', 32);
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3)->default('IDR');
            $table->json('meta')->nullable();
            $table->string('gateway_provider')->nullable();
            $table->string('gateway_payment_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_message')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('billing_transaction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_transaction_id')->constrained('billing_transactions')->cascadeOnDelete();
            $table->string('action', 128);
            $table->string('message');
            $table->json('context')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['billing_transaction_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_transaction_logs');
        Schema::dropIfExists('billing_transactions');
    }
};

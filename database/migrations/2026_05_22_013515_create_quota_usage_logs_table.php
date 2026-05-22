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
        Schema::create('quota_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('billing_transaction_id')->nullable()->constrained('billing_transactions')->nullOnDelete();
            $table->string('device_identifier');
            $table->string('device_label')->nullable();
            $table->unsignedInteger('quota_used')->default(1);
            $table->unsignedInteger('quota_before')->nullable();
            $table->unsignedInteger('quota_after')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quota_usage_logs');
    }
};

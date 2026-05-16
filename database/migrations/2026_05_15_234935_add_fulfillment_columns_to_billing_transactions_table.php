<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->timestamp('fulfilled_at')->nullable()->after('paid_at');
            $table->unsignedSmallInteger('fulfillment_attempts')->default(0)->after('fulfilled_at');
            $table->text('fulfillment_error')->nullable()->after('fulfillment_attempts');
            $table->text('fulfillment_response')->nullable()->after('fulfillment_error');
        });
    }

    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropColumn(['fulfilled_at', 'fulfillment_attempts', 'fulfillment_error', 'fulfillment_response']);
        });
    }
};

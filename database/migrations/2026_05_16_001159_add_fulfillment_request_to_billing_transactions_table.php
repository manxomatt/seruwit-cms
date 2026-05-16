<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->string('fulfillment_endpoint')->nullable()->after('fulfillment_response');
            $table->string('fulfillment_method', 10)->nullable()->after('fulfillment_endpoint');
            $table->json('fulfillment_request')->nullable()->after('fulfillment_method');
        });
    }

    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropColumn(['fulfillment_endpoint', 'fulfillment_method', 'fulfillment_request']);
        });
    }
};

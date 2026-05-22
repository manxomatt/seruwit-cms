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
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->string('invoice_number', 32)->nullable()->unique()->after('reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn('invoice_number');
        });
    }
};

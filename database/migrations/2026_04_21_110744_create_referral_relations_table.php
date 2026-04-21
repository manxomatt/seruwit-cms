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
        Schema::create('referral_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_manager_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('external_manager_id')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('referral_code');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_relations');
    }
};

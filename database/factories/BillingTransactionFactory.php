<?php

namespace Database\Factories;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BillingTransaction>
 */
class BillingTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => fake()->numberBetween(10_000, 500_000),
            'currency' => 'IDR',
            'meta' => ['quantity' => fake()->numberBetween(1, 10), 'unit_price' => 10_000],
            'gateway_provider' => 'generic',
        ];
    }
}

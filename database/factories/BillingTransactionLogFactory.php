<?php

namespace Database\Factories;

use App\Models\BillingTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BillingTransactionLog>
 */
class BillingTransactionLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'billing_transaction_id' => BillingTransaction::factory(),
            'action' => 'test.event',
            'message' => fake()->sentence(),
            'context' => null,
            'ip_address' => fake()->ipv4(),
        ];
    }
}

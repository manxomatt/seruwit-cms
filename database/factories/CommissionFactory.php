<?php

namespace Database\Factories;

use App\Models\AccountManager;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Commission>
 */
class CommissionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $value = fake()->randomFloat(2, 1, 20);
        $amount = fake()->randomFloat(2, 10, 1000);

        return [
            'account_manager_id' => AccountManager::factory(),
            'transaction_id' => fake()->uuid(),
            'commission_type' => fake()->randomElement(['percentage', 'flat']),
            'commission_value' => $value,
            'commission_amount' => $amount,
            'status' => 'pending',
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
        ]);
    }
}

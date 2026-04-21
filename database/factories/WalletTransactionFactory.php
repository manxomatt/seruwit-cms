<?php

namespace Database\Factories;

use App\Models\AccountManager;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WalletTransaction>
 */
class WalletTransactionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $balanceBefore = fake()->randomFloat(2, 0, 10000);
        $amount = fake()->randomFloat(2, 10, 1000);

        return [
            'account_manager_id' => AccountManager::factory(),
            'commission_id' => null,
            'type' => fake()->randomElement(['credit', 'debit']),
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceBefore + $amount,
            'description' => fake()->sentence(),
        ];
    }

    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'credit',
        ]);
    }

    public function debit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debit',
        ]);
    }
}

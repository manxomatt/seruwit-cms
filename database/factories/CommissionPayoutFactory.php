<?php

namespace Database\Factories;

use App\Models\AccountManager;
use App\Models\CommissionPayout;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommissionPayout>
 */
class CommissionPayoutFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'account_manager_id' => AccountManager::factory(),
            'amount' => fake()->randomFloat(2, 50_000, 1_000_000),
            'status' => CommissionPayout::STATUS_PENDING,
            'bank_name' => fake()->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI']),
            'bank_account_number' => fake()->numerify('##########'),
            'bank_account_name' => fake()->name(),
            'notes' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CommissionPayout::STATUS_APPROVED,
            'processed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CommissionPayout::STATUS_REJECTED,
            'rejection_reason' => fake()->sentence(),
            'processed_at' => now(),
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CommissionPayout::STATUS_PAID,
            'processed_at' => now(),
        ]);
    }
}

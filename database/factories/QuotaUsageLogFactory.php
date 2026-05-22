<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuotaUsageLog>
 */
class QuotaUsageLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $before = fake()->numberBetween(1, 10);

        return [
            'user_id' => User::factory(),
            'billing_transaction_id' => null,
            'device_identifier' => 'IMEI-'.fake()->numerify('############'),
            'device_label' => fake()->optional()->word(),
            'quota_used' => 1,
            'quota_before' => $before,
            'quota_after' => $before - 1,
            'notes' => null,
        ];
    }
}

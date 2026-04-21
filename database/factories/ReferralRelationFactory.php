<?php

namespace Database\Factories;

use App\Models\AccountManager;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReferralRelation>
 */
class ReferralRelationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'account_manager_id' => AccountManager::factory(),
            'external_manager_id' => null,
            'user_id' => User::factory(),
            'referral_code' => strtoupper(fake()->bothify('??######')),
        ];
    }
}

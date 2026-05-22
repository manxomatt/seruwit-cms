<?php

namespace Tests\Feature\External;

use App\Models\QuotaUsageLog;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuotaUsageHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeManager(): User
    {
        $role = Role::query()->where('slug', 'external_manager')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    private function makeExternalUser(): User
    {
        $role = Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_guest_cannot_access_quota_usage_history(): void
    {
        $response = $this->get(route('external.quota.usage-history'));

        $response->assertRedirect('/login');
    }

    public function test_non_manager_is_redirected_away_from_usage_history(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.quota.usage-history'));

        $response->assertRedirect(route('external.dashboard'));
        $response->assertSessionHas('error');
    }

    public function test_manager_can_view_their_quota_usage_history(): void
    {
        $manager = $this->makeManager();
        $other = $this->makeManager();

        QuotaUsageLog::factory()->create([
            'user_id' => $manager->id,
            'device_identifier' => 'IMEI-OWN',
            'device_label' => 'Truk A',
            'quota_used' => 1,
            'quota_before' => 5,
            'quota_after' => 4,
        ]);

        QuotaUsageLog::factory()->create([
            'user_id' => $other->id,
            'device_identifier' => 'IMEI-OTHER',
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Quota/UsageHistory')
            ->has('logs.data', 1)
            ->where('logs.data.0.device_identifier', 'IMEI-OWN')
            ->where('logs.data.0.device_label', 'Truk A')
            ->where('logs.data.0.quota_used', 1)
            ->where('logs.data.0.quota_before', 5)
            ->where('logs.data.0.quota_after', 4)
        );
    }

    public function test_manager_sees_empty_state_when_no_quota_used(): void
    {
        $manager = $this->makeManager();

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Quota/UsageHistory')
            ->has('logs.data', 0)
        );
    }
}

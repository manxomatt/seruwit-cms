<?php

namespace Tests\Feature\External;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExternalDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalUser(?string $externalId = '16'): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create([
            'status' => 'active',
            'external_id' => $externalId,
        ]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    private function sampleBillingPayload(): array
    {
        return [
            'success' => true,
            'user' => [
                'id' => 16,
                'username' => 'andito',
                'email' => 'anditowilly2@gmail.com',
                'active' => 'true',
                'manager_id' => 16,
                'role' => 'manager',
                'privileges' => [
                    'type' => 'manager',
                    'map_osm' => true,
                    'dashboard' => true,
                ],
                'account_expire' => 'false',
                'account_expire_dt' => null,
                'obj_add' => 'true',
                'obj_limit' => 'true',
                'obj_limit_num' => 19,
                'obj_days' => 'false',
                'obj_days_dt' => null,
                'currency' => 'IDR',
                'timezone' => '+ 7 hour',
                'language' => 'english',
                'dt_reg' => '2026-03-28T02:30:24.000000Z',
                'dt_login' => '2026-05-10T23:28:01.000000Z',
            ],
            'quota' => [
                'obj_limit_num' => 19,
                'objects_assigned' => 15,
                'objects_trial_linked' => 3,
                'linked_objects_total' => 18,
                'objects_remaining' => 4,
                'objects_expired' => 2,
                'objects_expired_non_trial' => 0,
                'objects_expired_trial' => 2,
            ],
        ];
    }

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/external/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_dashboard_passes_billing_user_when_api_succeeds(): void
    {
        config(['services.external_api.key' => 'test-api-key']);

        Http::fake([
            '*/billing/users/16*' => Http::response($this->sampleBillingPayload(), 200),
        ]);

        $user = $this->makeExternalUser('16');

        $response = $this->actingAs($user)->get('/external/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('External/Dashboard')
            ->where('billingError', null)
            ->where('billingUser.username', 'andito')
            ->where('billingUser.email', 'anditowilly2@gmail.com')
            ->where('billingQuota.objects_remaining', 4)
            ->has('quotaCartUrl')
            ->has('deviceExtensionUrl')
        );
    }

    public function test_dashboard_sets_error_when_api_returns_non_200(): void
    {
        config(['services.external_api.key' => 'test-api-key']);

        Http::fake([
            '*/billing/users/16*' => Http::response(['message' => 'Unauthorized'], 401),
        ]);

        $user = $this->makeExternalUser('16');

        $response = $this->actingAs($user)->get('/external/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('External/Dashboard')
            ->where('billingUser', null)
            ->where('billingQuota', null)
            ->where('billingError', 'Failed to load billing profile from the external API.')
        );
    }

    public function test_dashboard_sets_error_when_success_flag_is_false(): void
    {
        config(['services.external_api.key' => 'test-api-key']);

        Http::fake([
            '*/billing/users/16*' => Http::response(['success' => false], 200),
        ]);

        $user = $this->makeExternalUser('16');

        $response = $this->actingAs($user)->get('/external/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('billingUser', null)
            ->where('billingError', 'The external API returned an unsuccessful response.')
        );
    }

    public function test_dashboard_does_not_call_billing_api_without_api_key(): void
    {
        config(['services.external_api.key' => '']);

        Http::preventStrayRequests();

        $user = $this->makeExternalUser('16');

        $response = $this->actingAs($user)->get('/external/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('billingUser', null)
            ->where('billingQuota', null)
            ->where('billingError', null)
        );
    }

    public function test_dashboard_does_not_call_billing_api_without_external_id(): void
    {
        config(['services.external_api.key' => 'test-api-key']);

        Http::preventStrayRequests();

        $user = $this->makeExternalUser(null);

        $response = $this->actingAs($user)->get('/external/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('billingUser', null)
            ->where('billingQuota', null)
            ->where('billingError', 'Cannot load billing profile: external user ID is not set for this account.')
        );
    }
}

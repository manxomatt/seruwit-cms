<?php

namespace Tests\Feature\External;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExternalObjectsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        config([
            'services.external_api.url' => 'https://api.example.test/api',
            'services.external_api.key' => 'test-api-key',
        ]);
    }

    private function makeExternalUser(string $externalId = '16'): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create([
            'status' => 'active',
            'external_id' => $externalId,
        ]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    /** @param  array<int, mixed>  $objects */
    private function fakeBillingObjectsApiSuccess(array $objects = []): void
    {
        if (empty($objects)) {
            $objects = [
                [
                    'imei' => '352503095622038',
                    'name' => 'HRV LITE DEV',
                    'manager_id' => 16,
                    'icon' => 'img/markers/objects/blue_car_1.png',
                    'object_expire_dt' => '2027-02-28 00:00:00',
                    'trial' => 'false',
                ],
            ];
        }

        Http::fake([
            '*/billing/objects*' => Http::response([
                'success' => true,
                'manager_id_filter' => 16,
                'filter_applied' => true,
                'objects' => $objects,
                'pagination' => [
                    'total' => count($objects),
                    'per_page' => 100,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => 1,
                    'to' => count($objects),
                ],
            ], 200),
        ]);
    }

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/external/objects');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_objects_page(): void
    {
        $this->fakeBillingObjectsApiSuccess();
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertStatus(200);
    }

    // -------------------------------------------------------------------------
    // Successful API response
    // -------------------------------------------------------------------------

    public function test_objects_page_passes_mapped_objects_to_inertia(): void
    {
        $this->fakeBillingObjectsApiSuccess();
        $user = $this->makeExternalUser('16');

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->has('objects', 1)
            ->where('objects.0.name', 'HRV LITE DEV')
            ->where('objects.0.icon', 'img/markers/objects/blue_car_1.png')
            ->where('objects.0.object_expire_dt', '2027-02-28 00:00:00')
            ->where('objects.0.trial', 'false')
            ->where('objects.0.device_identifier', '352503095622038')
            ->where('error', null)
            ->has('externalAppUrl')
        );
    }

    public function test_request_uses_api_key_and_manager_id_query(): void
    {
        $this->fakeBillingObjectsApiSuccess();
        $user = $this->makeExternalUser('42');

        $this->actingAs($user)->get('/external/objects');

        Http::assertSent(function ($request): bool {
            return str_contains($request->url(), '/billing/objects')
                && $request->method() === 'GET'
                && $request->hasHeader('X-Api-Key', 'test-api-key')
                && (string) $request['manager_id'] === '42'
                && (string) $request['page'] === '1'
                && (string) $request['per_page'] === '100';
        });
    }

    public function test_user_without_external_id_sees_error(): void
    {
        Http::fake();
        $user = $this->makeExternalUser();
        $user->update(['external_id' => null]);

        $response = $this->actingAs($user)->get('/external/objects');

        Http::assertNothingSent();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->where('objects', [])
            ->whereNot('error', null)
        );
    }

    public function test_objects_page_only_maps_required_fields(): void
    {
        $this->fakeBillingObjectsApiSuccess([
            [
                'imei' => '352503095622038',
                'protocol' => 'gt06',
                'name' => 'TEST VEHICLE',
                'manager_id' => 16,
                'icon' => 'img/markers/objects/blue_car_1.png',
                'object_expire_dt' => '2027-02-28 00:00:00',
                'trial' => 'true',
                'lat' => -7.84,
                'lng' => 110.35,
                'ip' => '114.127.245.7',
                'port' => '5023',
            ],
        ]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->has('objects', 1)
            ->where('objects.0', [
                'name' => 'TEST VEHICLE',
                'icon' => 'img/markers/objects/blue_car_1.png',
                'object_expire_dt' => '2027-02-28 00:00:00',
                'trial' => 'true',
                'device_identifier' => '352503095622038',
            ])
        );
    }

    public function test_empty_objects_list_is_handled(): void
    {
        Http::fake([
            '*/billing/objects*' => Http::response([
                'success' => true,
                'objects' => [],
                'pagination' => ['total' => 0],
            ], 200),
        ]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->where('objects', [])
            ->where('error', null)
        );
    }

    // -------------------------------------------------------------------------
    // API error handling
    // -------------------------------------------------------------------------

    public function test_api_failure_passes_error_message_to_inertia(): void
    {
        Http::fake([
            '*/billing/objects*' => Http::response(['message' => 'Unauthorized'], 401),
        ]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->where('objects', [])
            ->whereNot('error', null)
        );
    }

    public function test_api_connection_error_passes_error_message_to_inertia(): void
    {
        Http::fake([
            '*/billing/objects*' => fn () => throw new \Illuminate\Http\Client\ConnectionException('Connection refused'),
        ]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->where('objects', [])
            ->whereNot('error', null)
        );
    }

    public function test_invalid_api_response_format_passes_error_to_inertia(): void
    {
        Http::fake([
            '*/billing/objects*' => Http::response(['unexpected' => 'format'], 200),
        ]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->where('objects', [])
            ->whereNot('error', null)
        );
    }
}

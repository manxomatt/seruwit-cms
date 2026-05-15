<?php

namespace Tests\Feature\External;

use App\Actions\Auth\LoginAction;
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
    }

    private function makeExternalUser(): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    /** @param  array<int, mixed>  $objects */
    private function fakeObjectsApiSuccess(array $objects = []): void
    {
        if (empty($objects)) {
            $objects = [
                [
                    'name' => 'HRV LITE DEV',
                    'icon' => 'img/markers/objects/blue_car_1.png',
                    'object_expire_dt' => '2027-02-28 00:00:00',
                    'trial' => 'false',
                ],
            ];
        }

        Http::fake([
            '*/objects*' => Http::response($objects, 200),
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
        $this->fakeObjectsApiSuccess();
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertStatus(200);
    }

    // -------------------------------------------------------------------------
    // Successful API response
    // -------------------------------------------------------------------------

    public function test_objects_page_passes_mapped_objects_to_inertia(): void
    {
        $this->fakeObjectsApiSuccess();
        $user = $this->makeExternalUser();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $response = $this->actingAs($user)->get('/external/objects');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Objects/Index')
            ->has('objects', 1)
            ->where('objects.0.name', 'HRV LITE DEV')
            ->where('objects.0.icon', 'img/markers/objects/blue_car_1.png')
            ->where('objects.0.object_expire_dt', '2027-02-28 00:00:00')
            ->where('objects.0.trial', 'false')
            ->where('objects.0.device_identifier', '')
            ->where('error', null)
            ->has('externalAppUrl')
        );
    }

    public function test_objects_page_only_maps_required_fields(): void
    {
        Http::fake([
            '*/objects*' => Http::response([
                [
                    'imei' => '352503095622038',
                    'protocol' => 'gt06',
                    'name' => 'TEST VEHICLE',
                    'icon' => 'img/markers/objects/blue_car_1.png',
                    'object_expire_dt' => '2027-02-28 00:00:00',
                    'trial' => 'true',
                    'sensors' => [],
                    'params' => [],
                ],
            ], 200),
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
            '*/objects*' => Http::response([], 200),
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
            '*/objects*' => Http::response(['message' => 'Unauthorized'], 401),
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
            '*/objects*' => fn () => throw new \Illuminate\Http\Client\ConnectionException('Connection refused'),
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
            '*/objects*' => Http::response(['unexpected' => 'format'], 200),
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

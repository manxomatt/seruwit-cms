<?php

namespace Tests\Feature\External;

use App\Actions\Auth\LoginAction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExternalUsersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalSuperAdmin(): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_super_admin')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    private function makeExternalUser(): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    /**
     * Stub a successful /users API response.
     *
     * @param  array<string, mixed>  $overrides
     */
    private function fakeUsersApiSuccess(array $overrides = []): void
    {
        Http::fake([
            '*/users*' => Http::response(array_merge([
                'success' => true,
                'users' => [
                    [
                        'id' => 3,
                        'active' => 'true',
                        'privileges' => ['type' => 'user'],
                        'manager_id' => 0,
                        'username' => 'demo',
                        'email' => 'demo@gps.com',
                        'info' => ['name' => 'Demo User', 'company' => 'Demo Company'],
                        'dt_reg' => '2026-01-16T09:45:04.000000Z',
                        'dt_login' => '2026-04-22T21:15:14.000000Z',
                    ],
                ],
                'pagination' => [
                    'total' => 15,
                    'per_page' => 15,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => 1,
                    'to' => 15,
                ],
            ], $overrides), 200),
        ]);
    }

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/external/users');

        $response->assertRedirect('/login');
    }

    public function test_external_super_admin_can_access_users_page(): void
    {
        $this->fakeUsersApiSuccess();
        $user = $this->makeExternalSuperAdmin();

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertStatus(200);
    }

    public function test_external_user_role_cannot_access_users_page(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertStatus(403);
    }

    public function test_local_admin_user_cannot_access_external_users_page(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertStatus(403);
    }

    public function test_local_regular_user_cannot_access_external_users_page(): void
    {
        $user = User::factory()->withUserRole()->create();

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertStatus(403);
    }

    // -------------------------------------------------------------------------
    // Successful API response
    // -------------------------------------------------------------------------

    public function test_users_page_passes_users_and_pagination_to_inertia(): void
    {
        $this->fakeUsersApiSuccess();
        $user = $this->makeExternalSuperAdmin();

        // Store the token so ExternalApiService has one to send
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Users/Index')
            ->has('users', 1)
            ->has('pagination')
            ->where('error', null)
        );
    }

    public function test_pagination_query_parameters_are_forwarded_to_external_api(): void
    {
        Http::fake([
            '*/users*' => Http::response([
                'success' => true,
                'users' => [],
                'pagination' => [
                    'total' => 15,
                    'per_page' => 1,
                    'current_page' => 3,
                    'last_page' => 15,
                    'from' => 3,
                    'to' => 3,
                ],
            ], 200),
        ]);

        $user = $this->makeExternalSuperAdmin();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $response = $this->actingAs($user)->get('/external/users?page=3&per_page=1');

        $response->assertStatus(200);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/users')
                && str_contains($request->url(), 'page=3')
                && str_contains($request->url(), 'per_page=1');
        });
    }

    // -------------------------------------------------------------------------
    // API error handling
    // -------------------------------------------------------------------------

    public function test_api_failure_passes_error_message_to_inertia(): void
    {
        Http::fake([
            '*/users*' => Http::response(['message' => 'Internal Server Error'], 500),
        ]);

        $user = $this->makeExternalSuperAdmin();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Users/Index')
            ->where('users', [])
            ->where('pagination', null)
            ->whereNot('error', null)
        );
    }

    public function test_api_success_false_passes_error_message_to_inertia(): void
    {
        Http::fake([
            '*/users*' => Http::response(['success' => false], 200),
        ]);

        $user = $this->makeExternalSuperAdmin();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Users/Index')
            ->where('users', [])
            ->where('pagination', null)
            ->whereNot('error', null)
        );
    }

    public function test_api_connection_error_passes_error_message_to_inertia(): void
    {
        Http::fake([
            '*/users*' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection refused');
            },
        ]);

        $user = $this->makeExternalSuperAdmin();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $response = $this->actingAs($user)->get('/external/users');

        $response->assertInertia(fn ($page) => $page
            ->component('External/Users/Index')
            ->where('users', [])
            ->where('pagination', null)
            ->whereNot('error', null)
        );
    }

    // -------------------------------------------------------------------------
    // Validation: page / per_page bounds
    // -------------------------------------------------------------------------

    public function test_per_page_is_capped_at_100(): void
    {
        $this->fakeUsersApiSuccess();
        $user = $this->makeExternalSuperAdmin();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $this->actingAs($user)->get('/external/users?per_page=9999');

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'per_page=100');
        });
    }

    public function test_page_defaults_to_1_when_invalid(): void
    {
        $this->fakeUsersApiSuccess();
        $user = $this->makeExternalSuperAdmin();
        session([LoginAction::EXTERNAL_TOKEN_KEY => 'test.jwt.token']);

        $this->actingAs($user)->get('/external/users?page=-5');

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'page=1');
        });
    }
}

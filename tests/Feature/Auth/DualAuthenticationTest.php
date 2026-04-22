<?php

namespace Tests\Feature\Auth;

use App\Actions\Auth\LoginAction;
use App\DTOs\ExternalUserData;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DualAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helper: build a real-shaped external API response
    // -------------------------------------------------------------------------

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function apiResponse(array $overrides = []): array
    {
        return array_replace_recursive([
            'success' => true,
            'authorization' => [
                'access_token' => 'access.jwt.token',
                'token_type' => 'bearer',
                'expires_in' => 1209600,
                'refresh_token' => 'refresh.jwt.token',
            ],
            'user' => [
                'id' => 16,
                'username' => 'testuser',
                'email' => 'test@example.com',
                'role' => 'user',
                'status' => 'true',
                'manager_id' => 16,
            ],
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // Local authentication
    // -------------------------------------------------------------------------

    public function test_local_authentication_succeeds_with_valid_credentials(): void
    {
        $this->seed(RoleSeeder::class);
        $user = User::factory()->withUserRole()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect();
    }

    public function test_local_authentication_updates_last_login_at(): void
    {
        $this->seed(RoleSeeder::class);
        $user = User::factory()->withUserRole()->create(['last_login_at' => null]);

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_local_authentication_fails_with_wrong_password(): void
    {
        Http::fake(); // prevent any real outbound calls

        $user = User::factory()->create();

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    // -------------------------------------------------------------------------
    // External API fallback
    // -------------------------------------------------------------------------

    public function test_external_api_is_called_when_local_login_fails(): void
    {
        $this->seed(RoleSeeder::class);

        // User exists locally with a known username – email login can resolve
        // the username to pass to the external API.
        $user = User::factory()->create([
            'username' => 'localuser',
            'password' => 'not-this-password',
        ]);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => ['id' => 1, 'username' => 'localuser', 'email' => $user->email],
            ]), 200),
        ]);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'external-pass',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect();
    }

    public function test_external_authentication_creates_new_user_when_not_in_local_db(): void
    {
        // New user (never synced) must login with username so the external API
        // can be reached – email login alone cannot resolve to a username.
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => [
                    'id' => 999,
                    'username' => 'newexternaluser',
                    'email' => 'newexternal@example.com',
                    'role' => 'user',
                    'status' => 'true',
                ],
            ]), 200),
        ]);

        $this->post('/login', [
            'login' => 'newexternaluser',   // username login for first-time sync
            'password' => 'any-password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'newexternal@example.com',
            'external_id' => '999',
            'username' => 'newexternaluser',
            'status' => 'active',
        ]);

        $newUser = User::query()->where('email', 'newexternal@example.com')->first();
        $this->assertNotNull($newUser->email_verified_at, 'Newly synced external user should be auto-verified.');
    }

    public function test_external_authentication_works_when_email_used_as_username_and_user_not_in_local_db(): void
    {
        // Some external accounts use their email as their username.
        // When a first-time user logs in with their email and is not yet in local DB,
        // the email itself should be forwarded as the "username" field to the external API.
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => [
                    'id' => 42,
                    'username' => 'user@example.com',
                    'email' => 'user@example.com',
                    'role' => 'manager',
                    'status' => 'true',
                ],
            ]), 200),
        ]);

        $this->post('/login', [
            'login' => 'user@example.com',
            'password' => 'any-password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'user@example.com',
            'external_id' => '42',
        ]);
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function externalRoleProvider(): array
    {
        return [
            'user maps to external_user' => ['user', 'external_user'],
            'manager maps to external_manager' => ['manager', 'external_manager'],
            'admin maps to external_admin' => ['admin', 'external_admin'],
            'super_admin maps to external_super_admin' => ['super_admin', 'external_super_admin'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('externalRoleProvider')]
    public function test_external_authentication_syncs_role_to_local_db(string $apiRole, string $expectedSlug): void
    {
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => ['id' => 123, 'username' => 'rolesyncuser', 'email' => 'rolesync@example.com', 'role' => $apiRole],
            ]), 200),
        ]);

        $this->post('/login', [
            'login' => 'rolesyncuser',
            'password' => 'any-password',
        ]);

        $user = User::query()->where('email', 'rolesync@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole($expectedSlug));
    }

    public function test_external_authentication_does_not_overwrite_existing_password(): void
    {
        $this->seed(RoleSeeder::class);

        $existingUser = User::factory()->withUserRole()->create([
            'username' => 'existinguser',
            'email' => 'existing@example.com',
            'external_id' => null,
        ]);

        $originalPasswordHash = $existingUser->password;

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => ['id' => 456, 'username' => 'existinguser', 'email' => 'existing@example.com'],
            ]), 200),
        ]);

        // Local login fails (wrong password given), triggers external fallback
        $this->post('/login', [
            'login' => 'existing@example.com',
            'password' => 'not-their-local-password',
        ]);

        $this->assertEquals($originalPasswordHash, $existingUser->fresh()->password);
    }

    public function test_external_authentication_verifies_existing_unverified_user_on_login(): void
    {
        $this->seed(RoleSeeder::class);

        $existingUser = User::factory()->unverified()->create([
            'username' => 'unverifiedexternal',
            'email' => 'unverified@example.com',
        ]);

        $this->assertNull($existingUser->email_verified_at);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => ['id' => 77, 'username' => 'unverifiedexternal', 'email' => 'unverified@example.com'],
            ]), 200),
        ]);

        $this->post('/login', [
            'login' => 'unverifiedexternal',
            'password' => 'any-password',
        ]);

        $this->assertNotNull(
            $existingUser->fresh()->email_verified_at,
            'Existing external user should be auto-verified on login.'
        );
    }

    public function test_external_authentication_sets_external_id_on_sync(): void
    {
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => ['id' => 789, 'username' => 'externalsync', 'email' => 'extsync@example.com'],
            ]), 200),
        ]);

        $this->post('/login', [
            'login' => 'externalsync',   // username login
            'password' => 'any-password',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'extsync@example.com',
            'external_id' => '789',
        ]);
    }

    // -------------------------------------------------------------------------
    // Failure cases
    // -------------------------------------------------------------------------

    public function test_login_fails_when_both_local_and_external_auth_fail(): void
    {
        Http::fake([
            '*/auth/login' => Http::response(['message' => 'Unauthorized'], 401),
        ]);

        $user = User::factory()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('login');
    }

    public function test_login_fails_when_external_api_is_unreachable(): void
    {
        Http::fake([
            '*/auth/login' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection refused');
            },
        ]);

        $user = User::factory()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('login');
    }

    public function test_inactive_external_user_cannot_login(): void
    {
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => [
                    'id' => 55,
                    'username' => 'inactiveuser',
                    'email' => 'inactive@example.com',
                    'status' => 'false',
                ],
            ]), 200),
        ]);

        $response = $this->post('/login', [
            'login' => 'inactiveuser',   // username login
            'password' => 'any-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('login');
    }

    public function test_validation_requires_login_and_password(): void
    {
        $response = $this->post('/login', []);

        $response->assertSessionHasErrors(['login', 'password']);
    }

    // -------------------------------------------------------------------------
    // ExternalUserData DTO
    // -------------------------------------------------------------------------

    public function test_external_user_data_dto_maps_from_real_api_response(): void
    {
        $dto = ExternalUserData::fromApiResponse([
            'success' => true,
            'authorization' => [
                'access_token' => 'access.jwt',
                'token_type' => 'bearer',
                'expires_in' => 1209600,
                'refresh_token' => 'refresh.jwt',
            ],
            'user' => [
                'id' => 16,
                'username' => 'andito',
                'email' => 'anditowilly2@gmail.com',
                'role' => 'manager',
                'status' => 'true',
                'manager_id' => 16,
            ],
        ]);

        $this->assertSame('16', $dto->externalId);
        $this->assertSame('andito', $dto->name);
        $this->assertSame('andito', $dto->username);
        $this->assertSame('anditowilly2@gmail.com', $dto->email);
        $this->assertSame('manager', $dto->role);
        $this->assertSame('active', $dto->status);
        $this->assertSame('access.jwt', $dto->accessToken);
        $this->assertSame('refresh.jwt', $dto->refreshToken);
    }

    public function test_dto_normalizes_string_false_status_to_inactive(): void
    {
        $dto = ExternalUserData::fromApiResponse([
            'success' => true,
            'authorization' => [],
            'user' => [
                'id' => 1,
                'username' => 'inactive',
                'email' => 'inactive@example.com',
                'status' => 'false',
            ],
        ]);

        $this->assertSame('inactive', $dto->status);
    }

    public function test_dto_defaults_role_to_user_when_absent(): void
    {
        $dto = ExternalUserData::fromApiResponse([
            'success' => true,
            'authorization' => [],
            'user' => [
                'id' => 2,
                'username' => 'norole',
                'email' => 'norole@example.com',
            ],
        ]);

        $this->assertSame('user', $dto->role);
    }

    // -------------------------------------------------------------------------
    // Access token session storage
    // -------------------------------------------------------------------------

    public function test_access_and_refresh_tokens_are_stored_in_session_after_login(): void
    {
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'authorization' => [
                    'access_token' => 'access.jwt.here',
                    'refresh_token' => 'refresh.jwt.here',
                ],
                'user' => ['id' => 77, 'username' => 'tokenuser', 'email' => 'tokenuser@example.com'],
            ]), 200),
        ]);

        $this->post('/login', [
            'login' => 'tokenuser',   // username login
            'password' => 'any-password',
        ]);

        $this->assertAuthenticated();
        $this->assertSame('access.jwt.here', session(LoginAction::EXTERNAL_TOKEN_KEY));
        $this->assertSame('refresh.jwt.here', session(LoginAction::EXTERNAL_REFRESH_TOKEN_KEY));
    }

    public function test_no_tokens_stored_in_session_when_api_omits_authorization(): void
    {
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response([
                'success' => true,
                'user' => [
                    'id' => 88,
                    'username' => 'notokenuser',
                    'email' => 'notoken@example.com',
                    'role' => 'user',
                    'status' => 'true',
                ],
            ], 200),
        ]);

        $this->post('/login', [
            'login' => 'notokenuser',   // username login
            'password' => 'any-password',
        ]);

        $this->assertAuthenticated();
        $this->assertNull(session(LoginAction::EXTERNAL_TOKEN_KEY));
        $this->assertNull(session(LoginAction::EXTERNAL_REFRESH_TOKEN_KEY));
    }

    public function test_no_external_tokens_stored_for_local_only_login(): void
    {
        $this->seed(RoleSeeder::class);
        $user = User::factory()->withUserRole()->create();

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertNull(session(LoginAction::EXTERNAL_TOKEN_KEY));
        $this->assertNull(session(LoginAction::EXTERNAL_REFRESH_TOKEN_KEY));
    }

    // -------------------------------------------------------------------------
    // Username-based login
    // -------------------------------------------------------------------------

    public function test_local_authentication_succeeds_with_username(): void
    {
        $this->seed(RoleSeeder::class);
        $user = User::factory()->withUserRole()->create(['username' => 'andito']);

        $response = $this->post('/login', [
            'login' => 'andito',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect();
    }

    public function test_username_login_falls_back_to_external_api_via_resolved_email(): void
    {
        $this->seed(RoleSeeder::class);

        // User exists locally with username but wrong password → external fallback
        $user = User::factory()->withUserRole()->create([
            'username' => 'andito',
            'email' => 'andito@example.com',
        ]);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => ['id' => $user->id, 'username' => $user->username ?? $user->name, 'email' => 'andito@example.com'],
            ]), 200),
        ]);

        $response = $this->post('/login', [
            'login' => 'andito',
            'password' => 'external-pass',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect();
    }

    public function test_username_login_fails_when_username_not_found_locally(): void
    {
        // Email not in local DB → cannot resolve username → login fails without API call.
        Http::fake(); // ensure NO external call is made

        $response = $this->post('/login', [
            'login' => 'unknown@example.com',
            'password' => 'any-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('login');
    }

    public function test_username_login_succeeds_via_external_api_when_not_in_local_db(): void
    {
        // Username login: sent directly to external API as the 'username' field.
        $this->seed(RoleSeeder::class);

        Http::fake([
            '*/auth/login' => Http::response($this->apiResponse([
                'user' => [
                    'id' => 200,
                    'username' => 'firsttimer',
                    'email' => 'firsttimer@example.com',
                    'role' => 'user',
                    'status' => 'true',
                ],
            ]), 200),
        ]);

        $response = $this->post('/login', [
            'login' => 'firsttimer',   // username – not in local DB
            'password' => 'correct-password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'username' => 'firsttimer',
            'email' => 'firsttimer@example.com',
            'external_id' => '200',
        ]);
    }

    public function test_validation_rejects_login_shorter_than_three_chars(): void
    {
        $response = $this->post('/login', [
            'login' => 'ab',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('login');
    }

    public function test_external_user_is_redirected_away_from_module_dashboard(): void
    {
        $this->seed(RoleSeeder::class);

        $externalRole = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$externalRole->id]);

        $response = $this->actingAs($user)->get('/module/dashboard');

        $response->assertRedirect(route('external.dashboard'));
    }

    public function test_local_user_can_access_module_dashboard(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->withUserRole()->create(['status' => 'active']);

        $response = $this->actingAs($user)->get('/module/dashboard');

        $response->assertStatus(200);
    }
}

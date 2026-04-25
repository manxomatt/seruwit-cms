<?php

namespace Tests\Feature\AccountManager;

use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DownlineAssignmentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $amUser;

    private AccountManager $accountManager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);

        $this->amUser = User::factory()->withRole('account_manager')->create(['status' => 'active']);
        $this->accountManager = AccountManager::factory()->create(['user_id' => $this->amUser->id]);
    }

    // -------------------------------------------------------------------------
    // Create form
    // -------------------------------------------------------------------------

    public function test_account_manager_can_access_assign_form(): void
    {
        Http::fake([
            'https://api.sky-track.net/api/users_api*' => Http::response([
                'success' => true,
                'users' => [
                    [
                        'id' => 1,
                        'username' => 'user1',
                        'email' => 'user1@example.com',
                        'role' => 'user',
                        'status' => 'true',
                        'manager_id' => 0,
                    ],
                    [
                        'id' => 2,
                        'username' => 'manager1',
                        'email' => 'manager1@example.com',
                        'role' => 'manager',
                        'status' => 'true',
                        'manager_id' => 2,
                    ],
                ],
                'pagination' => [
                    'total' => 2,
                    'per_page' => 25,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => 1,
                    'to' => 2,
                ],
            ]),
        ]);

        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.assign'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Downlines/Assign')
            ->has('users.data', 2)
        );
    }

    // -------------------------------------------------------------------------
    // Store – happy path
    // -------------------------------------------------------------------------

    public function test_account_manager_can_request_assignment_of_existing_user(): void
    {
        $userData = [
            'id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'role' => 'user',
            'status' => 'true',
            'manager_id' => 0,
        ];

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => 1,
                'user_data' => json_encode($userData),
            ]);

        $response->assertRedirect(route('account-manager.downlines.index'));
        $response->assertSessionHas('success');

        // Verify user was synced, verified, and relation created with external_manager_id
        $user = User::where('external_id', 1)->firstOrFail();
        $this->assertNotNull($user->email_verified_at);
        $this->assertDatabaseHas('referral_relations', [
            'account_manager_id' => $this->accountManager->id,
            'external_manager_id' => $user->external_id,
            'user_id' => $user->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);
    }

    public function test_existing_local_user_gets_verified_when_assigned(): void
    {
        // User already exists locally but is not verified
        $existingUser = User::factory()->withRole('external_user')->create([
            'external_id' => 99,
            'status' => 'active',
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => 99,
                'user_data' => json_encode([
                    'id' => 99,
                    'username' => $existingUser->username,
                    'email' => $existingUser->email,
                    'role' => 'user',
                    'status' => 'true',
                    'manager_id' => 0,
                ]),
            ]);

        $response->assertRedirect(route('account-manager.downlines.index'));
        $response->assertSessionHas('success');

        $existingUser->refresh();
        $this->assertNotNull($existingUser->email_verified_at);
    }

    // -------------------------------------------------------------------------
    // Store – failure: user already has a relation
    // -------------------------------------------------------------------------

    public function test_cannot_request_assignment_when_user_already_has_approved_relation(): void
    {
        $userData = [
            'id' => 2,
            'username' => 'testuser2',
            'email' => 'test2@example.com',
            'role' => 'user',
            'status' => 'true',
            'manager_id' => 0,
        ];

        $targetUser = User::factory()->withRole('external_user')->create(['external_id' => 2, 'status' => 'active']);
        $otherAm = AccountManager::factory()->create();

        ReferralRelation::factory()->create([
            'account_manager_id' => $otherAm->id,
            'user_id' => $targetUser->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => 2,
                'user_data' => json_encode($userData),
            ]);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_cannot_request_assignment_when_user_has_pending_relation(): void
    {
        $userData = [
            'id' => 3,
            'username' => 'testuser3',
            'email' => 'test3@example.com',
            'role' => 'user',
            'status' => 'true',
            'manager_id' => 0,
        ];

        $targetUser = User::factory()->withRole('external_user')->create(['external_id' => 3, 'status' => 'active']);
        $otherAm = AccountManager::factory()->create();

        ReferralRelation::factory()->create([
            'account_manager_id' => $otherAm->id,
            'user_id' => $targetUser->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => 3,
                'user_data' => json_encode($userData),
            ]);

        $response->assertSessionHasErrors('user_id');
    }

    // -------------------------------------------------------------------------
    // API error handling
    // -------------------------------------------------------------------------

    public function test_assign_form_shows_error_when_api_fails(): void
    {
        Http::fake([
            'https://api.sky-track.net/api/users_api*' => Http::response(null, 500),
        ]);

        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.assign'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Downlines/Assign')
            ->has('error')
        );
    }

    // -------------------------------------------------------------------------
    // Assign form excludes users with pending/approved relations
    // -------------------------------------------------------------------------

    public function test_assign_form_excludes_users_with_existing_relations(): void
    {
        Http::fake([
            'https://api.sky-track.net/api/users_api*' => Http::response([
                'success' => true,
                'users' => [
                    [
                        'id' => 1,
                        'username' => 'user1',
                        'email' => 'user1@example.com',
                        'role' => 'user',
                        'status' => 'true',
                        'manager_id' => 0,
                    ],
                    [
                        'id' => 2,
                        'username' => 'user2',
                        'email' => 'user2@example.com',
                        'role' => 'user',
                        'status' => 'true',
                        'manager_id' => 0,
                    ],
                ],
                'pagination' => [
                    'total' => 2,
                    'per_page' => 25,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => 1,
                    'to' => 2,
                ],
            ]),
        ]);

        $availableUser = User::factory()->withRole('external_user')->create(['external_id' => 1]);
        $assignedUser = User::factory()->withRole('external_user')->create(['external_id' => 2]);
        $otherAm = AccountManager::factory()->create();

        ReferralRelation::factory()->create([
            'account_manager_id' => $otherAm->id,
            'user_id' => $assignedUser->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.assign'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Downlines/Assign')
            ->has('users.data', 2)
        );
    }
}

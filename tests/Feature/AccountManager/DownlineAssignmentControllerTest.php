<?php

namespace Tests\Feature\AccountManager;

use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.assign'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AccountManager/Downlines/Assign'));
    }

    // -------------------------------------------------------------------------
    // Store – happy path
    // -------------------------------------------------------------------------

    public function test_account_manager_can_request_assignment_of_existing_user(): void
    {
        $targetUser = User::factory()->withRole('external_user')->create(['status' => 'active']);

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => $targetUser->id,
            ]);

        $response->assertRedirect(route('account-manager.downlines.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('referral_relations', [
            'account_manager_id' => $this->accountManager->id,
            'user_id' => $targetUser->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);
    }

    // -------------------------------------------------------------------------
    // Store – failure: user already has a relation
    // -------------------------------------------------------------------------

    public function test_cannot_request_assignment_when_user_already_has_approved_relation(): void
    {
        $targetUser = User::factory()->withRole('external_user')->create(['status' => 'active']);
        $otherAm = AccountManager::factory()->create();

        ReferralRelation::factory()->create([
            'account_manager_id' => $otherAm->id,
            'user_id' => $targetUser->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => $targetUser->id,
            ]);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_cannot_request_assignment_when_user_has_pending_relation(): void
    {
        $targetUser = User::factory()->withRole('external_user')->create(['status' => 'active']);
        $otherAm = AccountManager::factory()->create();

        ReferralRelation::factory()->create([
            'account_manager_id' => $otherAm->id,
            'user_id' => $targetUser->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.assign.store'), [
                'user_id' => $targetUser->id,
            ]);

        $response->assertSessionHasErrors('user_id');
    }

    // -------------------------------------------------------------------------
    // Assign form excludes users with pending/approved relations
    // -------------------------------------------------------------------------

    public function test_assign_form_excludes_users_with_existing_relations(): void
    {
        $availableUser = User::factory()->withRole('external_user')->create();
        $assignedUser = User::factory()->withRole('external_user')->create();
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
            ->has('users.data', 1)
        );
    }
}

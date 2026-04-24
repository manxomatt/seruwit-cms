<?php

namespace Tests\Feature\Admin;

use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralApprovalControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);

        $this->admin = User::factory()->admin()->create();
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_admin_can_access_referral_approvals_index(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('module.referral-approvals.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Module/ReferralApprovals/Index'));
    }

    // -------------------------------------------------------------------------
    // Approve
    // -------------------------------------------------------------------------

    public function test_admin_can_approve_pending_relation(): void
    {
        $amUser = User::factory()->withRole('account_manager')->create();
        $accountManager = AccountManager::factory()->create(['user_id' => $amUser->id]);
        $downlineUser = User::factory()->withRole('external_user')->create(['status' => 'inactive']);

        $relation = ReferralRelation::factory()->create([
            'account_manager_id' => $accountManager->id,
            'user_id' => $downlineUser->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('module.referral-approvals.approve', $relation));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('referral_relations', [
            'id' => $relation->id,
            'status' => ReferralRelation::STATUS_APPROVED,
            'approved_by' => $this->admin->id,
        ]);

        // User should be activated
        $this->assertDatabaseHas('users', [
            'id' => $downlineUser->id,
            'status' => 'active',
        ]);
    }

    // -------------------------------------------------------------------------
    // Reject
    // -------------------------------------------------------------------------

    public function test_admin_can_reject_pending_relation(): void
    {
        $amUser = User::factory()->withRole('account_manager')->create();
        $accountManager = AccountManager::factory()->create(['user_id' => $amUser->id]);
        $downlineUser = User::factory()->withRole('external_user')->create(['status' => 'inactive']);

        $relation = ReferralRelation::factory()->create([
            'account_manager_id' => $accountManager->id,
            'user_id' => $downlineUser->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('module.referral-approvals.reject', $relation), [
                'notes' => 'Tidak memenuhi syarat',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('referral_relations', [
            'id' => $relation->id,
            'status' => ReferralRelation::STATUS_REJECTED,
            'notes' => 'Tidak memenuhi syarat',
        ]);

        // User status should remain unchanged (inactive)
        $this->assertDatabaseHas('users', [
            'id' => $downlineUser->id,
            'status' => 'inactive',
        ]);
    }

    // -------------------------------------------------------------------------
    // Admin direct assign (no approval needed)
    // -------------------------------------------------------------------------

    public function test_admin_can_directly_assign_user_to_account_manager(): void
    {
        $amUser = User::factory()->withRole('account_manager')->create();
        $accountManager = AccountManager::factory()->create(['user_id' => $amUser->id]);
        $targetUser = User::factory()->withRole('external_user')->create(['status' => 'active']);

        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.assign-downline.store', $accountManager), [
                'user_id' => $targetUser->id,
            ]);

        $response->assertRedirect(route('module.account-managers.show', $accountManager));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('referral_relations', [
            'account_manager_id' => $accountManager->id,
            'user_id' => $targetUser->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);
    }

    // -------------------------------------------------------------------------
    // Assign downline form
    // -------------------------------------------------------------------------

    public function test_admin_can_access_assign_downline_form(): void
    {
        $amUser = User::factory()->withRole('account_manager')->create();
        $accountManager = AccountManager::factory()->create(['user_id' => $amUser->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('module.account-managers.assign-downline', $accountManager));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Module/AccountManagers/AssignDownline'));
    }
}

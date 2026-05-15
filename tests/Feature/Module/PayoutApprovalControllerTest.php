<?php

namespace Tests\Feature\Module;

use App\Models\AccountManager;
use App\Models\CommissionPayout;
use App\Models\User;
use App\Models\WalletTransaction;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayoutApprovalControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);
    }

    private function makeAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    /**
     * @return array{0: User, 1: AccountManager}
     */
    private function makeAccountManagerWithRecord(float $balance = 500_000): array
    {
        $user = User::factory()->withRole('account_manager')->create(['status' => 'active']);
        $accountManager = AccountManager::factory()->create([
            'user_id' => $user->id,
            'wallet_balance' => $balance,
        ]);

        return [$user, $accountManager];
    }

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('module.payouts.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_without_users_view_permission_cannot_access(): void
    {
        $role = \App\Models\Role::query()->create([
            'slug' => 'restricted',
            'name' => 'Restricted',
            'description' => 'No permissions',
            'is_system' => false,
            'dashboard_path' => '/module/dashboard',
        ]);
        $user = User::factory()->create();
        $user->roles()->sync([$role->id]);

        $response = $this->actingAs($user)->get(route('module.payouts.index'));

        $response->assertStatus(403);
    }

    public function test_user_with_only_view_permission_cannot_approve(): void
    {
        $user = User::factory()->withUserRole()->create();
        [, $accountManager] = $this->makeAccountManagerWithRecord();
        $payout = CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
        ]);

        $response = $this->actingAs($user)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.approve', ['payout' => $payout->id]));

        $response->assertStatus(403);
        $this->assertSame(CommissionPayout::STATUS_PENDING, $payout->fresh()->status);
    }

    public function test_admin_can_access_payout_approvals(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)->get(route('module.payouts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Module/PayoutApprovals/Index'));
    }

    // -------------------------------------------------------------------------
    // Index page
    // -------------------------------------------------------------------------

    public function test_index_lists_all_payouts_from_all_account_managers(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager1] = $this->makeAccountManagerWithRecord();
        [, $accountManager2] = $this->makeAccountManagerWithRecord();

        CommissionPayout::factory()->count(2)->create(['account_manager_id' => $accountManager1->id]);
        CommissionPayout::factory()->count(3)->create(['account_manager_id' => $accountManager2->id]);

        $response = $this->actingAs($admin)->get(route('module.payouts.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Module/PayoutApprovals/Index')
            ->has('payouts.data', 5)
            ->where('payouts.total', 5)
        );
    }

    public function test_index_can_filter_by_status(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        CommissionPayout::factory()->count(2)->create(['account_manager_id' => $accountManager->id]);
        CommissionPayout::factory()->approved()->count(1)->create(['account_manager_id' => $accountManager->id]);

        $response = $this->actingAs($admin)->get(route('module.payouts.index', ['status' => 'approved']));

        $response->assertInertia(fn ($page) => $page
            ->has('payouts.data', 1)
            ->where('filters.status', 'approved')
        );
    }

    public function test_index_provides_stats(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
            'amount' => 100_000,
        ]);
        CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
            'amount' => 50_000,
        ]);
        CommissionPayout::factory()->approved()->create(['account_manager_id' => $accountManager->id]);
        CommissionPayout::factory()->paid()->create(['account_manager_id' => $accountManager->id]);

        $response = $this->actingAs($admin)->get(route('module.payouts.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('stats.pending_count', 2)
            ->where('stats.approved_count', 1)
            ->where('stats.paid_count', 1)
            ->where('stats.pending_amount', 150000)
        );
    }

    // -------------------------------------------------------------------------
    // Approve
    // -------------------------------------------------------------------------

    public function test_admin_can_approve_pending_payout(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        $payout = CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.approve', ['payout' => $payout->id]));

        $response->assertRedirect(route('module.payouts.index'));
        $this->assertSame(CommissionPayout::STATUS_APPROVED, $payout->fresh()->status);
        $this->assertSame($admin->id, $payout->fresh()->processed_by);
        $this->assertNotNull($payout->fresh()->processed_at);
    }

    public function test_cannot_approve_already_approved_payout(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        $payout = CommissionPayout::factory()->approved()->create([
            'account_manager_id' => $accountManager->id,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.approve', ['payout' => $payout->id]));

        $response->assertSessionHasErrors('status');
    }

    // -------------------------------------------------------------------------
    // Reject
    // -------------------------------------------------------------------------

    public function test_admin_can_reject_pending_payout_and_balance_is_refunded(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord(100_000);

        $payout = CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'amount' => 200_000,
            'status' => CommissionPayout::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.reject', ['payout' => $payout->id]), [
                'rejection_reason' => 'Rekening tidak valid setelah verifikasi.',
            ]);

        $response->assertRedirect(route('module.payouts.index'));

        $fresh = $payout->fresh();
        $this->assertSame(CommissionPayout::STATUS_REJECTED, $fresh->status);
        $this->assertSame('Rekening tidak valid setelah verifikasi.', $fresh->rejection_reason);
        $this->assertSame($admin->id, $fresh->processed_by);
        $this->assertSame(300000.00, (float) $accountManager->fresh()->wallet_balance);

        $this->assertSame(1, WalletTransaction::query()
            ->where('account_manager_id', $accountManager->id)
            ->where('type', 'credit')
            ->where('amount', 200_000)
            ->count());
    }

    public function test_admin_can_reject_approved_payout(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord(100_000);

        $payout = CommissionPayout::factory()->approved()->create([
            'account_manager_id' => $accountManager->id,
            'amount' => 75_000,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.reject', ['payout' => $payout->id]), [
                'rejection_reason' => 'Pembayaran gagal diproses.',
            ]);

        $response->assertRedirect(route('module.payouts.index'));
        $this->assertSame(CommissionPayout::STATUS_REJECTED, $payout->fresh()->status);
        $this->assertSame(175000.00, (float) $accountManager->fresh()->wallet_balance);
    }

    public function test_reject_requires_rejection_reason(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        $payout = CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.reject', ['payout' => $payout->id]), [
                'rejection_reason' => '',
            ]);

        $response->assertSessionHasErrors('rejection_reason');
        $this->assertSame(CommissionPayout::STATUS_PENDING, $payout->fresh()->status);
    }

    public function test_cannot_reject_already_paid_payout(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        $payout = CommissionPayout::factory()->paid()->create(['account_manager_id' => $accountManager->id]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.reject', ['payout' => $payout->id]), [
                'rejection_reason' => 'Some reason',
            ]);

        $response->assertSessionHasErrors('status');
    }

    // -------------------------------------------------------------------------
    // Mark as paid
    // -------------------------------------------------------------------------

    public function test_admin_can_mark_approved_payout_as_paid(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        $payout = CommissionPayout::factory()->approved()->create([
            'account_manager_id' => $accountManager->id,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.mark-paid', ['payout' => $payout->id]));

        $response->assertRedirect(route('module.payouts.index'));
        $this->assertSame(CommissionPayout::STATUS_PAID, $payout->fresh()->status);
    }

    public function test_cannot_mark_pending_payout_as_paid(): void
    {
        $admin = $this->makeAdmin();
        [, $accountManager] = $this->makeAccountManagerWithRecord();

        $payout = CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('module.payouts.index'))
            ->post(route('module.payouts.mark-paid', ['payout' => $payout->id]));

        $response->assertSessionHasErrors('status');
    }
}

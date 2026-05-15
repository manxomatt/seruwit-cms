<?php

namespace Tests\Feature\AccountManager;

use App\Models\AccountManager;
use App\Models\CommissionPayout;
use App\Models\User;
use App\Models\WalletTransaction;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayoutControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);
    }

    private function makeAccountManagerUser(): User
    {
        return User::factory()->withRole('account_manager')->create(['status' => 'active']);
    }

    /**
     * @return array{0: User, 1: AccountManager}
     */
    private function makeAccountManagerWithRecord(float $balance = 500_000): array
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create([
            'user_id' => $user->id,
            'wallet_balance' => $balance,
        ]);

        return [$user, $accountManager];
    }

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    public function test_guest_is_redirected_to_login_when_visiting_payouts(): void
    {
        $response = $this->get(route('account-manager.payouts.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_cannot_access_payouts_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('account-manager.payouts.index'));

        $response->assertStatus(403);
    }

    public function test_regular_user_cannot_access_payouts_page(): void
    {
        $user = User::factory()->withUserRole()->create();

        $response = $this->actingAs($user)->get(route('account-manager.payouts.index'));

        $response->assertStatus(403);
    }

    // -------------------------------------------------------------------------
    // Index page
    // -------------------------------------------------------------------------

    public function test_account_manager_sees_empty_payouts_initially(): void
    {
        [$user] = $this->makeAccountManagerWithRecord(250_000);

        $response = $this->actingAs($user)->get(route('account-manager.payouts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Payouts')
            ->has('payouts.data', 0)
            ->where('payouts.total', 0)
            ->where('wallet_balance', 250000)
            ->where('has_pending_request', false)
        );
    }

    public function test_payouts_page_passes_minimum_amount_from_config(): void
    {
        [$user] = $this->makeAccountManagerWithRecord();
        config(['billing.payout_minimum_amount' => 75_000]);

        $response = $this->actingAs($user)->get(route('account-manager.payouts.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Payouts')
            ->where('minimum_amount', 75000)
        );
    }

    public function test_account_manager_only_sees_own_payouts(): void
    {
        [$user, $accountManager] = $this->makeAccountManagerWithRecord();
        [, $otherAccountManager] = $this->makeAccountManagerWithRecord();

        CommissionPayout::factory()->count(2)->create(['account_manager_id' => $accountManager->id]);
        CommissionPayout::factory()->count(3)->create(['account_manager_id' => $otherAccountManager->id]);

        $response = $this->actingAs($user)->get(route('account-manager.payouts.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Payouts')
            ->has('payouts.data', 2)
            ->where('payouts.total', 2)
        );
    }

    public function test_has_pending_request_is_true_when_pending_payout_exists(): void
    {
        [$user, $accountManager] = $this->makeAccountManagerWithRecord();

        CommissionPayout::factory()->create([
            'account_manager_id' => $accountManager->id,
            'status' => CommissionPayout::STATUS_PENDING,
        ]);

        $response = $this->actingAs($user)->get(route('account-manager.payouts.index'));

        $response->assertInertia(fn ($page) => $page->where('has_pending_request', true));
    }

    // -------------------------------------------------------------------------
    // Store / submit
    // -------------------------------------------------------------------------

    public function test_account_manager_can_request_a_payout(): void
    {
        [$user, $accountManager] = $this->makeAccountManagerWithRecord(500_000);

        $response = $this->actingAs($user)->post(route('account-manager.payouts.store'), [
            'amount' => 200_000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'John Doe',
            'notes' => 'Pencairan pertama',
        ]);

        $response->assertRedirect(route('account-manager.payouts.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('commission_payouts', [
            'account_manager_id' => $accountManager->id,
            'amount' => 200000,
            'status' => CommissionPayout::STATUS_PENDING,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'John Doe',
        ]);

        $this->assertSame(300000.00, (float) $accountManager->fresh()->wallet_balance);
    }

    public function test_wallet_transaction_is_recorded_when_payout_is_requested(): void
    {
        [$user, $accountManager] = $this->makeAccountManagerWithRecord(500_000);

        $this->actingAs($user)->post(route('account-manager.payouts.store'), [
            'amount' => 150_000,
            'bank_name' => 'Mandiri',
            'bank_account_number' => '9876543210',
            'bank_account_name' => 'Jane Doe',
        ]);

        $this->assertSame(1, WalletTransaction::query()
            ->where('account_manager_id', $accountManager->id)
            ->where('type', 'debit')
            ->where('amount', 150_000)
            ->count());
    }

    public function test_payout_request_fails_when_amount_exceeds_wallet_balance(): void
    {
        [$user, $accountManager] = $this->makeAccountManagerWithRecord(100_000);

        $response = $this->actingAs($user)->post(route('account-manager.payouts.store'), [
            'amount' => 200_000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'John Doe',
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertSame(0, CommissionPayout::query()->where('account_manager_id', $accountManager->id)->count());
        $this->assertSame(100000.00, (float) $accountManager->fresh()->wallet_balance);
    }

    public function test_payout_request_fails_when_amount_below_minimum(): void
    {
        [$user] = $this->makeAccountManagerWithRecord(500_000);
        config(['billing.payout_minimum_amount' => 50_000]);

        $response = $this->actingAs($user)->post(route('account-manager.payouts.store'), [
            'amount' => 10_000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'John Doe',
        ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_payout_request_requires_bank_fields(): void
    {
        [$user] = $this->makeAccountManagerWithRecord(500_000);

        $response = $this->actingAs($user)->post(route('account-manager.payouts.store'), [
            'amount' => 100_000,
        ]);

        $response->assertSessionHasErrors(['bank_name', 'bank_account_number', 'bank_account_name']);
    }

    public function test_payout_reference_is_generated_automatically(): void
    {
        [$user] = $this->makeAccountManagerWithRecord(500_000);

        $this->actingAs($user)->post(route('account-manager.payouts.store'), [
            'amount' => 100_000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'John Doe',
        ]);

        $payout = CommissionPayout::query()->latest('id')->first();

        $this->assertNotNull($payout);
        $this->assertStringStartsWith('PAYOUT-', $payout->reference);
    }
}

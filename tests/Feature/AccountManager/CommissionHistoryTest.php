<?php

namespace Tests\Feature\AccountManager;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\AccountManager;
use App\Models\BillingTransaction;
use App\Models\Commission;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionHistoryTest extends TestCase
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

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('account-manager.commissions.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_cannot_access_commission_history(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('account-manager.commissions.index'));

        $response->assertStatus(403);
    }

    public function test_regular_user_cannot_access_commission_history(): void
    {
        $user = User::factory()->withUserRole()->create();

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertStatus(403);
    }

    public function test_account_manager_sees_empty_history_when_no_commissions(): void
    {
        $user = $this->makeAccountManagerUser();
        AccountManager::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/CommissionHistory')
            ->has('commissions.data', 0)
            ->where('commissions.total', 0)
            ->where('stats.total_count', 0)
        );
    }

    public function test_account_manager_without_record_sees_empty_history(): void
    {
        $user = $this->makeAccountManagerUser();

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/CommissionHistory')
            ->where('commissions.total', 0)
            ->where('wallet_balance', 0)
        );
    }

    public function test_account_manager_only_sees_own_commissions(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create(['user_id' => $user->id]);

        $otherUser = $this->makeAccountManagerUser();
        $otherAccountManager = AccountManager::factory()->create(['user_id' => $otherUser->id]);

        Commission::factory()->count(2)->create(['account_manager_id' => $accountManager->id]);
        Commission::factory()->count(3)->create(['account_manager_id' => $otherAccountManager->id]);

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/CommissionHistory')
            ->has('commissions.data', 2)
            ->where('commissions.total', 2)
        );
    }

    public function test_stats_reflect_correct_sum_per_status(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create([
            'user_id' => $user->id,
            'wallet_balance' => 250000,
        ]);

        Commission::factory()->paid()->create([
            'account_manager_id' => $accountManager->id,
            'commission_amount' => 100000,
        ]);
        Commission::factory()->paid()->create([
            'account_manager_id' => $accountManager->id,
            'commission_amount' => 50000,
        ]);
        Commission::factory()->create([
            'account_manager_id' => $accountManager->id,
            'commission_amount' => 30000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/CommissionHistory')
            ->where('wallet_balance', 250000)
            ->where('stats.total_count', 3)
            ->where('stats.total_commission_amount', 180000)
            ->where('stats.paid_commission_amount', 150000)
            ->where('stats.pending_commission_amount', 30000)
        );
    }

    public function test_commission_row_includes_billing_and_downline_when_available(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create(['user_id' => $user->id]);

        $downline = User::factory()->create(['name' => 'John Downline']);
        $billing = BillingTransaction::factory()->for($downline)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 200000,
        ]);

        Commission::factory()->paid()->create([
            'account_manager_id' => $accountManager->id,
            'transaction_id' => $billing->reference,
            'commission_type' => 'billing_referral',
            'commission_value' => 10.00,
            'commission_amount' => 20000,
        ]);

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/CommissionHistory')
            ->where('commissions.data.0.transaction_reference', $billing->reference)
            ->where('commissions.data.0.commission_type', 'billing_referral')
            ->where('commissions.data.0.commission_type_label', 'Komisi referral billing')
            ->where('commissions.data.0.commission_value', 10)
            ->where('commissions.data.0.commission_amount', 20000)
            ->where('commissions.data.0.status', 'paid')
            ->where('commissions.data.0.status_label', 'Dibayarkan')
            ->where('commissions.data.0.billing.amount', 200000)
            ->where('commissions.data.0.downline.id', $downline->id)
            ->where('commissions.data.0.downline.name', 'John Downline')
        );
    }

    public function test_commission_row_handles_missing_billing_gracefully(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create(['user_id' => $user->id]);

        Commission::factory()->create([
            'account_manager_id' => $accountManager->id,
            'transaction_id' => 'non-existent-reference',
        ]);

        $response = $this->actingAs($user)->get(route('account-manager.commissions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/CommissionHistory')
            ->where('commissions.data.0.billing', null)
            ->where('commissions.data.0.downline', null)
        );
    }
}

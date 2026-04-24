<?php

namespace Tests\Feature\AccountManager;

use App\Models\AccountManager;
use App\Models\Commission;
use App\Models\User;
use App\Models\WalletTransaction;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
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

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get(route('account-manager.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_account_manager_user_can_access_dashboard(): void
    {
        $user = $this->makeAccountManagerUser();
        AccountManager::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AccountManager/Dashboard'));
    }

    public function test_admin_cannot_access_account_manager_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('account-manager.dashboard'));

        $response->assertStatus(403);
    }

    public function test_regular_user_cannot_access_account_manager_dashboard(): void
    {
        $user = User::factory()->withUserRole()->create();

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertStatus(403);
    }

    // -------------------------------------------------------------------------
    // Props structure
    // -------------------------------------------------------------------------

    public function test_dashboard_passes_correct_props_with_account_manager_record(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create([
            'user_id' => $user->id,
            'referral_code' => 'TESTCODE',
            'wallet_balance' => 150000,
        ]);

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Dashboard')
            ->has('user', fn ($u) => $u
                ->where('name', $user->name)
                ->where('email', $user->email)
            )
            ->has('primaryRole', fn ($r) => $r
                ->where('slug', 'account_manager')
                ->etc()
            )
            ->has('accountManager', fn ($am) => $am
                ->where('referral_code', 'TESTCODE')
                ->has('recent_transactions')
                ->has('recent_commissions')
                ->etc()
            )
            ->has('stats', fn ($s) => $s
                ->has('wallet_balance')
                ->has('total_referrals')
                ->has('total_commissions')
                ->has('pending_commissions')
                ->has('paid_commissions')
            )
        );
    }

    public function test_dashboard_passes_null_account_manager_when_record_does_not_exist(): void
    {
        $user = $this->makeAccountManagerUser();

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Dashboard')
            ->where('accountManager', null)
            ->where('stats', null)
        );
    }

    // -------------------------------------------------------------------------
    // Stats accuracy
    // -------------------------------------------------------------------------

    public function test_stats_reflect_correct_commission_counts(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create(['user_id' => $user->id]);

        Commission::factory()->count(3)->create(['account_manager_id' => $accountManager->id, 'status' => 'pending']);
        Commission::factory()->paid()->count(2)->create(['account_manager_id' => $accountManager->id]);

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Dashboard')
            ->has('stats', fn ($s) => $s
                ->where('total_commissions', 5)
                ->where('pending_commissions', 3)
                ->where('paid_commissions', 2)
                ->etc()
            )
        );
    }

    public function test_recent_commissions_are_limited_to_five(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create(['user_id' => $user->id]);

        Commission::factory()->count(10)->create(['account_manager_id' => $accountManager->id]);

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Dashboard')
            ->has('accountManager.recent_commissions', 5)
        );
    }

    public function test_recent_transactions_are_limited_to_five(): void
    {
        $user = $this->makeAccountManagerUser();
        $accountManager = AccountManager::factory()->create(['user_id' => $user->id]);

        WalletTransaction::factory()->count(10)->create(['account_manager_id' => $accountManager->id]);

        $response = $this->actingAs($user)->get(route('account-manager.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Dashboard')
            ->has('accountManager.recent_transactions', 5)
        );
    }
}

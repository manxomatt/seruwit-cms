<?php

namespace Tests\Feature\Module;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionLog;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingTransactionControllerTest extends TestCase
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

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('module.billing-transactions.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_without_users_view_permission_cannot_access(): void
    {
        $role = \App\Models\Role::query()->create([
            'slug' => 'restricted-billing',
            'name' => 'Restricted',
            'description' => 'No permissions',
            'is_system' => false,
            'dashboard_path' => '/module/dashboard',
        ]);
        $user = User::factory()->create();
        $user->roles()->sync([$role->id]);

        $response = $this->actingAs($user)->get(route('module.billing-transactions.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_index(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)->get(route('module.billing-transactions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Module/BillingTransactions/Index')
            ->has('transactions')
            ->has('filters')
            ->has('stats')
            ->has('statusOptions')
            ->has('typeOptions')
        );
    }

    // -------------------------------------------------------------------------
    // Index page
    // -------------------------------------------------------------------------

    public function test_index_lists_all_transactions_from_all_users(): void
    {
        $admin = $this->makeAdmin();
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        BillingTransaction::factory()->count(2)->for($userA)->create();
        BillingTransaction::factory()->count(3)->for($userB)->create();

        $response = $this->actingAs($admin)->get(route('module.billing-transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('transactions.total', 5)
            ->has('transactions.data', 5)
        );
    }

    public function test_index_can_filter_by_status(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();

        BillingTransaction::factory()->for($user)->count(2)->create([
            'status' => BillingTransactionStatus::Paid,
        ]);
        BillingTransaction::factory()->for($user)->count(3)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
        ]);

        $response = $this->actingAs($admin)->get(
            route('module.billing-transactions.index', ['status' => 'paid'])
        );

        $response->assertInertia(fn ($page) => $page
            ->where('transactions.total', 2)
            ->where('filters.status', 'paid')
        );
    }

    public function test_index_can_filter_by_type(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();

        BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
        ]);
        BillingTransaction::factory()->for($user)->count(2)->create([
            'type' => BillingTransactionType::DeviceExtension,
        ]);

        $response = $this->actingAs($admin)->get(
            route('module.billing-transactions.index', ['type' => 'device_extension'])
        );

        $response->assertInertia(fn ($page) => $page
            ->where('transactions.total', 2)
            ->where('filters.type', 'device_extension')
        );
    }

    public function test_index_can_search_by_user_name(): void
    {
        $admin = $this->makeAdmin();
        $alice = User::factory()->create(['name' => 'Alice Wonderland']);
        $bob = User::factory()->create(['name' => 'Bob Smith']);

        BillingTransaction::factory()->for($alice)->create();
        BillingTransaction::factory()->for($bob)->count(3)->create();

        $response = $this->actingAs($admin)->get(
            route('module.billing-transactions.index', ['search' => 'Alice'])
        );

        $response->assertInertia(fn ($page) => $page
            ->where('transactions.total', 1)
        );
    }

    public function test_index_can_search_by_reference(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();
        $tx = BillingTransaction::factory()->for($user)->create();

        $response = $this->actingAs($admin)->get(
            route('module.billing-transactions.index', ['search' => $tx->reference])
        );

        $response->assertInertia(fn ($page) => $page
            ->where('transactions.total', 1)
            ->where('transactions.data.0.reference', $tx->reference)
        );
    }

    public function test_stats_reflect_correct_counts_and_amounts(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();

        BillingTransaction::factory()->for($user)->count(2)->create([
            'status' => BillingTransactionStatus::Paid,
            'amount' => 100_000,
        ]);
        BillingTransaction::factory()->for($user)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 50_000,
        ]);
        BillingTransaction::factory()->for($user)->create([
            'status' => BillingTransactionStatus::Failed,
        ]);

        $response = $this->actingAs($admin)->get(route('module.billing-transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('stats.total_count', 4)
            ->where('stats.paid_count', 2)
            ->where('stats.awaiting_count', 1)
            ->where('stats.failed_count', 1)
            ->where('stats.paid_revenue', 200000)
            ->where('stats.awaiting_amount', 50000)
        );
    }

    public function test_index_provides_status_and_type_options(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)->get(route('module.billing-transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('statusOptions', 4)
            ->has('typeOptions', 2)
        );
    }

    // -------------------------------------------------------------------------
    // Show page
    // -------------------------------------------------------------------------

    public function test_admin_can_view_transaction_detail(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();
        $tx = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 80_000,
        ]);

        $response = $this->actingAs($admin)->get(
            route('module.billing-transactions.show', ['billingTransaction' => $tx->id])
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Module/BillingTransactions/Show')
            ->where('transaction.reference', $tx->reference)
            ->where('transaction.amount', 80000)
            ->where('transaction.status', 'paid')
            ->where('transaction.status_label', 'Lunas')
            ->where('transaction.type', 'quota_purchase')
            ->where('transaction.user.id', $user->id)
            ->has('transaction.logs')
        );
    }

    public function test_show_page_includes_transaction_logs(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();
        $tx = BillingTransaction::factory()->for($user)->create();

        BillingTransactionLog::factory()->count(3)->create([
            'billing_transaction_id' => $tx->id,
        ]);

        $response = $this->actingAs($admin)->get(
            route('module.billing-transactions.show', ['billingTransaction' => $tx->id])
        );

        $response->assertInertia(fn ($page) => $page
            ->has('transaction.logs', 3)
        );
    }

    public function test_guest_cannot_view_transaction_detail(): void
    {
        $user = User::factory()->create();
        $tx = BillingTransaction::factory()->for($user)->create();

        $response = $this->get(
            route('module.billing-transactions.show', ['billingTransaction' => $tx->id])
        );

        $response->assertRedirect(route('login'));
    }
}

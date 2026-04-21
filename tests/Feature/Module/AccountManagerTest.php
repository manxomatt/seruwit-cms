<?php

namespace Tests\Feature\Module;

use App\Models\AccountManager;
use App\Models\User;
use App\Models\WalletTransaction;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountManagerTest extends TestCase
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

    public function test_admin_can_access_account_managers_index(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('module.account-managers.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Module/AccountManagers/Index'));
    }

    // -------------------------------------------------------------------------
    // Create form
    // -------------------------------------------------------------------------

    public function test_admin_can_access_create_account_manager_form(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('module.account-managers.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Module/AccountManagers/Create'));
    }

    // -------------------------------------------------------------------------
    // Store – happy path
    // -------------------------------------------------------------------------

    public function test_admin_can_create_account_manager_successfully(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'phone_number' => '+62 812 1234 5678',
                'status' => 'active',
                'initial_wallet_balance' => 100000,
            ]);

        $response->assertRedirect(route('module.account-managers.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'name' => 'John Doe',
        ]);

        $this->assertDatabaseHas('user_profiles', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone_number' => '+62 812 1234 5678',
        ]);

        $this->assertDatabaseHas('account_managers', [
            'wallet_balance' => 100000,
            'status' => 'active',
        ]);
    }

    public function test_account_manager_referral_code_has_correct_format(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@example.com',
                'status' => 'active',
            ]);

        $year = now()->year;
        $accountManager = AccountManager::query()
            ->whereHas('user', fn ($q) => $q->where('email', 'jane.smith@example.com'))
            ->first();

        $this->assertNotNull($accountManager);
        $this->assertMatchesRegularExpression(
            '/^REF-AM-'.$year.'-\d{4}$/',
            $accountManager->referral_code
        );
    }

    public function test_initial_wallet_transaction_is_created_on_account_manager_creation(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Alice',
                'last_name' => null,
                'email' => 'alice@example.com',
                'status' => 'active',
                'initial_wallet_balance' => 500,
            ]);

        $accountManager = AccountManager::query()
            ->whereHas('user', fn ($q) => $q->where('email', 'alice@example.com'))
            ->first();

        $this->assertNotNull($accountManager);

        $transaction = WalletTransaction::query()
            ->where('account_manager_id', $accountManager->id)
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals('adjustment', $transaction->type);
        $this->assertEquals(500, $transaction->amount);
        $this->assertEquals(0, $transaction->balance_before);
        $this->assertEquals(500, $transaction->balance_after);
        $this->assertEquals('Initial Wallet Setup', $transaction->description);
    }

    public function test_initial_wallet_transaction_is_created_with_zero_when_no_balance_provided(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Bob',
                'email' => 'bob@example.com',
                'status' => 'active',
            ]);

        $accountManager = AccountManager::query()
            ->whereHas('user', fn ($q) => $q->where('email', 'bob@example.com'))
            ->first();

        $this->assertNotNull($accountManager);

        $transaction = WalletTransaction::query()
            ->where('account_manager_id', $accountManager->id)
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals('adjustment', $transaction->type);
        $this->assertEquals(0, $transaction->amount);
    }

    public function test_account_manager_role_is_assigned_on_creation(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Charlie',
                'email' => 'charlie@example.com',
                'status' => 'active',
            ]);

        $user = User::query()->where('email', 'charlie@example.com')->first();

        $this->assertNotNull($user);

        $hasRole = $user->roles()->where('slug', 'account_manager')->exists();
        $this->assertTrue($hasRole, 'Expected account_manager role to be assigned.');
    }

    public function test_referral_codes_are_unique_across_multiple_creations(): void
    {
        $emails = ['am1@example.com', 'am2@example.com', 'am3@example.com'];

        foreach ($emails as $email) {
            $this->actingAs($this->admin)
                ->post(route('module.account-managers.store'), [
                    'first_name' => 'Manager',
                    'email' => $email,
                    'status' => 'active',
                ]);
        }

        $codes = AccountManager::pluck('referral_code')->toArray();
        $this->assertCount(3, array_unique($codes), 'All referral codes should be unique.');
    }

    // -------------------------------------------------------------------------
    // Store – validation failures
    // -------------------------------------------------------------------------

    public function test_store_fails_when_email_is_missing(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Test',
                'status' => 'active',
            ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_store_fails_when_first_name_is_missing(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'email' => 'test@example.com',
                'status' => 'active',
            ]);

        $response->assertSessionHasErrors('first_name');
    }

    public function test_store_fails_when_email_is_already_taken(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Test',
                'email' => 'taken@example.com',
                'status' => 'active',
            ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_store_fails_when_status_is_invalid(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Test',
                'email' => 'test2@example.com',
                'status' => 'invalid_status',
            ]);

        $response->assertSessionHasErrors('status');
    }

    public function test_store_fails_when_initial_wallet_balance_is_negative(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Test',
                'email' => 'test3@example.com',
                'status' => 'active',
                'initial_wallet_balance' => -100,
            ]);

        $response->assertSessionHasErrors('initial_wallet_balance');
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_admin_can_view_account_manager_detail(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.account-managers.store'), [
                'first_name' => 'Dana',
                'email' => 'dana@example.com',
                'status' => 'active',
            ]);

        $accountManager = AccountManager::query()
            ->whereHas('user', fn ($q) => $q->where('email', 'dana@example.com'))
            ->first();

        $response = $this->actingAs($this->admin)
            ->get(route('module.account-managers.show', $accountManager));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Module/AccountManagers/Show'));
    }
}

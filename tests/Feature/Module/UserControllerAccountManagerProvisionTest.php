<?php

namespace Tests\Feature\Module;

use App\Models\AccountManager;
use App\Models\Role;
use App\Models\User;
use App\Models\WalletTransaction;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerAccountManagerProvisionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private int $accountManagerRoleId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);

        $this->admin = User::factory()->admin()->create();
        $this->accountManagerRoleId = Role::query()
            ->where('slug', 'account_manager')
            ->value('id');
    }

    private function storeUserPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Manager',
            'email' => 'manager@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'roles' => [$this->accountManagerRoleId],
            'first_name' => 'Test',
            'last_name' => 'Manager',
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // store() – provisions AccountManager on role assignment
    // -------------------------------------------------------------------------

    public function test_creating_user_with_account_manager_role_provisiones_account_manager_record(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.users.store'), $this->storeUserPayload());

        $user = User::query()->where('email', 'manager@example.com')->firstOrFail();

        $this->assertNotNull($user->accountManager, 'AccountManager record should be auto-provisioned.');
    }

    public function test_provisioned_account_manager_has_correct_referral_code_format(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.users.store'), $this->storeUserPayload());

        $user = User::query()->where('email', 'manager@example.com')->firstOrFail();
        $year = now()->year;

        $this->assertMatchesRegularExpression(
            '/^REF-AM-'.$year.'-\d{4}$/',
            $user->accountManager->referral_code
        );
    }

    public function test_provisioned_account_manager_has_initial_wallet_transaction(): void
    {
        $this->actingAs($this->admin)
            ->post(route('module.users.store'), $this->storeUserPayload());

        $user = User::query()->where('email', 'manager@example.com')->firstOrFail();
        $tx = WalletTransaction::query()
            ->where('account_manager_id', $user->accountManager->id)
            ->first();

        $this->assertNotNull($tx);
        $this->assertEquals('adjustment', $tx->type);
        $this->assertEquals(0, $tx->amount);
        $this->assertEquals('Initial Wallet Setup', $tx->description);
    }

    public function test_creating_user_without_account_manager_role_does_not_provision_record(): void
    {
        $userRole = Role::query()->where('slug', 'user')->value('id');

        $this->actingAs($this->admin)
            ->post(route('module.users.store'), $this->storeUserPayload([
                'email' => 'regular@example.com',
                'roles' => [$userRole],
            ]));

        $user = User::query()->where('email', 'regular@example.com')->firstOrFail();

        $this->assertNull($user->accountManager, 'Non-account-manager user should not have an AccountManager record.');
        $this->assertEquals(0, AccountManager::count());
    }

    // -------------------------------------------------------------------------
    // update() – provisions AccountManager when role is changed to account_manager
    // -------------------------------------------------------------------------

    public function test_updating_user_role_to_account_manager_provisiones_record(): void
    {
        $userRole = Role::query()->where('slug', 'user')->first();

        // Create a regular user first
        $user = User::factory()->create(['name' => 'Regular User', 'email' => 'switch@example.com']);
        $user->syncRoles([$userRole->id]);

        $this->assertNull($user->fresh()->accountManager);

        // Update role to account_manager
        $this->actingAs($this->admin)
            ->patch(route('module.users.update', $user), [
                'name' => $user->name,
                'email' => $user->email,
                'roles' => [$this->accountManagerRoleId],
                'first_name' => 'Regular',
                'last_name' => 'User',
            ]);

        $this->assertNotNull($user->fresh()->accountManager, 'AccountManager record should be created when role is switched.');
    }

    public function test_updating_existing_account_manager_does_not_duplicate_record(): void
    {
        // Create user with account_manager role (provisions record)
        $this->actingAs($this->admin)
            ->post(route('module.users.store'), $this->storeUserPayload());

        $user = User::query()->where('email', 'manager@example.com')->firstOrFail();

        $this->assertEquals(1, AccountManager::where('user_id', $user->id)->count());

        // Update the same user, keeping account_manager role
        $this->actingAs($this->admin)
            ->patch(route('module.users.update', $user), [
                'name' => $user->name,
                'email' => $user->email,
                'roles' => [$this->accountManagerRoleId],
                'first_name' => 'Test',
                'last_name' => 'Manager',
            ]);

        // Should still only have 1 AccountManager record
        $this->assertEquals(1, AccountManager::where('user_id', $user->id)->count());
    }
}

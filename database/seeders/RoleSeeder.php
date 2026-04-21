<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin role (has all permissions implicitly)
        $adminRole = Role::query()->firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrator',
                'description' => 'Full access to all system features',
                'is_system' => true,
                'dashboard_path' => '/module/dashboard',
            ]
        );

        // Assign all permissions to admin role
        $allPermissions = Permission::all();
        $adminRole->permissions()->sync($allPermissions->pluck('id')->toArray());

        // Create User role (read-only access)
        $userRole = Role::query()->firstOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'User',
                'description' => 'Read-only access to system features',
                'is_system' => true,
                'dashboard_path' => '/module/dashboard',
            ]
        );

        // Assign only view permissions to user role
        $viewPermissions = Permission::query()
            ->where('action', 'view')
            ->get();
        $userRole->permissions()->sync($viewPermissions->pluck('id')->toArray());

        // Account Manager role – local users who manage referrals and commissions.
        $accountManagerRole = Role::query()->firstOrCreate(
            ['slug' => 'account_manager'],
            [
                'name' => 'Account Manager',
                'description' => 'Manages referrals and commissions in the billing system',
                'is_system' => true,
                'dashboard_path' => '/module/dashboard',
            ]
        );
        // Account managers have view-only access to CMS content modules.
        $accountManagerRole->permissions()->sync($viewPermissions->pluck('id')->toArray());

        // -----------------------------------------------------------------------
        // External roles – assigned automatically to users authenticated via the
        // external API. Prefixed with "external_" to distinguish from local roles.
        // These roles carry no local CMS permissions; access is governed entirely
        // by the external API and displayed in the user's dashboard.
        // -----------------------------------------------------------------------

        $externalRoles = [
            'external_super_admin' => 'External Super Admin',
            'external_admin' => 'External Admin',
            'external_manager' => 'External Manager',
            'external_user' => 'External User',
        ];

        foreach ($externalRoles as $slug => $name) {
            Role::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => "Role for {$name} authenticated via the external API",
                    'is_system' => true,
                    'dashboard_path' => '/external/dashboard',
                ]
            );
        }
    }
}

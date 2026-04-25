<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            [
                'name' => 'Dashboard',
                'slug' => 'dashboard',
                'icon' => 'dashboard',
                'route_name' => 'dashboard',
                'permission_module' => null, // Visible to all authenticated users
                'sort_order' => 1,
            ],
            [
                'name' => 'Pages',
                'slug' => 'pages',
                'icon' => 'pages',
                'route_name' => 'pages.index',
                'permission_module' => 'pages',
                'permission_action' => 'view',
                'sort_order' => 2,
            ],
            [
                'name' => 'Posts',
                'slug' => 'posts',
                'icon' => 'posts',
                'route_name' => 'posts.index',
                'permission_module' => 'posts',
                'permission_action' => 'view',
                'sort_order' => 3,
            ],
            [
                'name' => 'Carousels',
                'slug' => 'carousels',
                'icon' => 'carousels',
                'route_name' => 'carousels.index',
                'permission_module' => 'carousels',
                'permission_action' => 'view',
                'sort_order' => 4,
            ],
            [
                'name' => 'Media',
                'slug' => 'media',
                'icon' => 'media',
                'route_name' => 'media.index',
                'permission_module' => 'media',
                'permission_action' => 'view',
                'sort_order' => 5,
            ],
            [
                'name' => 'Users',
                'slug' => 'users',
                'icon' => 'users',
                'route_name' => 'users.index',
                'permission_module' => 'users',
                'permission_action' => 'view',
                'sort_order' => 6,
            ],
            [
                'name' => 'Roles',
                'slug' => 'roles',
                'icon' => 'roles',
                'route_name' => 'roles.index',
                'permission_module' => 'roles',
                'permission_action' => 'view',
                'sort_order' => 7,
            ],
            [
                'name' => 'Analytics',
                'slug' => 'analytics',
                'icon' => 'analytics',
                'route_name' => 'analytics.index',
                'permission_module' => 'analytics',
                'permission_action' => 'view',
                'sort_order' => 8,
            ],
            [
                'name' => 'Settings',
                'slug' => 'settings',
                'icon' => 'settings',
                'route_name' => 'settings.index',
                'permission_module' => 'settings',
                'permission_action' => 'view',
                'sort_order' => 9,
            ],
            [
                'name' => 'Account Managers',
                'slug' => 'account-managers',
                'icon' => 'users',
                'route_name' => 'account-managers.index',
                'permission_module' => 'users',
                'permission_action' => 'view',
                'sort_order' => 10,
            ],
            [
                'name' => 'Referral Approvals',
                'slug' => 'referral-approvals',
                'icon' => 'users',
                'route_name' => 'referral-approvals.index',
                'permission_module' => 'users',
                'permission_action' => 'view',
                'sort_order' => 11,
            ],
        ];

        foreach ($menus as $menuData) {
            Menu::updateOrCreate(
                ['slug' => $menuData['slug']],
                $menuData
            );
        }
    }
}

<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the roles
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_admin_user_is_redirected_to_dashboard_after_login(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->post('/login', [
            'login' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/module/dashboard');
    }

    public function test_user_role_is_redirected_to_dashboard_after_login(): void
    {
        $user = User::factory()->withUserRole()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/module/dashboard');
    }

    public function test_custom_role_user_is_redirected_to_dashboard_after_login(): void
    {
        // Create a custom role
        $customRole = Role::create([
            'name' => 'Content Manager',
            'slug' => 'content-manager',
            'description' => 'Manages content',
            'is_system' => false,
        ]);

        $user = User::factory()->create();
        $user->roles()->attach($customRole);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/module/dashboard');
    }

    public function test_custom_role_with_custom_dashboard_path_redirects_correctly(): void
    {
        // Create a custom role with a custom dashboard path
        $customRole = Role::create([
            'name' => 'Editor',
            'slug' => 'editor',
            'description' => 'Content editor',
            'dashboard_path' => '/editor/dashboard',
            'is_system' => false,
        ]);

        $user = User::factory()->create();
        $user->roles()->attach($customRole);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/editor/dashboard');
    }

    public function test_user_with_no_roles_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/module/dashboard');
    }

    public function test_user_with_multiple_roles_is_redirected_based_on_priority(): void
    {
        // User with both admin and user roles should be redirected to dashboard
        $user = User::factory()->admin()->withUserRole()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/module/dashboard');
    }

    public function test_dashboard_page_can_be_rendered(): void
    {
        $user = User::factory()->withUserRole()->create();

        $response = $this->actingAs($user)->get('/module/dashboard');

        $response->assertStatus(200);
    }

    public function test_get_dashboard_path_returns_correct_path_for_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->assertEquals('/module/dashboard', $admin->getDashboardPath());
    }

    public function test_get_dashboard_path_returns_correct_path_for_user_role(): void
    {
        $user = User::factory()->withUserRole()->create();

        $this->assertEquals('/module/dashboard', $user->getDashboardPath());
    }

    public function test_get_dashboard_path_returns_custom_path_for_custom_role(): void
    {
        $customRole = Role::create([
            'name' => 'Editor',
            'slug' => 'editor',
            'description' => 'Content editor',
            'dashboard_path' => '/editor/dashboard',
            'is_system' => false,
        ]);

        $user = User::factory()->create();
        $user->roles()->attach($customRole);

        $this->assertEquals('/editor/dashboard', $user->getDashboardPath());
    }

    public function test_get_dashboard_path_returns_default_path_for_custom_role_without_dashboard_path(): void
    {
        $customRole = Role::create([
            'name' => 'Moderator',
            'slug' => 'moderator',
            'description' => 'Content moderator',
            'is_system' => false,
        ]);

        $user = User::factory()->create();
        $user->roles()->attach($customRole);

        $this->assertEquals('/module/dashboard', $user->getDashboardPath());
    }

    public function test_get_dashboard_path_prioritizes_external_portal_when_user_also_has_user_role(): void
    {
        $user = User::factory()->withUserRole()->withRole('external_user')->create();

        $this->assertEquals('/external/dashboard', $user->getDashboardPath());
    }

    public function test_login_redirects_to_external_dashboard_when_user_has_external_and_user_roles(): void
    {
        $user = User::factory()->withUserRole()->withRole('external_user')->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/external/dashboard');
    }
}

<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserExternalPortalAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_returns_true_when_user_has_external_role_only(): void
    {
        $external = Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create();
        $user->roles()->sync([$external->id]);

        $this->assertTrue($user->hasExternalPortalAccess());
    }

    public function test_returns_true_when_user_role_is_primary_but_external_role_is_also_attached(): void
    {
        $userRole = Role::query()->where('slug', 'user')->firstOrFail();
        $external = Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create();
        $user->roles()->sync([$userRole->id, $external->id]);

        $this->assertSame('user', $user->getPrimaryRole()?->slug);
        $this->assertTrue($user->hasExternalPortalAccess());
    }

    public function test_returns_false_for_standard_module_user_only(): void
    {
        $userRole = Role::query()->where('slug', 'user')->firstOrFail();
        $user = User::factory()->create();
        $user->roles()->sync([$userRole->id]);

        $this->assertFalse($user->hasExternalPortalAccess());
    }
}

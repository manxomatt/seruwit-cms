<?php

namespace Tests\Feature\Module;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserVerifyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);

        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_verify_unverified_user(): void
    {
        $user = User::factory()->unverified()->create();

        $this->assertNull($user->email_verified_at);

        $response = $this->actingAs($this->admin)
            ->patch(route('module.users.verify', $user));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verifying_already_verified_user_succeeds(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()->subDay()]);

        $response = $this->actingAs($this->admin)
            ->patch(route('module.users.verify', $user));

        $response->assertRedirect();
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_unauthenticated_user_cannot_verify(): void
    {
        $user = User::factory()->unverified()->create();

        $this->patch(route('module.users.verify', $user))
            ->assertRedirect(route('login'));
    }
}

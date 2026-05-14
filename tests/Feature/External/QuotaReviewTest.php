<?php

namespace Tests\Feature\External;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuotaReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalUser(): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_review_redirects_to_cart_when_checkout_missing(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.quota.review'));

        $response->assertRedirect(route('external.quota-cart'));
        $response->assertSessionHas('error');
    }

    public function test_review_displays_checkout_after_cart_store(): void
    {
        $user = $this->makeExternalUser();

        $this->actingAs($user)->post(route('external.quota-cart.store'), [
            'quantity' => 3,
        ]);

        $response = $this->actingAs($user)->get(route('external.quota.review'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('External/Quota/Review')
            ->where('quantity', 3)
            ->where('unitPrice', 10_000)
            ->where('total', 30_000)
            ->has('submitWaitingReviewUrl')
        );
    }
}

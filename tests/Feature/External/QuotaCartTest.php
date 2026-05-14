<?php

namespace Tests\Feature\External;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuotaCartTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalUser(?string $externalId = null): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create([
            'status' => 'active',
            'external_id' => $externalId,
        ]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_unauthenticated_user_is_redirected_to_login_on_get(): void
    {
        $response = $this->get('/external/quota-cart');

        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_user_is_redirected_to_login_on_post(): void
    {
        $response = $this->post(route('external.quota-cart.store'), [
            'quantity' => 1,
        ]);

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_quota_cart_page(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get('/external/quota-cart');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('External/QuotaCart/Index')
            ->where('userName', $user->name)
            ->where('quotaUnitPrice', 10_000)
            ->has('dashboardUrl')
        );
    }

    public function test_store_redirects_to_review_with_checkout_session(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->post(route('external.quota-cart.store'), [
            'quantity' => 5,
        ]);

        $response->assertRedirect(route('external.quota.review'));
        $response->assertSessionHas('quota_checkout.quantity', 5);
        $response->assertSessionHas('quota_checkout.unit_price', 10_000);
        $response->assertSessionHas('quota_checkout.total', 50_000);
    }

    public function test_store_rejects_quantity_below_one(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->post(route('external.quota-cart.store'), [
            'quantity' => 0,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_store_rejects_quantity_above_maximum(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->post(route('external.quota-cart.store'), [
            'quantity' => 10_000,
        ]);

        $response->assertSessionHasErrors('quantity');
    }
}

<?php

namespace Tests\Feature\External;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WaitingReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalUserWithBillingId(string $externalId = '42'): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create([
            'status' => 'active',
            'external_id' => $externalId,
        ]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_store_redirects_to_cart_when_checkout_missing(): void
    {
        $user = $this->makeExternalUserWithBillingId();

        $response = $this->actingAs($user)->post(route('external.quota.waiting-review.store'));

        $response->assertRedirect(route('external.quota-cart'));
        $response->assertSessionHas('error');
    }

    public function test_show_renders_waiting_without_calling_external_api(): void
    {
        Http::preventStrayRequests();

        $user = $this->makeExternalUserWithBillingId('42');

        $this->actingAs($user)->post(route('external.quota-cart.store'), [
            'quantity' => 5,
        ]);

        $redirect = $this->actingAs($user)->post(route('external.quota.waiting-review.store'));

        $redirect->assertRedirect(route('external.quota.waiting-review'));

        $view = $this->actingAs($user)->get(route('external.quota.waiting-review'));

        $view->assertStatus(200);
        $view->assertInertia(fn ($page) => $page
            ->component('External/Quota/WaitingReview')
            ->where('flow', 'quota')
            ->where('success', true)
            ->where('quantity', 5)
            ->where('errorMessage', null)
            ->has('billingTransaction')
            ->has('paymentCallbackUrl')
            ->where('deviceSummary', null)
        );

        $this->assertDatabaseHas('billing_transactions', [
            'user_id' => $user->id,
            'amount' => 50_000,
        ]);

        $tx = \App\Models\BillingTransaction::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertNotNull($tx->invoice_number, 'QuotaPurchase AwaitingPayment should already have an invoice_number for the penagihan invoice.');
        $this->assertMatchesRegularExpression('/^INV-\d{6}-\d{4}$/', (string) $tx->invoice_number);
    }

    public function test_show_redirects_when_visit_flag_missing(): void
    {
        $user = $this->makeExternalUserWithBillingId();

        $response = $this->actingAs($user)->get(route('external.quota.waiting-review'));

        $response->assertRedirect(route('external.dashboard'));
        $response->assertSessionHas('error');
    }

    public function test_second_get_waiting_without_new_confirm_redirects(): void
    {
        Http::preventStrayRequests();

        $user = $this->makeExternalUserWithBillingId('42');

        $this->actingAs($user)->post(route('external.quota-cart.store'), ['quantity' => 1]);
        $this->actingAs($user)->post(route('external.quota.waiting-review.store'));
        $this->actingAs($user)->get(route('external.quota.waiting-review'));

        $again = $this->actingAs($user)->get(route('external.quota.waiting-review'));

        $again->assertRedirect(route('external.dashboard'));
    }
}

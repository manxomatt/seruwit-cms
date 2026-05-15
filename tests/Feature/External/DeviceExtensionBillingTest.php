<?php

namespace Tests\Feature\External;

use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceExtensionBillingTest extends TestCase
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

    public function test_guest_cannot_access_device_extension_form(): void
    {
        $response = $this->get(route('external.billing.device-extension'));

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_device_extension_confirm(): void
    {
        $url = route('external.billing.device-extension.confirm').'?'.http_build_query([
            'device_identifier' => 'IMEI-1',
        ]);

        $response = $this->get($url);

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_device_extension_form(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.billing.device-extension'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Billing/DeviceExtension')
            ->where('amount', 50_000)
            ->has('storeUrl')
            ->has('objectsUrl')
        );
    }

    public function test_confirm_page_renders_when_query_valid(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(
            route('external.billing.device-extension.confirm').'?'.http_build_query([
                'device_identifier' => 'IMEI-999',
                'device_label' => 'Unit test',
                'object_expire_dt' => '2027-01-01 00:00:00',
            ])
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Billing/DeviceExtensionConfirm')
            ->where('device_identifier', 'IMEI-999')
            ->where('device_label', 'Unit test')
            ->where('object_expire_dt', '2027-01-01 00:00:00')
            ->has('storeUrl')
            ->has('objectsUrl')
        );
    }

    public function test_confirm_redirects_to_objects_when_identifier_missing(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.billing.device-extension.confirm'));

        $response->assertRedirect(route('external.objects.index'));
        $response->assertSessionHasErrors('device_identifier');
    }

    public function test_user_can_submit_device_extension_request(): void
    {
        config(['billing.device_extension_amount' => 75_000]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->post(route('external.billing.device-extension.store'), [
            'device_identifier' => 'IMEI-123456789',
            'device_label' => 'Mobil operasional',
        ]);

        $response->assertRedirect(route('external.quota.waiting-review'));

        $this->assertDatabaseHas('billing_transactions', [
            'user_id' => $user->id,
            'type' => BillingTransactionType::DeviceExtension->value,
            'amount' => 75_000,
        ]);

        $tx = BillingTransaction::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertGreaterThanOrEqual(1, $tx->logs()->count());

        $view = $this->actingAs($user)->get(route('external.quota.waiting-review'));
        $view->assertOk();
        $view->assertInertia(fn ($page) => $page
            ->component('External/Quota/WaitingReview')
            ->where('flow', 'device_extension')
            ->where('success', true)
            ->where('deviceSummary.identifier', 'IMEI-123456789')
            ->where('deviceSummary.label', 'Mobil operasional')
            ->has('billingTransaction')
            ->has('paymentCallbackUrl')
        );
    }

    public function test_confirm_store_redirects_to_waiting_review(): void
    {
        $user = $this->makeExternalUser();

        $post = $this->actingAs($user)->post(route('external.billing.device-extension.confirm.store'), [
            'device_identifier' => 'ID-ABC',
            'device_label' => 'Truk',
        ]);

        $post->assertRedirect(route('external.quota.waiting-review'));

        $view = $this->actingAs($user)->get(route('external.quota.waiting-review'));
        $view->assertOk();
        $view->assertInertia(fn ($page) => $page
            ->where('flow', 'device_extension')
            ->where('deviceSummary.identifier', 'ID-ABC')
        );
    }
}

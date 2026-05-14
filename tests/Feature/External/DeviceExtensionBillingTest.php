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

    public function test_authenticated_user_can_view_device_extension_form(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.billing.device-extension'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Billing/DeviceExtension')
            ->where('amount', 50_000)
            ->has('storeUrl')
        );
    }

    public function test_user_can_submit_device_extension_request(): void
    {
        config(['billing.device_extension_amount' => 75_000]);

        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->post(route('external.billing.device-extension.store'), [
            'device_identifier' => 'IMEI-123456789',
            'device_label' => 'Mobil operasional',
            'notes' => 'Perpanjang 30 hari',
        ]);

        $response->assertRedirect(route('external.dashboard'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('billing_transactions', [
            'user_id' => $user->id,
            'type' => BillingTransactionType::DeviceExtension->value,
            'amount' => 75_000,
        ]);

        $tx = BillingTransaction::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertGreaterThanOrEqual(1, $tx->logs()->count());
    }
}

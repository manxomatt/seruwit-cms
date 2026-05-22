<?php

namespace Tests\Feature\External;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\QuotaUsageLog;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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

    private function makeExternalManager(string $externalId = 'mgr-1'): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_manager')->firstOrFail();
        $user = User::factory()->create([
            'status' => 'active',
            'external_id' => $externalId,
        ]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    private function configureExternalApi(): void
    {
        config([
            'services.external_api.url' => 'https://api.example.test/api',
            'services.external_api.key' => 'test-api-key',
            'services.external_api.quota_fulfillment_path' => 'billing/users/{id}/quota',
            'services.external_api.device_extension_fulfillment_path' => 'billing/objects/expire',
        ]);
    }

    private function fakeBillingUserQuota(string $externalId, int $objectsRemaining): void
    {
        Http::fake([
            'api.example.test/api/billing/users/'.$externalId => Http::response([
                'success' => true,
                'user' => ['id' => 1, 'username' => 'm'],
                'quota' => [
                    'obj_limit_num' => 10,
                    'objects_assigned' => 0,
                    'objects_trial_linked' => 0,
                    'linked_objects_total' => 10 - $objectsRemaining,
                    'objects_remaining' => $objectsRemaining,
                    'objects_expired' => 0,
                    'objects_expired_non_trial' => 0,
                    'objects_expired_trial' => 0,
                ],
            ], 200),
        ]);
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
        $this->assertNotNull($tx->invoice_number, 'AwaitingPayment transaction should already have an invoice_number for the penagihan invoice.');
        $this->assertMatchesRegularExpression('/^INV-\d{6}-\d{4}$/', (string) $tx->invoice_number);

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

    public function test_confirm_page_exposes_quota_option_for_manager_with_remaining_slots(): void
    {
        $this->configureExternalApi();
        $manager = $this->makeExternalManager('mgr-7');
        $this->fakeBillingUserQuota('mgr-7', 3);

        $response = $this->actingAs($manager)->get(
            route('external.billing.device-extension.confirm').'?'.http_build_query([
                'device_identifier' => 'IMEI-555',
            ])
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Billing/DeviceExtensionConfirm')
            ->where('isManager', true)
            ->where('objectsRemaining', 3)
            ->where('canPayWithQuota', true)
        );
    }

    public function test_confirm_page_disables_quota_option_when_manager_has_no_remaining_slots(): void
    {
        $this->configureExternalApi();
        $manager = $this->makeExternalManager('mgr-8');
        $this->fakeBillingUserQuota('mgr-8', 0);

        $response = $this->actingAs($manager)->get(
            route('external.billing.device-extension.confirm').'?'.http_build_query([
                'device_identifier' => 'IMEI-555',
            ])
        );

        $response->assertInertia(fn ($page) => $page
            ->where('isManager', true)
            ->where('objectsRemaining', 0)
            ->where('canPayWithQuota', false)
        );
    }

    public function test_confirm_page_does_not_show_quota_option_for_non_manager(): void
    {
        $this->configureExternalApi();
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(
            route('external.billing.device-extension.confirm').'?'.http_build_query([
                'device_identifier' => 'IMEI-555',
            ])
        );

        $response->assertInertia(fn ($page) => $page
            ->where('isManager', false)
            ->where('objectsRemaining', null)
            ->where('canPayWithQuota', false)
        );
    }

    public function test_manager_can_extend_device_using_quota_creates_paid_transaction_and_calls_external_api(): void
    {
        $this->configureExternalApi();
        $manager = $this->makeExternalManager('mgr-9');

        Http::fake([
            'api.example.test/api/billing/users/mgr-9' => Http::response([
                'success' => true,
                'user' => ['id' => 1],
                'quota' => ['objects_remaining' => 4],
            ], 200),
            'api.example.test/api/billing/objects/expire' => Http::response(['ok' => true], 200),
            'api.example.test/api/billing/users/mgr-9/quota' => Http::response(['ok' => true], 200),
        ]);

        $response = $this->actingAs($manager)->post(route('external.billing.device-extension.confirm.store'), [
            'device_identifier' => 'IMEI-EXTEND',
            'device_label' => 'Quota truck',
            'payment_method' => 'quota',
        ]);

        $response->assertRedirect(route('external.objects.index'));
        $response->assertSessionHas('success');

        $tx = BillingTransaction::query()->where('user_id', $manager->id)->firstOrFail();
        $this->assertSame(BillingTransactionType::DeviceExtension, $tx->type);
        $this->assertSame(BillingTransactionStatus::Paid, $tx->status);
        $this->assertSame(0, (int) $tx->amount);
        $this->assertSame('quota', $tx->meta['payment_method'] ?? null);
        $this->assertNotNull($tx->paid_at);
        $this->assertNotNull($tx->fulfilled_at);

        Http::assertSent(function ($request): bool {
            return str_contains($request->url(), '/billing/objects/expire')
                && $request->method() === 'PATCH'
                && ($request->data()['imei'] ?? null) === 'IMEI-EXTEND';
        });

        Http::assertSent(function ($request): bool {
            return str_contains($request->url(), '/billing/users/mgr-9/quota')
                && $request->method() === 'PATCH'
                && ($request->data()['add_to_quota'] ?? null) === -1;
        });

        $log = QuotaUsageLog::query()->where('user_id', $manager->id)->firstOrFail();
        $this->assertSame('IMEI-EXTEND', $log->device_identifier);
        $this->assertSame('Quota truck', $log->device_label);
        $this->assertSame(1, $log->quota_used);
        $this->assertSame(4, $log->quota_before);
        $this->assertSame(3, $log->quota_after);
        $this->assertSame($tx->id, $log->billing_transaction_id);

        $this->assertNotNull($tx->invoice_number);
        $this->assertMatchesRegularExpression('/^INV-\d{6}-\d{4}$/', (string) $tx->invoice_number);
    }

    public function test_manager_quota_usage_log_is_not_recorded_when_quota_decrement_fails(): void
    {
        $this->configureExternalApi();
        $manager = $this->makeExternalManager('mgr-fail');

        Http::fake([
            'api.example.test/api/billing/users/mgr-fail' => Http::response([
                'success' => true,
                'user' => ['id' => 1],
                'quota' => ['objects_remaining' => 2],
            ], 200),
            'api.example.test/api/billing/objects/expire' => Http::response(['ok' => true], 200),
            'api.example.test/api/billing/users/mgr-fail/quota' => Http::response(['ok' => false], 500),
        ]);

        $response = $this->actingAs($manager)->post(route('external.billing.device-extension.confirm.store'), [
            'device_identifier' => 'IMEI-FAIL',
            'payment_method' => 'quota',
        ]);

        $response->assertRedirect(route('external.objects.index'));

        $this->assertSame(0, QuotaUsageLog::query()->where('user_id', $manager->id)->count());
    }

    public function test_manager_cannot_extend_device_using_quota_when_no_remaining_slots(): void
    {
        $this->configureExternalApi();
        $manager = $this->makeExternalManager('mgr-10');
        $this->fakeBillingUserQuota('mgr-10', 0);

        $response = $this->actingAs($manager)->post(route('external.billing.device-extension.confirm.store'), [
            'device_identifier' => 'IMEI-NO-QUOTA',
            'payment_method' => 'quota',
        ]);

        $response->assertRedirect(route('external.objects.index'));
        $response->assertSessionHas('error');

        $this->assertSame(0, BillingTransaction::query()->where('user_id', $manager->id)->count());
        Http::assertNotSent(fn ($request): bool => str_contains($request->url(), '/billing/objects/expire'));
    }

    public function test_non_manager_cannot_extend_device_using_quota(): void
    {
        $this->configureExternalApi();
        $user = $this->makeExternalUser();
        Http::fake();

        $response = $this->actingAs($user)->post(route('external.billing.device-extension.confirm.store'), [
            'device_identifier' => 'IMEI-NOT-ALLOWED',
            'payment_method' => 'quota',
        ]);

        $response->assertRedirect(route('external.objects.index'));
        $response->assertSessionHas('error');
        $this->assertSame(0, BillingTransaction::query()->where('user_id', $user->id)->count());
        Http::assertNothingSent();
    }
}

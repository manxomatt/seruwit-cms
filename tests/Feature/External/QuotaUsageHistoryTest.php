<?php

namespace Tests\Feature\External;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class QuotaUsageHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        config([
            'services.external_api.url' => 'https://api.example.test/api',
            'services.external_api.key' => 'test-api-key',
        ]);
    }

    private function makeManager(string $externalId = 'mgr-16'): User
    {
        $role = Role::query()->where('slug', 'external_manager')->firstOrFail();
        $user = User::factory()->create(['status' => 'active', 'external_id' => $externalId]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    private function makeExternalUser(): User
    {
        $role = Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_guest_cannot_access_quota_usage_history(): void
    {
        $response = $this->get(route('external.quota.usage-history'));

        $response->assertRedirect('/login');
    }

    public function test_non_manager_is_redirected_away_from_usage_history(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.quota.usage-history'));

        $response->assertRedirect(route('external.dashboard'));
        $response->assertSessionHas('error');
    }

    public function test_manager_fetches_quota_transactions_from_external_api_and_renders_them(): void
    {
        $manager = $this->makeManager('mgr-16');

        $localTx = BillingTransaction::factory()->for($manager)->create([
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 0,
        ]);

        Http::fake([
            'api.example.test/api/billing/quota-transactions*' => Http::response([
                'success' => true,
                'filters' => ['user_id' => 16],
                'data' => [
                    [
                        'id' => 10,
                        'type' => 'quota_consumed',
                        'delta' => -1,
                        'quota_before' => 70,
                        'quota_after' => 69,
                        'billing_transaction_id' => $localTx->id,
                        'imei' => '23232323232',
                        'notes' => 'quota consumed for object renewal (add_to_quota: -1)',
                        'created_at' => '2026-05-26T14:57:33+00:00',
                        'object_name' => 'ADD 2305',
                    ],
                    [
                        'id' => 7,
                        'type' => 'quota_added',
                        'delta' => 10,
                        'quota_before' => 62,
                        'quota_after' => 72,
                        'billing_transaction_id' => null,
                        'imei' => null,
                        'notes' => 'add_to_quota: 10',
                        'created_at' => '2026-05-26T14:32:36+00:00',
                    ],
                ],
                'pagination' => [
                    'total' => 2,
                    'per_page' => 50,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => 1,
                    'to' => 2,
                ],
            ], 200),
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Quota/UsageHistory')
            ->where('error', null)
            ->has('logs.data', 2)
            ->where('logs.data.0.id', 10)
            ->where('logs.data.0.type', 'quota_consumed')
            ->where('logs.data.0.delta', -1)
            ->where('logs.data.0.imei', '23232323232')
            ->where('logs.data.0.object_name', 'ADD 2305')
            ->where('logs.data.0.quota_before', 70)
            ->where('logs.data.0.quota_after', 69)
            ->where('logs.data.0.billing_transaction_id', $localTx->id)
            ->where('logs.data.0.invoice_lunas_url', route('billing.invoices.download', ['billingTransaction' => $localTx->id, 'type' => 'lunas']))
            ->where('logs.data.1.id', 7)
            ->where('logs.data.1.type', 'quota_added')
            ->where('logs.data.1.delta', 10)
            ->where('logs.data.1.invoice_lunas_url', null)
            ->where('logs.current_page', 1)
            ->where('logs.last_page', 1)
            ->where('logs.total', 2)
            ->where('logs.per_page', 50)
        );

        Http::assertSent(function ($request): bool {
            return str_contains($request->url(), '/billing/quota-transactions')
                && $request->method() === 'GET'
                && $request->hasHeader('X-Api-Key', 'test-api-key')
                && (string) ($request->data()['user_id'] ?? null) === 'mgr-16'
                && (int) ($request->data()['page'] ?? 0) === 1
                && (int) ($request->data()['per_page'] ?? 0) === 50;
        });
    }

    public function test_invoice_url_is_null_when_billing_transaction_belongs_to_another_user(): void
    {
        $manager = $this->makeManager('mgr-16');
        $other = $this->makeManager('mgr-other');

        $otherTx = BillingTransaction::factory()->for($other)->create([
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::Paid,
        ]);

        Http::fake([
            'api.example.test/api/billing/quota-transactions*' => Http::response([
                'success' => true,
                'data' => [
                    [
                        'id' => 1,
                        'type' => 'quota_consumed',
                        'delta' => -1,
                        'billing_transaction_id' => $otherTx->id,
                        'imei' => 'IMEI-X',
                        'created_at' => '2026-05-26T10:00:00+00:00',
                    ],
                ],
                'pagination' => ['total' => 1, 'per_page' => 50, 'current_page' => 1, 'last_page' => 1, 'from' => 1, 'to' => 1],
            ], 200),
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('logs.data.0.invoice_lunas_url', null)
        );
    }

    public function test_pagination_forwards_page_query_to_external_api(): void
    {
        $manager = $this->makeManager('mgr-16');

        Http::fake([
            'api.example.test/api/billing/quota-transactions*' => Http::response([
                'success' => true,
                'data' => [],
                'pagination' => ['total' => 120, 'per_page' => 50, 'current_page' => 3, 'last_page' => 3, 'from' => 101, 'to' => 120],
            ], 200),
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history', ['page' => 3]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('logs.current_page', 3)
            ->where('logs.last_page', 3)
            ->where('logs.total', 120)
        );

        Http::assertSent(fn ($request): bool => (int) ($request->data()['page'] ?? 0) === 3);
    }

    public function test_renders_error_with_external_api_detail_when_non_200(): void
    {
        $manager = $this->makeManager('mgr-16');

        Http::fake([
            'api.example.test/api/billing/quota-transactions*' => Http::response([
                'success' => false,
                'message' => 'User not found for billing scope',
            ], 404),
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('logs.data', 0)
            ->where('error', 'Sistem eksternal merespon status 404. User not found for billing scope')
        );
    }

    public function test_renders_error_with_raw_body_when_non_json_response(): void
    {
        $manager = $this->makeManager('mgr-16');

        Http::fake([
            'api.example.test/api/billing/quota-transactions*' => Http::response('Internal Server Error', 500),
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('logs.data', 0)
            ->where('error', 'Sistem eksternal merespon status 500. Internal Server Error')
        );
    }

    public function test_renders_error_with_errors_array_when_present(): void
    {
        $manager = $this->makeManager('mgr-16');

        Http::fake([
            'api.example.test/api/billing/quota-transactions*' => Http::response([
                'errors' => ['user_id' => ['The user_id field is required.']],
            ], 422),
        ]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('logs.data', 0)
            ->where('error', 'Sistem eksternal merespon status 422. {"user_id":["The user_id field is required."]}')
        );
    }

    public function test_renders_error_when_external_id_missing(): void
    {
        $role = Role::query()->where('slug', 'external_manager')->firstOrFail();
        $manager = User::factory()->create(['status' => 'active', 'external_id' => null]);
        $manager->roles()->sync([$role->id]);

        $response = $this->actingAs($manager)->get(route('external.quota.usage-history'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('logs.data', 0)
            ->where('error', 'External ID belum di-set untuk akun ini; tidak dapat memuat riwayat kuota.')
        );
    }
}

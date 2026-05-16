<?php

namespace Tests\Feature\Billing;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionLog;
use App\Models\User;
use App\Services\Billing\FulfillPaidBillingTransactionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FulfillPaidBillingTransactionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.external_api.url' => 'https://api.example.test/api',
            'services.external_api.key' => 'test-api-key',
            'services.external_api.quota_fulfillment_path' => 'billing/users/{id}/quota',
            'services.external_api.device_extension_fulfillment_path' => 'billing/objects/expire',
        ]);
    }

    private function service(): FulfillPaidBillingTransactionService
    {
        return $this->app->make(FulfillPaidBillingTransactionService::class);
    }

    private function makeUserWithExternalId(string $externalId = 'ext-123'): User
    {
        return User::factory()->create(['external_id' => $externalId]);
    }

    public function test_quota_purchase_calls_external_api_and_marks_fulfilled(): void
    {
        Http::fake([
            'api.example.test/api/billing/users/ext-123/quota' => Http::response(['ok' => true], 200),
        ]);

        $user = $this->makeUserWithExternalId('ext-123');
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 100_000,
            'meta' => ['quantity' => 10, 'unit_price' => 10_000],
            'paid_at' => now(),
        ]);

        $this->service()->fulfill($transaction);

        Http::assertSent(function ($request): bool {
            $body = $request->data();

            return $request->url() === 'https://api.example.test/api/billing/users/ext-123/quota'
                && $request->method() === 'PATCH'
                && $request->hasHeader('X-Api-Key', 'test-api-key')
                && ($body['add_to_quota'] ?? null) === 10
                && count($body) === 1;
        });

        $fresh = $transaction->fresh();
        $this->assertNotNull($fresh->fulfilled_at);
        $this->assertSame(1, $fresh->fulfillment_attempts);
        $this->assertNull($fresh->fulfillment_error);

        $this->assertSame(1, BillingTransactionLog::query()
            ->where('billing_transaction_id', $transaction->id)
            ->where('action', 'fulfillment.success')
            ->count());
    }

    public function test_device_extension_calls_correct_endpoint(): void
    {
        Http::fake([
            'api.example.test/api/billing/objects/expire' => Http::response([], 200),
        ]);

        $user = $this->makeUserWithExternalId('999');
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 50_000,
            'meta' => ['device_identifier' => '350000000000001', 'device_label' => 'Truck A'],
            'paid_at' => now(),
        ]);

        $this->service()->fulfill($transaction);

        Http::assertSent(function ($request): bool {
            $body = $request->data();

            return $request->url() === 'https://api.example.test/api/billing/objects/expire'
                && $request->method() === 'PATCH'
                && $request->hasHeader('X-Api-Key', 'test-api-key')
                && ($body['imei'] ?? null) === '350000000000001'
                && ($body['user_id'] ?? null) === 999;
        });

        $this->assertNotNull($transaction->fresh()->fulfilled_at);
    }

    public function test_device_extension_fails_when_imei_missing_in_meta(): void
    {
        Http::fake();

        $user = $this->makeUserWithExternalId();
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::Paid,
            'meta' => ['device_label' => 'no imei here'],
        ]);

        $this->service()->fulfill($transaction);

        Http::assertNothingSent();
        $fresh = $transaction->fresh();
        $this->assertNull($fresh->fulfilled_at);
        $this->assertStringContainsString('IMEI device tidak ditemukan', (string) $fresh->fulfillment_error);
    }

    public function test_fulfillment_is_idempotent_when_already_fulfilled(): void
    {
        Http::fake();

        $user = $this->makeUserWithExternalId();
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'fulfilled_at' => now()->subMinute(),
            'fulfillment_attempts' => 1,
        ]);

        $this->service()->fulfill($transaction);

        Http::assertNothingSent();

        $this->assertSame(1, BillingTransactionLog::query()
            ->where('billing_transaction_id', $transaction->id)
            ->where('action', 'fulfillment.skipped')
            ->count());
    }

    public function test_fulfillment_skipped_when_status_is_not_paid(): void
    {
        Http::fake();

        $user = $this->makeUserWithExternalId();
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::AwaitingPayment,
        ]);

        $this->service()->fulfill($transaction);

        Http::assertNothingSent();
        $this->assertNull($transaction->fresh()->fulfilled_at);
    }

    public function test_failure_is_recorded_when_external_api_returns_error(): void
    {
        Http::fake([
            'api.example.test/api/billing/users/ext-123/quota' => Http::response(['error' => 'server down'], 500),
        ]);

        $user = $this->makeUserWithExternalId('ext-123');
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'meta' => ['quantity' => 5],
        ]);

        $this->service()->fulfill($transaction);

        $fresh = $transaction->fresh();
        $this->assertNull($fresh->fulfilled_at);
        $this->assertSame(1, $fresh->fulfillment_attempts);
        $this->assertStringContainsString('status 500', (string) $fresh->fulfillment_error);

        $this->assertSame(1, BillingTransactionLog::query()
            ->where('billing_transaction_id', $transaction->id)
            ->where('action', 'fulfillment.failed')
            ->count());
    }

    public function test_failure_recorded_when_external_api_key_missing(): void
    {
        config(['services.external_api.key' => '']);
        Http::fake();

        $user = $this->makeUserWithExternalId();
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
        ]);

        $this->service()->fulfill($transaction);

        Http::assertNothingSent();
        $fresh = $transaction->fresh();
        $this->assertNull($fresh->fulfilled_at);
        $this->assertStringContainsString('API key tidak terkonfigurasi', (string) $fresh->fulfillment_error);
    }

    public function test_failure_recorded_when_user_has_no_external_id(): void
    {
        Http::fake();

        $user = User::factory()->create(['external_id' => null]);
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
        ]);

        $this->service()->fulfill($transaction);

        Http::assertNothingSent();
        $this->assertStringContainsString('External ID user tidak tersedia', (string) $transaction->fresh()->fulfillment_error);
    }

    public function test_callback_paid_triggers_fulfillment_end_to_end(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);
        Http::fake([
            'api.example.test/api/billing/users/ext-321/quota' => Http::response(['ok' => true], 200),
        ]);

        $user = $this->makeUserWithExternalId('ext-321');
        $transaction = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 30_000,
            'meta' => ['quantity' => 3, 'unit_price' => 10_000],
        ]);

        $response = $this->postJson(route('billing.payment.callback'), [
            'reference' => $transaction->reference,
            'status' => 'paid',
            'gateway_payment_id' => 'gw_abc_001',
        ], [
            'X-Billing-Token' => 'gateway-secret',
        ]);

        $response->assertOk();

        Http::assertSent(fn ($request): bool => str_contains($request->url(), '/billing/users/ext-321/quota'));

        $this->assertNotNull($transaction->fresh()->fulfilled_at);
    }
}

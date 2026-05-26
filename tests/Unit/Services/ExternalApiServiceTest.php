<?php

namespace Tests\Unit\Services;

use App\Services\ExternalApiService;
use Tests\TestCase;

class ExternalApiServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.external_api.url' => 'https://api.example.test/api',
            'services.external_api.key' => 'test-api-key',
            'services.external_api.quota_fulfillment_path' => 'billing/users/{id}/quota',
        ]);
    }

    private function service(): ExternalApiService
    {
        return $this->app->make(ExternalApiService::class);
    }

    public function test_build_increment_user_quota_request_payload_contains_only_add_to_quota_by_default(): void
    {
        $built = $this->service()->buildIncrementUserQuotaRequest('ext-123', 5);

        $this->assertSame('PATCH', $built['method']);
        $this->assertSame('billing/users/ext-123/quota', $built['path']);
        $this->assertSame(['add_to_quota' => 5], $built['payload']);
    }

    public function test_build_increment_user_quota_request_includes_billing_transaction_id_and_imei_when_provided(): void
    {
        $built = $this->service()->buildIncrementUserQuotaRequest('ext-123', -1, 12345, 'ABC123456');

        $this->assertSame('billing/users/ext-123/quota', $built['path']);
        $this->assertSame([
            'add_to_quota' => -1,
            'billing_transaction_id' => 12345,
            'imei' => 'ABC123456',
        ], $built['payload']);
    }

    public function test_build_increment_user_quota_request_omits_imei_when_empty_string(): void
    {
        $built = $this->service()->buildIncrementUserQuotaRequest('ext-123', -1, 99, '');

        $this->assertArrayNotHasKey('imei', $built['payload']);
        $this->assertSame([
            'add_to_quota' => -1,
            'billing_transaction_id' => 99,
        ], $built['payload']);
    }

    public function test_build_increment_user_quota_request_can_include_only_billing_transaction_id(): void
    {
        $built = $this->service()->buildIncrementUserQuotaRequest('ext-123', -1, 12345);

        $this->assertArrayNotHasKey('imei', $built['payload']);
        $this->assertSame([
            'add_to_quota' => -1,
            'billing_transaction_id' => 12345,
        ], $built['payload']);
    }

    public function test_build_increment_user_quota_request_can_include_only_imei(): void
    {
        $built = $this->service()->buildIncrementUserQuotaRequest('ext-123', -1, null, 'IMEI-XYZ');

        $this->assertArrayNotHasKey('billing_transaction_id', $built['payload']);
        $this->assertSame([
            'add_to_quota' => -1,
            'imei' => 'IMEI-XYZ',
        ], $built['payload']);
    }
}

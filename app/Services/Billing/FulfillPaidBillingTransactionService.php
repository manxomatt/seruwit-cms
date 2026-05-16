<?php

namespace App\Services\Billing;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Services\ExternalApiService;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Throwable;

class FulfillPaidBillingTransactionService
{
    public function __construct(
        private readonly ExternalApiService $externalApiService,
        private readonly BillingActivityLogger $activityLogger,
    ) {}

    /**
     * Push the paid transaction to the external API based on its type.
     *
     * Idempotent: a transaction that was already fulfilled is left untouched.
     * Failures are recorded on the transaction and logged but do NOT throw
     * so the gateway callback can still respond 200 (we'll retry separately).
     */
    public function fulfill(BillingTransaction $transaction, ?Request $request = null): void
    {
        if ($transaction->status !== BillingTransactionStatus::Paid) {
            return;
        }

        if ($transaction->fulfilled_at !== null) {
            $this->activityLogger->log(
                $transaction,
                'fulfillment.skipped',
                'Fulfillment dilewati: transaksi sudah pernah di-fulfill.',
                ['fulfilled_at' => $transaction->fulfilled_at->toIso8601String()],
                $request,
            );

            return;
        }

        if (! $this->externalApiService->hasApiKey()) {
            $this->recordFailure(
                $transaction,
                'External API key tidak terkonfigurasi; fulfillment dilewati.',
                $request,
            );

            return;
        }

        $user = $transaction->user()->first();
        $externalId = $user?->external_id;

        if ($externalId === null || $externalId === '') {
            $this->recordFailure(
                $transaction,
                'External ID user tidak tersedia; fulfillment tidak dapat dijalankan.',
                $request,
            );

            return;
        }

        $built = $this->buildOutgoingRequest($transaction, $externalId);

        if ($built === null) {
            $this->recordFailure(
                $transaction,
                'IMEI device tidak ditemukan pada metadata transaksi.',
                $request,
            );

            return;
        }

        $this->persistOutgoingRequest($transaction, $built);

        try {
            $response = match ($transaction->type) {
                BillingTransactionType::QuotaPurchase => $this->externalApiService->incrementUserQuota(
                    $externalId,
                    $this->quotaQuantity($transaction),
                ),
                BillingTransactionType::DeviceExtension => $this->externalApiService->extendDeviceExpiry(
                    $externalId,
                    (string) $this->deviceImei($transaction),
                ),
            };
        } catch (Throwable $e) {
            $this->recordFailure(
                $transaction,
                'Gagal menghubungi external API: '.$e->getMessage(),
                $request,
            );

            return;
        }

        if (! $response->successful()) {
            $this->recordFailure(
                $transaction,
                sprintf('External API merespon status %d.', $response->status()),
                $request,
                $response,
            );

            return;
        }

        $transaction->update([
            'fulfilled_at' => now(),
            'fulfillment_attempts' => $transaction->fulfillment_attempts + 1,
            'fulfillment_error' => null,
            'fulfillment_response' => $this->snippet($response->body()),
        ]);

        $this->activityLogger->log(
            $transaction->fresh(),
            'fulfillment.success',
            'Fulfillment ke external API berhasil dieksekusi.',
            [
                'type' => $transaction->type->value,
                'external_id' => (string) $externalId,
                'status_code' => $response->status(),
                'method' => $built['method'],
                'path' => $built['path'],
                'payload' => $built['payload'],
            ],
            $request,
        );
    }

    /**
     * Resolve the outgoing API request (method, path, payload) for the given
     * paid transaction so we can persist & log what we sent.
     *
     * Returns null when a precondition fails (e.g. IMEI missing for device extension).
     *
     * @return array{method: 'PATCH', path: string, payload: array<string, mixed>}|null
     */
    private function buildOutgoingRequest(BillingTransaction $transaction, string|int $externalId): ?array
    {
        return match ($transaction->type) {
            BillingTransactionType::QuotaPurchase => $this->externalApiService->buildIncrementUserQuotaRequest(
                $externalId,
                $this->quotaQuantity($transaction),
            ),
            BillingTransactionType::DeviceExtension => $this->deviceImei($transaction) === null
                ? null
                : $this->externalApiService->buildExtendDeviceExpiryRequest(
                    $externalId,
                    (string) $this->deviceImei($transaction),
                ),
        };
    }

    /**
     * @param  array{method: string, path: string, payload: array<string, mixed>}  $built
     */
    private function persistOutgoingRequest(BillingTransaction $transaction, array $built): void
    {
        $transaction->update([
            'fulfillment_endpoint' => $built['path'],
            'fulfillment_method' => $built['method'],
            'fulfillment_request' => $built['payload'],
        ]);
    }

    private function quotaQuantity(BillingTransaction $transaction): int
    {
        $meta = $transaction->meta ?? [];

        return (int) ($meta['quantity'] ?? 0);
    }

    private function deviceImei(BillingTransaction $transaction): ?string
    {
        $meta = $transaction->meta ?? [];
        $imei = $meta['imei'] ?? $meta['device_identifier'] ?? null;

        if (! is_string($imei) || trim($imei) === '') {
            return null;
        }

        return trim($imei);
    }

    private function recordFailure(
        BillingTransaction $transaction,
        string $message,
        ?Request $request,
        ?Response $response = null,
    ): void {
        $transaction->update([
            'fulfillment_attempts' => $transaction->fulfillment_attempts + 1,
            'fulfillment_error' => $message,
            'fulfillment_response' => $response !== null ? $this->snippet($response->body()) : null,
        ]);

        $this->activityLogger->log(
            $transaction->fresh(),
            'fulfillment.failed',
            $message,
            [
                'type' => $transaction->type->value,
                'attempts' => $transaction->fulfillment_attempts + 1,
                'status_code' => $response?->status(),
            ],
            $request,
        );
    }

    private function snippet(string $body): string
    {
        return mb_substr($body, 0, 2000);
    }
}

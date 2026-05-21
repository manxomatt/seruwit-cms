<?php

namespace App\Services\Billing;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\User;
use App\Services\ExternalApiService;
use App\Services\Referral\BillingPaidReferralCommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class BillingTransactionService
{
    public function __construct(
        private readonly BillingActivityLogger $activityLogger,
        private readonly BillingPaidReferralCommissionService $billingPaidReferralCommissionService,
        private readonly FulfillPaidBillingTransactionService $fulfillPaidBillingTransactionService,
        private readonly ExternalApiService $externalApiService,
    ) {}

    /**
     * @param  array{quantity: int, unit_price: int, total: int}  $checkout
     */
    public function createQuotaPurchase(User $user, array $checkout): BillingTransaction
    {
        $transaction = DB::transaction(function () use ($user, $checkout): BillingTransaction {
            $transaction = BillingTransaction::query()->create([
                'user_id' => $user->id,
                'type' => BillingTransactionType::QuotaPurchase,
                'status' => BillingTransactionStatus::AwaitingPayment,
                'amount' => (int) $checkout['total'],
                'currency' => 'IDR',
                'meta' => [
                    'quantity' => (int) $checkout['quantity'],
                    'unit_price' => (int) $checkout['unit_price'],
                ],
                'gateway_provider' => config('billing.default_gateway'),
            ]);

            return $transaction;
        });

        $this->activityLogger->log(
            $transaction,
            'transaction.created',
            'Transaksi pembelian kuota dibuat (menunggu pembayaran gateway).',
            [
                'type' => $transaction->type->value,
                'amount' => $transaction->amount,
                'quantity' => $checkout['quantity'],
            ],
        );

        return $transaction;
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    public function createDeviceExtension(User $user, int $amount, array $meta = []): BillingTransaction
    {
        $transaction = DB::transaction(function () use ($user, $amount, $meta): BillingTransaction {
            return BillingTransaction::query()->create([
                'user_id' => $user->id,
                'type' => BillingTransactionType::DeviceExtension,
                'status' => BillingTransactionStatus::AwaitingPayment,
                'amount' => $amount,
                'currency' => 'IDR',
                'meta' => $meta,
                'gateway_provider' => config('billing.default_gateway'),
            ]);
        });

        $this->activityLogger->log(
            $transaction,
            'transaction.created',
            'Transaksi perpanjangan masa aktif perangkat dibuat (menunggu pembayaran gateway).',
            [
                'type' => $transaction->type->value,
                'amount' => $transaction->amount,
            ],
        );

        return $transaction;
    }

    /**
     * Manager flow: extend a device's expiry using one of the manager's
     * available object slots instead of paying through the gateway.
     *
     * Creates a fully paid {@see BillingTransaction} with amount=0 and
     * `payment_method=quota` in its meta, fulfills the device extension
     * against the external API, then decrements the manager's quota by 1.
     *
     * @param  array<string, mixed>  $meta
     */
    public function createDeviceExtensionViaQuota(User $user, array $meta = []): BillingTransaction
    {
        $transaction = DB::transaction(function () use ($user, $meta): BillingTransaction {
            return BillingTransaction::query()->create([
                'user_id' => $user->id,
                'type' => BillingTransactionType::DeviceExtension,
                'status' => BillingTransactionStatus::Paid,
                'amount' => 0,
                'currency' => 'IDR',
                'meta' => array_merge($meta, ['payment_method' => 'quota']),
                'gateway_provider' => null,
                'paid_at' => now(),
            ]);
        });

        $this->activityLogger->log(
            $transaction,
            'transaction.created',
            'Transaksi perpanjangan masa aktif perangkat dibuat (dibayar dengan kuota manager).',
            [
                'type' => $transaction->type->value,
                'amount' => $transaction->amount,
                'payment_method' => 'quota',
            ],
        );

        $this->fulfillPaidBillingTransactionService->fulfill($transaction);

        $fresh = $transaction->fresh();

        if ($fresh !== null && $fresh->fulfilled_at !== null) {
            $this->decrementManagerQuota($fresh);
        }

        return $fresh ?? $transaction;
    }

    private function decrementManagerQuota(BillingTransaction $transaction): void
    {
        $externalId = $transaction->user()->first()?->external_id;

        if ($externalId === null || $externalId === '') {
            $this->activityLogger->log(
                $transaction,
                'quota.decrement_failed',
                'Pengurangan kuota dilewati: external ID user tidak tersedia.',
            );

            return;
        }

        try {
            $response = $this->externalApiService->incrementUserQuota($externalId, -1);
        } catch (Throwable $e) {
            $this->activityLogger->log(
                $transaction,
                'quota.decrement_failed',
                'Gagal menghubungi external API saat memotong kuota: '.$e->getMessage(),
            );

            return;
        }

        if (! $response->successful()) {
            $this->activityLogger->log(
                $transaction,
                'quota.decrement_failed',
                sprintf('External API merespon status %d saat memotong kuota.', $response->status()),
                ['status_code' => $response->status()],
            );

            return;
        }

        $this->activityLogger->log(
            $transaction,
            'quota.decremented',
            'Kuota manager berhasil dipotong 1 unit untuk perpanjangan ini.',
            ['add_to_quota' => -1],
        );
    }

    /**
     * @param  array<string, mixed>  $rawPayload
     */
    public function applyGatewayPaymentResult(
        string $reference,
        string $status,
        ?string $gatewayPaymentId,
        array $rawPayload,
        ?Request $request = null,
    ): BillingTransaction {
        return DB::transaction(function () use ($reference, $status, $gatewayPaymentId, $rawPayload, $request): BillingTransaction {
            $transaction = BillingTransaction::query()
                ->where('reference', $reference)
                ->lockForUpdate()
                ->firstOrFail();

            $this->activityLogger->log(
                $transaction,
                'payment.callback_received',
                'Callback payment gateway diterima.',
                [
                    'declared_status' => $status,
                    'gateway_payment_id' => $gatewayPaymentId,
                ],
                $request,
            );

            if ($transaction->status === BillingTransactionStatus::Paid) {
                $this->activityLogger->log(
                    $transaction,
                    'payment.callback_duplicate',
                    'Callback diabaikan: transaksi sudah berstatus dibayar.',
                    ['declared_status' => $status],
                    $request,
                );

                return $transaction;
            }

            if ($status === 'paid') {
                $transaction->update([
                    'status' => BillingTransactionStatus::Paid,
                    'gateway_payment_id' => $gatewayPaymentId,
                    'paid_at' => now(),
                    'failed_at' => null,
                    'failure_message' => null,
                ]);

                $fresh = $transaction->fresh();
                $this->billingPaidReferralCommissionService->creditFromPaidBilling($fresh);

                $this->activityLogger->log(
                    $fresh,
                    'payment.paid',
                    'Pembayaran berhasil dicatat.',
                    ['gateway_payment_id' => $gatewayPaymentId, 'payload_keys' => array_keys($rawPayload)],
                    $request,
                );

                $this->fulfillPaidBillingTransactionService->fulfill($fresh, $request);

                return $fresh->fresh();
            }

            $transaction->update([
                'status' => BillingTransactionStatus::Failed,
                'failed_at' => now(),
                'failure_message' => 'Gateway melaporkan kegagalan pembayaran.',
                'gateway_payment_id' => $gatewayPaymentId,
            ]);

            $failed = $transaction->fresh();

            $this->activityLogger->log(
                $failed,
                'payment.failed',
                'Pembayaran gagal menurut callback gateway.',
                ['gateway_payment_id' => $gatewayPaymentId, 'payload_keys' => array_keys($rawPayload)],
                $request,
            );

            return $failed;
        });
    }
}

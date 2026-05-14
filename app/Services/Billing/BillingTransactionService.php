<?php

namespace App\Services\Billing;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingTransactionService
{
    public function __construct(private readonly BillingActivityLogger $activityLogger) {}

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
     * @param  array<string, mixed>  $rawPayload
     */
    public function applyGatewayPaymentResult(
        string $reference,
        string $status,
        ?string $gatewayPaymentId,
        array $rawPayload,
        ?Request $request = null,
    ): BillingTransaction {
        $transaction = BillingTransaction::query()->where('reference', $reference)->firstOrFail();

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

            $this->activityLogger->log(
                $transaction,
                'payment.paid',
                'Pembayaran berhasil dicatat.',
                ['gateway_payment_id' => $gatewayPaymentId, 'payload_keys' => array_keys($rawPayload)],
                $request,
            );

            return $transaction->fresh();
        }

        $transaction->update([
            'status' => BillingTransactionStatus::Failed,
            'failed_at' => now(),
            'failure_message' => 'Gateway melaporkan kegagalan pembayaran.',
            'gateway_payment_id' => $gatewayPaymentId,
        ]);

        $this->activityLogger->log(
            $transaction,
            'payment.failed',
            'Pembayaran gagal menurut callback gateway.',
            ['gateway_payment_id' => $gatewayPaymentId, 'payload_keys' => array_keys($rawPayload)],
            $request,
        );

        return $transaction->fresh();
    }
}

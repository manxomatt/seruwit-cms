<?php

namespace App\Http\Controllers\External;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingTransactionHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $transactions = BillingTransaction::query()
            ->where('user_id', $request->user()->id)
            ->latest('created_at')
            ->paginate(15)
            ->through(fn (BillingTransaction $transaction): array => [
                'id' => $transaction->id,
                'reference' => $transaction->reference,
                'invoice_number' => $transaction->invoice_number,
                'type' => $transaction->type->value,
                'type_label' => $this->typeLabel($transaction->type),
                'status' => $transaction->status->value,
                'status_label' => $this->statusLabel($transaction->status),
                'amount' => $transaction->amount,
                'currency' => $transaction->currency,
                'gateway_provider' => $transaction->gateway_provider,
                'gateway_payment_id' => $transaction->gateway_payment_id,
                'paid_at' => $transaction->paid_at?->toIso8601String(),
                'failed_at' => $transaction->failed_at?->toIso8601String(),
                'created_at' => $transaction->created_at?->toIso8601String(),
                'invoice_penagihan_url' => in_array($transaction->status, [
                    BillingTransactionStatus::AwaitingPayment,
                    BillingTransactionStatus::Paid,
                ], true)
                    ? route('billing.invoices.download', ['billingTransaction' => $transaction, 'type' => 'penagihan'])
                    : null,
                'invoice_lunas_url' => $transaction->status === BillingTransactionStatus::Paid
                    ? route('billing.invoices.download', ['billingTransaction' => $transaction, 'type' => 'lunas'])
                    : null,
            ]);

        return Inertia::render('External/Billing/TransactionHistory', [
            'transactions' => $transactions,
        ]);
    }

    private function typeLabel(BillingTransactionType $type): string
    {
        return match ($type) {
            BillingTransactionType::QuotaPurchase => 'Pembelian kuota',
            BillingTransactionType::DeviceExtension => 'Perpanjangan perangkat',
        };
    }

    private function statusLabel(BillingTransactionStatus $status): string
    {
        return match ($status) {
            BillingTransactionStatus::AwaitingPayment => 'Menunggu pembayaran',
            BillingTransactionStatus::Paid => 'Lunas',
            BillingTransactionStatus::Failed => 'Gagal',
            BillingTransactionStatus::Cancelled => 'Dibatalkan',
        };
    }
}

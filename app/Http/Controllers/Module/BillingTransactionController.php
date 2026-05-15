<?php

namespace App\Http\Controllers\Module;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = BillingTransaction::query()
            ->with('user:id,name,username,email,external_id')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->when($request->query('search'), function ($q, $search): void {
                $q->where(function ($inner) use ($search): void {
                    $inner->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                        );
                });
            })
            ->when($request->query('date_from'), fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->query('date_to'), fn ($q, $to) => $q->whereDate('created_at', '<=', $to));

        $transactions = $query->clone()
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (BillingTransaction $transaction): array => $this->transformRow($transaction));

        $stats = $this->buildStats();

        return Inertia::render('Module/BillingTransactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
                'type' => $request->query('type'),
                'date_from' => $request->query('date_from'),
                'date_to' => $request->query('date_to'),
            ],
            'stats' => $stats,
            'statusOptions' => $this->statusOptions(),
            'typeOptions' => $this->typeOptions(),
        ]);
    }

    public function show(BillingTransaction $billingTransaction): Response
    {
        $billingTransaction->load([
            'user:id,name,username,email,external_id',
            'logs' => fn ($q) => $q->latest('created_at'),
        ]);

        return Inertia::render('Module/BillingTransactions/Show', [
            'transaction' => array_merge($this->transformRow($billingTransaction), [
                'meta' => $billingTransaction->meta,
                'logs' => $billingTransaction->logs->map(fn ($log): array => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'message' => $log->message,
                    'context' => $log->context,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at?->toIso8601String(),
                ])->toArray(),
            ]),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformRow(BillingTransaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'reference' => $transaction->reference,
            'type' => $transaction->type->value,
            'type_label' => $this->typeLabel($transaction->type),
            'status' => $transaction->status->value,
            'status_label' => $this->statusLabel($transaction->status),
            'amount' => (int) $transaction->amount,
            'currency' => $transaction->currency,
            'gateway_provider' => $transaction->gateway_provider,
            'gateway_payment_id' => $transaction->gateway_payment_id,
            'failure_message' => $transaction->failure_message,
            'paid_at' => $transaction->paid_at?->toIso8601String(),
            'failed_at' => $transaction->failed_at?->toIso8601String(),
            'created_at' => $transaction->created_at?->toIso8601String(),
            'user' => $transaction->user ? [
                'id' => $transaction->user->id,
                'name' => $transaction->user->name,
                'username' => $transaction->user->username,
                'email' => $transaction->user->email,
                'external_id' => $transaction->user->external_id,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildStats(): array
    {
        $base = BillingTransaction::query();

        return [
            'total_count' => (int) (clone $base)->count(),
            'paid_count' => (int) (clone $base)->where('status', BillingTransactionStatus::Paid)->count(),
            'awaiting_count' => (int) (clone $base)->where('status', BillingTransactionStatus::AwaitingPayment)->count(),
            'failed_count' => (int) (clone $base)->where('status', BillingTransactionStatus::Failed)->count(),
            'paid_revenue' => (int) (clone $base)->where('status', BillingTransactionStatus::Paid)->sum('amount'),
            'awaiting_amount' => (int) (clone $base)->where('status', BillingTransactionStatus::AwaitingPayment)->sum('amount'),
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return [
            ['value' => BillingTransactionStatus::AwaitingPayment->value, 'label' => $this->statusLabel(BillingTransactionStatus::AwaitingPayment)],
            ['value' => BillingTransactionStatus::Paid->value, 'label' => $this->statusLabel(BillingTransactionStatus::Paid)],
            ['value' => BillingTransactionStatus::Failed->value, 'label' => $this->statusLabel(BillingTransactionStatus::Failed)],
            ['value' => BillingTransactionStatus::Cancelled->value, 'label' => $this->statusLabel(BillingTransactionStatus::Cancelled)],
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function typeOptions(): array
    {
        return [
            ['value' => BillingTransactionType::QuotaPurchase->value, 'label' => $this->typeLabel(BillingTransactionType::QuotaPurchase)],
            ['value' => BillingTransactionType::DeviceExtension->value, 'label' => $this->typeLabel(BillingTransactionType::DeviceExtension)],
        ];
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

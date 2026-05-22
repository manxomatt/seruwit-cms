<?php

namespace App\Services\Billing;

use App\Models\BillingTransaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InvoiceNumberGenerator
{
    /**
     * Assigns and persists a human-readable invoice number on the transaction
     * if it does not have one yet. Format: INV-YYYYMM-{0001+}.
     *
     * The next sequence is derived under a transaction so concurrent paid
     * callbacks for the same month do not produce duplicates; the unique
     * constraint on the column is the final guard.
     */
    public function assign(BillingTransaction $transaction, ?Carbon $issuedAt = null): string
    {
        if (filled($transaction->invoice_number)) {
            return (string) $transaction->invoice_number;
        }

        $issuedAt ??= now();
        $prefix = sprintf('INV-%s-', $issuedAt->format('Ym'));

        return DB::transaction(function () use ($transaction, $prefix): string {
            $lastNumber = BillingTransaction::query()
                ->where('invoice_number', 'like', $prefix.'%')
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $nextSequence = $lastNumber === null
                ? 1
                : ((int) substr((string) $lastNumber, strlen($prefix))) + 1;

            $invoiceNumber = $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

            $transaction->forceFill(['invoice_number' => $invoiceNumber])->save();

            return $invoiceNumber;
        });
    }
}

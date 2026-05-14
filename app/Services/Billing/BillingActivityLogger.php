<?php

namespace App\Services\Billing;

use App\Models\BillingTransaction;
use App\Models\BillingTransactionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingActivityLogger
{
    /**
     * Persist a billing transaction log row and mirror to the billing log channel.
     *
     * @param  array<string, mixed>  $context
     */
    public function log(
        BillingTransaction $transaction,
        string $action,
        string $message,
        array $context = [],
        ?Request $request = null,
    ): void {
        BillingTransactionLog::query()->create([
            'billing_transaction_id' => $transaction->id,
            'action' => $action,
            'message' => $message,
            'context' => $context === [] ? null : $context,
            'ip_address' => $request?->ip(),
        ]);

        Log::channel('billing')->info($message, array_merge([
            'billing_transaction_id' => $transaction->id,
            'reference' => $transaction->reference,
            'action' => $action,
        ], $context));
    }
}

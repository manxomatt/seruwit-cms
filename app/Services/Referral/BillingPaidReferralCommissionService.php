<?php

namespace App\Services\Referral;

use App\Enums\BillingTransactionStatus;
use App\Models\AccountManager;
use App\Models\BillingTransaction;
use App\Models\Commission;
use App\Models\ReferralRelation;
use App\Models\WalletTransaction;

class BillingPaidReferralCommissionService
{
    public const COMMISSION_TYPE_BILLING_REFERRAL = 'billing_referral';

    /**
     * When a billing transaction is paid, credit the referred user's account manager
     * with a percentage of the transaction amount if an approved referral exists.
     */
    public function creditFromPaidBilling(BillingTransaction $billingTransaction): void
    {
        if ($billingTransaction->status !== BillingTransactionStatus::Paid) {
            return;
        }

        if (Commission::query()
            ->where('transaction_id', $billingTransaction->reference)
            ->where('commission_type', self::COMMISSION_TYPE_BILLING_REFERRAL)
            ->exists()) {
            return;
        }

        $relation = ReferralRelation::query()
            ->where('user_id', $billingTransaction->user_id)
            ->where('status', ReferralRelation::STATUS_APPROVED)
            ->orderByDesc('id')
            ->first();

        if ($relation === null) {
            return;
        }

        $rate = (float) config('billing.referral_commission_rate', 0.10);
        $commissionAmount = round(((float) $billingTransaction->amount) * $rate, 2);

        if ($commissionAmount <= 0) {
            return;
        }

        $accountManager = AccountManager::query()
            ->whereKey($relation->account_manager_id)
            ->lockForUpdate()
            ->firstOrFail();

        $balanceBefore = (float) $accountManager->wallet_balance;
        $balanceAfter = round($balanceBefore + $commissionAmount, 2);

        $commission = Commission::query()->create([
            'account_manager_id' => $accountManager->id,
            'transaction_id' => $billingTransaction->reference,
            'commission_type' => self::COMMISSION_TYPE_BILLING_REFERRAL,
            'commission_value' => round($rate * 100, 2),
            'commission_amount' => $commissionAmount,
            'status' => 'paid',
        ]);

        $accountManager->update([
            'wallet_balance' => $balanceAfter,
        ]);

        WalletTransaction::query()->create([
            'account_manager_id' => $accountManager->id,
            'commission_id' => $commission->id,
            'type' => 'credit',
            'amount' => $commissionAmount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => sprintf(
                'Komisi referral (%.2f%%) dari pembayaran billing %s (pengguna #%d).',
                $rate * 100,
                $billingTransaction->reference,
                $billingTransaction->user_id,
            ),
        ]);
    }
}

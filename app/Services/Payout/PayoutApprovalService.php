<?php

namespace App\Services\Payout;

use App\Models\AccountManager;
use App\Models\CommissionPayout;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayoutApprovalService
{
    /**
     * Approve a pending payout. The wallet balance was already debited when the
     * payout request was created, so approving only updates the status.
     *
     * @throws ValidationException when payout is not in pending status
     */
    public function approve(CommissionPayout $payout, User $approvedBy): void
    {
        if ($payout->status !== CommissionPayout::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => 'Hanya permintaan dengan status menunggu yang dapat disetujui.',
            ]);
        }

        $payout->update([
            'status' => CommissionPayout::STATUS_APPROVED,
            'processed_by' => $approvedBy->id,
            'processed_at' => now(),
        ]);
    }

    /**
     * Reject a pending or approved payout. Refunds the held amount back to the
     * account manager's wallet and records a credit wallet transaction.
     *
     * @throws ValidationException when payout is already paid or rejected
     */
    public function reject(CommissionPayout $payout, User $rejectedBy, string $reason): void
    {
        if (! in_array($payout->status, [CommissionPayout::STATUS_PENDING, CommissionPayout::STATUS_APPROVED], true)) {
            throw ValidationException::withMessages([
                'status' => 'Permintaan ini tidak dapat ditolak.',
            ]);
        }

        DB::transaction(function () use ($payout, $rejectedBy, $reason): void {
            /** @var AccountManager $accountManager */
            $accountManager = AccountManager::query()
                ->whereKey($payout->account_manager_id)
                ->lockForUpdate()
                ->firstOrFail();

            $balanceBefore = (float) $accountManager->wallet_balance;
            $amount = (float) $payout->amount;
            $balanceAfter = round($balanceBefore + $amount, 2);

            $payout->update([
                'status' => CommissionPayout::STATUS_REJECTED,
                'rejection_reason' => $reason,
                'processed_by' => $rejectedBy->id,
                'processed_at' => now(),
            ]);

            $accountManager->update([
                'wallet_balance' => $balanceAfter,
            ]);

            WalletTransaction::query()->create([
                'account_manager_id' => $accountManager->id,
                'commission_id' => null,
                'type' => 'credit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'description' => sprintf(
                    'Pengembalian dana karena penolakan pencairan %s.',
                    $payout->reference,
                ),
            ]);
        });
    }

    /**
     * Mark an approved payout as paid. The wallet balance was already debited
     * earlier, so marking as paid only updates the status.
     *
     * @throws ValidationException when payout is not in approved status
     */
    public function markAsPaid(CommissionPayout $payout, User $processedBy): void
    {
        if ($payout->status !== CommissionPayout::STATUS_APPROVED) {
            throw ValidationException::withMessages([
                'status' => 'Hanya permintaan yang sudah disetujui yang dapat ditandai sebagai dibayarkan.',
            ]);
        }

        $payout->update([
            'status' => CommissionPayout::STATUS_PAID,
            'processed_by' => $processedBy->id,
            'processed_at' => now(),
        ]);
    }
}

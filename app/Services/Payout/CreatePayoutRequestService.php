<?php

namespace App\Services\Payout;

use App\Models\AccountManager;
use App\Models\CommissionPayout;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreatePayoutRequestService
{
    /**
     * Create a payout request and hold the requested amount from the
     * account manager's wallet balance immediately.
     *
     * @param  array{amount: float, bank_name: string, bank_account_number: string, bank_account_name: string, notes?: ?string}  $data
     */
    public function handle(AccountManager $accountManager, array $data): CommissionPayout
    {
        $amount = round((float) $data['amount'], 2);

        return DB::transaction(function () use ($accountManager, $data, $amount): CommissionPayout {
            /** @var AccountManager $locked */
            $locked = AccountManager::query()
                ->whereKey($accountManager->id)
                ->lockForUpdate()
                ->firstOrFail();

            $balanceBefore = (float) $locked->wallet_balance;

            if ($balanceBefore < $amount) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo wallet tidak mencukupi untuk permintaan pencairan ini.',
                ]);
            }

            $balanceAfter = round($balanceBefore - $amount, 2);

            $payout = CommissionPayout::query()->create([
                'account_manager_id' => $locked->id,
                'amount' => $amount,
                'status' => CommissionPayout::STATUS_PENDING,
                'bank_name' => $data['bank_name'],
                'bank_account_number' => $data['bank_account_number'],
                'bank_account_name' => $data['bank_account_name'],
                'notes' => $data['notes'] ?? null,
            ]);

            $locked->update([
                'wallet_balance' => $balanceAfter,
            ]);

            WalletTransaction::query()->create([
                'account_manager_id' => $locked->id,
                'commission_id' => null,
                'type' => 'debit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'description' => sprintf(
                    'Permintaan pencairan komisi %s ke %s a/n %s.',
                    $payout->reference,
                    $payout->bank_name,
                    $payout->bank_account_name,
                ),
            ]);

            return $payout;
        });
    }
}

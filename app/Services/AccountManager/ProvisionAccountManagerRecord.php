<?php

namespace App\Services\AccountManager;

use App\Models\AccountManager;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Str;

class ProvisionAccountManagerRecord
{
    /**
     * Ensure an AccountManager record (with referral code and initial wallet
     * transaction) exists for the given user. Idempotent – safe to call multiple
     * times; does nothing if the record already exists.
     */
    public function execute(User $user): AccountManager
    {
        if ($user->accountManager !== null) {
            return $user->accountManager;
        }

        $referralCode = $this->generateReferralCode();

        $accountManager = AccountManager::create([
            'user_id' => $user->id,
            'referral_code' => $referralCode,
            'wallet_balance' => 0,
            'status' => $user->status ?? 'active',
        ]);

        WalletTransaction::create([
            'account_manager_id' => $accountManager->id,
            'commission_id' => null,
            'type' => 'adjustment',
            'amount' => 0,
            'balance_before' => 0,
            'balance_after' => 0,
            'description' => 'Initial Wallet Setup',
        ]);

        return $accountManager;
    }

    private function generateReferralCode(): string
    {
        $year = now()->year;
        $sequence = AccountManager::lockForUpdate()->count() + 1;
        $code = sprintf('REF-AM-%d-%04d', $year, $sequence);

        if (AccountManager::query()->where('referral_code', $code)->exists()) {
            $code = sprintf('REF-AM-%d-%s', $year, strtoupper(Str::random(6)));
        }

        return $code;
    }
}

<?php

namespace App\Services\AccountManager;

use App\Models\AccountManager;
use App\Models\Role;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAccountManagerService
{
    /**
     * Create a new Account Manager with wallet initialization.
     *
     * Wraps the full creation flow in a single DB transaction:
     *   1. Create user record
     *   2. Create user profile
     *   3. Assign account_manager role
     *   4. Generate unique referral code
     *   5. Create account_managers record
     *   6. Insert initial wallet transaction (type = adjustment)
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): AccountManager
    {
        return DB::transaction(function () use ($data): AccountManager {
            $password = $data['password'] ?? Str::password(12);

            $user = User::create([
                'name' => trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? '')),
                'email' => $data['email'],
                'password' => Hash::make($password),
                'status' => $data['status'] ?? 'active',
            ]);

            $user->profile()->create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
            ]);

            $role = Role::query()->where('slug', 'account_manager')->firstOrFail();
            $user->roles()->sync([$role->id]);

            $referralCode = $this->generateReferralCode();
            $initialBalance = (float) ($data['initial_wallet_balance'] ?? 0);

            $accountManager = AccountManager::create([
                'user_id' => $user->id,
                'referral_code' => $referralCode,
                'wallet_balance' => $initialBalance,
                'status' => $data['status'] ?? 'active',
            ]);

            WalletTransaction::create([
                'account_manager_id' => $accountManager->id,
                'commission_id' => null,
                'type' => 'adjustment',
                'amount' => $initialBalance,
                'balance_before' => 0,
                'balance_after' => $initialBalance,
                'description' => 'Initial Wallet Setup',
            ]);

            return $accountManager->load('user.profile');
        });
    }

    /**
     * Generate a unique referral code in the format REF-AM-{YEAR}-{SEQUENCE}.
     *
     * Uses a SELECT FOR UPDATE inside the transaction to prevent race conditions
     * when multiple account managers are created concurrently.
     */
    private function generateReferralCode(): string
    {
        $year = now()->year;

        // Lock existing rows to get a consistent sequence number.
        $sequence = AccountManager::lockForUpdate()->count() + 1;
        $code = sprintf('REF-AM-%d-%04d', $year, $sequence);

        // Extra uniqueness guard – retry with random suffix on collision.
        if (AccountManager::query()->where('referral_code', $code)->exists()) {
            $code = sprintf('REF-AM-%d-%s', $year, strtoupper(Str::random(6)));
        }

        return $code;
    }
}

<?php

namespace App\Services\AccountManager;

use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class RequestDownlineAssignmentService
{
    /**
     * Request to assign an existing local user (external_user or external_manager)
     * as a downline of the given AccountManager.
     *
     * Creates a pending ReferralRelation that requires admin approval.
     * Does not modify the user's login status — they remain active.
     *
     * @throws ValidationException when user already has a pending/approved relation
     */
    public function execute(AccountManager $accountManager, User $user): ReferralRelation
    {
        $exists = ReferralRelation::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [ReferralRelation::STATUS_PENDING, ReferralRelation::STATUS_APPROVED])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'user_id' => 'User ini sudah memiliki Account Manager atau sedang dalam proses pengajuan.',
            ]);
        }

        return ReferralRelation::create([
            'account_manager_id' => $accountManager->id,
            'external_manager_id' => $user->external_id,
            'user_id' => $user->id,
            'referral_code' => $accountManager->referral_code,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);
    }
}

<?php

namespace App\Services\Admin;

use App\Models\ReferralRelation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApproveReferralAssignmentService
{
    /**
     * Approve a pending ReferralRelation.
     *
     * When the related user is currently 'inactive' (i.e. created via skenario 1
     * by an AM and not yet activated), their status is set to 'active' so they
     * can log in for the first time.
     *
     * @throws ValidationException when the relation is not in pending status
     */
    public function approve(ReferralRelation $referralRelation, User $approvedBy): void
    {
        if ($referralRelation->status !== ReferralRelation::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => 'Hanya pengajuan dengan status pending yang dapat disetujui.',
            ]);
        }

        DB::transaction(function () use ($referralRelation, $approvedBy): void {
            $referralRelation->update([
                'status' => ReferralRelation::STATUS_APPROVED,
                'approved_by' => $approvedBy->id,
                'approved_at' => now(),
                'notes' => null,
            ]);

            // Activate user if they were created as inactive (skenario 1).
            $user = $referralRelation->user;
            if ($user !== null && $user->status === 'inactive') {
                $user->update(['status' => 'active']);
            }
        });
    }

    /**
     * Reject a pending ReferralRelation.
     *
     * The user's status is intentionally left unchanged — existing users (skenario 3)
     * remain active; users created by AM (skenario 1) remain inactive.
     *
     * @throws ValidationException when the relation is not in pending status
     */
    public function reject(ReferralRelation $referralRelation, User $rejectedBy, ?string $notes = null): void
    {
        if ($referralRelation->status !== ReferralRelation::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'status' => 'Hanya pengajuan dengan status pending yang dapat ditolak.',
            ]);
        }

        $referralRelation->update([
            'status' => ReferralRelation::STATUS_REJECTED,
            'approved_by' => $rejectedBy->id,
            'approved_at' => now(),
            'notes' => $notes,
        ]);
    }
}

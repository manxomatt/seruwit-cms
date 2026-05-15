<?php

namespace App\Http\Controllers\AccountManager;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommissionHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $accountManager = $user->accountManager;

        if ($accountManager === null) {
            return Inertia::render('AccountManager/CommissionHistory', [
                'commissions' => [
                    'data' => [],
                    'links' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => null,
                    'to' => null,
                    'total' => 0,
                    'per_page' => 15,
                ],
                'stats' => [
                    'total_commission_amount' => 0,
                    'paid_commission_amount' => 0,
                    'pending_commission_amount' => 0,
                    'total_count' => 0,
                ],
                'wallet_balance' => 0,
            ]);
        }

        $commissions = Commission::query()
            ->where('account_manager_id', $accountManager->id)
            ->latest('created_at')
            ->paginate(15)
            ->through(function (Commission $commission): array {
                $billing = BillingTransaction::query()
                    ->where('reference', $commission->transaction_id)
                    ->with('user:id,name,username,email')
                    ->first();

                return [
                    'id' => $commission->id,
                    'transaction_reference' => $commission->transaction_id,
                    'commission_type' => $commission->commission_type,
                    'commission_type_label' => $this->commissionTypeLabel($commission->commission_type),
                    'commission_value' => (float) $commission->commission_value,
                    'commission_amount' => (float) $commission->commission_amount,
                    'status' => $commission->status,
                    'status_label' => $this->statusLabel($commission->status),
                    'created_at' => $commission->created_at?->toIso8601String(),
                    'billing' => $billing ? [
                        'amount' => (int) $billing->amount,
                        'currency' => $billing->currency,
                        'type' => $billing->type->value,
                        'paid_at' => $billing->paid_at?->toIso8601String(),
                    ] : null,
                    'downline' => $billing?->user ? [
                        'id' => $billing->user->id,
                        'name' => $billing->user->name,
                        'username' => $billing->user->username,
                        'email' => $billing->user->email,
                    ] : null,
                ];
            });

        $baseQuery = Commission::query()->where('account_manager_id', $accountManager->id);

        $stats = [
            'total_commission_amount' => (float) (clone $baseQuery)->sum('commission_amount'),
            'paid_commission_amount' => (float) (clone $baseQuery)->where('status', 'paid')->sum('commission_amount'),
            'pending_commission_amount' => (float) (clone $baseQuery)->where('status', 'pending')->sum('commission_amount'),
            'total_count' => (int) (clone $baseQuery)->count(),
        ];

        return Inertia::render('AccountManager/CommissionHistory', [
            'commissions' => $commissions,
            'stats' => $stats,
            'wallet_balance' => (float) $accountManager->wallet_balance,
        ]);
    }

    private function commissionTypeLabel(string $type): string
    {
        return match ($type) {
            'billing_referral' => 'Komisi referral billing',
            default => ucwords(str_replace('_', ' ', $type)),
        };
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'paid' => 'Dibayarkan',
            'pending' => 'Menunggu',
            'cancelled' => 'Dibatalkan',
            default => ucfirst($status),
        };
    }
}

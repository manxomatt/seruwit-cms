<?php

namespace App\Http\Controllers\AccountManager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $primaryRole = $user->getPrimaryRole();
        $accountManager = $user->accountManager()->with([
            'commissions' => fn ($q) => $q->latest()->limit(5),
            'walletTransactions' => fn ($q) => $q->latest()->limit(5),
        ])->first();

        $stats = null;
        if ($accountManager) {
            $stats = [
                'wallet_balance' => $accountManager->wallet_balance,
                'total_referrals' => $accountManager->referralRelations()->count(),
                'total_commissions' => $accountManager->commissions()->count(),
                'pending_commissions' => $accountManager->commissions()->where('status', 'pending')->count(),
                'paid_commissions' => $accountManager->commissions()->where('status', 'paid')->count(),
            ];
        }

        return Inertia::render('AccountManager/Dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'primaryRole' => $primaryRole ? [
                'name' => $primaryRole->name,
                'slug' => $primaryRole->slug,
            ] : null,
            'accountManager' => $accountManager ? [
                'id' => $accountManager->id,
                'referral_code' => $accountManager->referral_code,
                'wallet_balance' => $accountManager->wallet_balance,
                'status' => $accountManager->status,
                'recent_transactions' => $accountManager->walletTransactions->map(fn ($tx) => [
                    'id' => $tx->id,
                    'type' => $tx->type,
                    'amount' => $tx->amount,
                    'balance_after' => $tx->balance_after,
                    'description' => $tx->description,
                    'created_at' => $tx->created_at,
                ])->toArray(),
                'recent_commissions' => $accountManager->commissions->map(fn ($c) => [
                    'id' => $c->id,
                    'commission_type' => $c->commission_type,
                    'commission_amount' => $c->commission_amount,
                    'status' => $c->status,
                    'created_at' => $c->created_at,
                ])->toArray(),
            ] : null,
            'stats' => $stats,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Module;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectPayoutRequest;
use App\Models\CommissionPayout;
use App\Services\Payout\PayoutApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutApprovalController extends Controller
{
    public function __construct(private readonly PayoutApprovalService $approvalService) {}

    public function index(Request $request): Response
    {
        $payouts = CommissionPayout::query()
            ->with(['accountManager.user.profile', 'processedBy:id,name,email'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('search'), function ($query, $search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('accountManager.user', fn ($u) => $u
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                        );
                });
            })
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (CommissionPayout $payout): array => [
                'id' => $payout->id,
                'reference' => $payout->reference,
                'amount' => (float) $payout->amount,
                'status' => $payout->status,
                'status_label' => $this->statusLabel($payout->status),
                'bank_name' => $payout->bank_name,
                'bank_account_number' => $payout->bank_account_number,
                'bank_account_name' => $payout->bank_account_name,
                'notes' => $payout->notes,
                'rejection_reason' => $payout->rejection_reason,
                'processed_at' => $payout->processed_at?->toIso8601String(),
                'created_at' => $payout->created_at?->toIso8601String(),
                'account_manager' => $payout->accountManager ? [
                    'id' => $payout->accountManager->id,
                    'referral_code' => $payout->accountManager->referral_code,
                    'wallet_balance' => (float) $payout->accountManager->wallet_balance,
                    'user' => $payout->accountManager->user ? [
                        'id' => $payout->accountManager->user->id,
                        'name' => $payout->accountManager->user->name,
                        'email' => $payout->accountManager->user->email,
                        'username' => $payout->accountManager->user->username,
                    ] : null,
                ] : null,
                'processed_by' => $payout->processedBy ? [
                    'id' => $payout->processedBy->id,
                    'name' => $payout->processedBy->name,
                    'email' => $payout->processedBy->email,
                ] : null,
            ]);

        $stats = [
            'pending_count' => CommissionPayout::query()->where('status', CommissionPayout::STATUS_PENDING)->count(),
            'approved_count' => CommissionPayout::query()->where('status', CommissionPayout::STATUS_APPROVED)->count(),
            'paid_count' => CommissionPayout::query()->where('status', CommissionPayout::STATUS_PAID)->count(),
            'rejected_count' => CommissionPayout::query()->where('status', CommissionPayout::STATUS_REJECTED)->count(),
            'pending_amount' => (float) CommissionPayout::query()
                ->where('status', CommissionPayout::STATUS_PENDING)
                ->sum('amount'),
        ];

        return Inertia::render('Module/PayoutApprovals/Index', [
            'payouts' => $payouts,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
            ],
            'stats' => $stats,
        ]);
    }

    public function approve(Request $request, CommissionPayout $payout): RedirectResponse
    {
        $this->approvalService->approve($payout, $request->user());

        return back()->with('success', "Pencairan {$payout->reference} telah disetujui.");
    }

    public function reject(RejectPayoutRequest $request, CommissionPayout $payout): RedirectResponse
    {
        $this->approvalService->reject(
            $payout,
            $request->user(),
            $request->validated('rejection_reason'),
        );

        return back()->with('success', "Pencairan {$payout->reference} telah ditolak dan saldo dikembalikan.");
    }

    public function markAsPaid(Request $request, CommissionPayout $payout): RedirectResponse
    {
        $this->approvalService->markAsPaid($payout, $request->user());

        return back()->with('success', "Pencairan {$payout->reference} telah ditandai sebagai dibayarkan.");
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            CommissionPayout::STATUS_PENDING => 'Menunggu verifikasi',
            CommissionPayout::STATUS_APPROVED => 'Disetujui',
            CommissionPayout::STATUS_REJECTED => 'Ditolak',
            CommissionPayout::STATUS_PAID => 'Sudah dibayarkan',
            default => ucfirst($status),
        };
    }
}

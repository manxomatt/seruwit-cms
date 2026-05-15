<?php

namespace App\Http\Controllers\AccountManager;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePayoutRequest;
use App\Models\CommissionPayout;
use App\Services\Payout\CreatePayoutRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function __construct(private readonly CreatePayoutRequestService $createPayoutRequest) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $accountManager = $user->accountManager;

        $payouts = $accountManager
            ? CommissionPayout::query()
                ->where('account_manager_id', $accountManager->id)
                ->latest('created_at')
                ->paginate(10)
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
                ])
            : [
                'data' => [],
                'links' => [],
                'current_page' => 1,
                'last_page' => 1,
                'from' => null,
                'to' => null,
                'total' => 0,
                'per_page' => 10,
            ];

        return Inertia::render('AccountManager/Payouts', [
            'payouts' => $payouts,
            'wallet_balance' => $accountManager ? (float) $accountManager->wallet_balance : 0.0,
            'minimum_amount' => (float) config('billing.payout_minimum_amount', 50_000),
            'has_pending_request' => $accountManager
                ? CommissionPayout::query()
                    ->where('account_manager_id', $accountManager->id)
                    ->pending()
                    ->exists()
                : false,
        ]);
    }

    public function store(StorePayoutRequest $request): RedirectResponse
    {
        $accountManager = $request->user()->accountManager;

        if ($accountManager === null) {
            return redirect()
                ->route('account-manager.payouts.index')
                ->withErrors(['amount' => 'Akun account manager tidak ditemukan.']);
        }

        $this->createPayoutRequest->handle($accountManager, $request->validated());

        return redirect()
            ->route('account-manager.payouts.index')
            ->with('success', 'Permintaan pencairan komisi berhasil diajukan. Mohon tunggu proses verifikasi.');
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

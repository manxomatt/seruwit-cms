<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignDownlineToAmRequest;
use App\Http\Requests\RejectReferralAssignmentRequest;
use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\User;
use App\Services\AccountManager\RequestDownlineAssignmentService;
use App\Services\Admin\ApproveReferralAssignmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralApprovalController extends Controller
{
    public function __construct(
        private readonly ApproveReferralAssignmentService $approvalService,
        private readonly RequestDownlineAssignmentService $requestAssignmentService,
    ) {}

    public function index(Request $request): Response
    {
        $referralRelations = ReferralRelation::query()
            ->with(['user.profile', 'accountManager.user.profile'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('search'), function ($query, $search) {
                $query->whereHas('user', fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                )->orWhereHas('accountManager.user', fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                );
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Module/ReferralApprovals/Index', [
            'referralRelations' => $referralRelations,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
            ],
        ]);
    }

    public function approve(ReferralRelation $referralRelation): RedirectResponse
    {
        $this->approvalService->approve($referralRelation, request()->user());

        return back()->with('success', 'Pengajuan berhasil disetujui.');
    }

    public function reject(RejectReferralAssignmentRequest $request, ReferralRelation $referralRelation): RedirectResponse
    {
        $this->approvalService->reject($referralRelation, $request->user(), $request->validated('notes'));

        return back()->with('success', 'Pengajuan berhasil ditolak.');
    }

    /**
     * Show form to directly assign a user to an AccountManager (admin only, no approval needed).
     */
    public function assignDownline(Request $request, AccountManager $accountManager): Response
    {
        $externalRoleSlugs = ['external_user', 'external_manager'];

        $assignableUsers = User::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('slug', $externalRoleSlugs))
            ->whereDoesntHave('referralRelation', fn ($q) => $q
                ->whereIn('status', [ReferralRelation::STATUS_PENDING, ReferralRelation::STATUS_APPROVED])
            )
            ->when($request->query('search'), fn ($q, $search) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
            )
            ->with('profile')
            ->paginate(15)
            ->withQueryString();

        $accountManager->load('user.profile');

        return Inertia::render('Module/AccountManagers/AssignDownline', [
            'accountManager' => $accountManager,
            'users' => $assignableUsers,
            'filters' => [
                'search' => $request->query('search'),
            ],
        ]);
    }

    /**
     * Directly assign a user to an AccountManager — approved immediately (admin only).
     */
    public function storeDownlineAssignment(AssignDownlineToAmRequest $request, AccountManager $accountManager): RedirectResponse
    {
        $user = User::findOrFail($request->validated('user_id'));

        $relation = $this->requestAssignmentService->execute($accountManager, $user);

        // Admin assign = no approval needed, approve it immediately.
        $this->approvalService->approve($relation, $request->user());

        return redirect()
            ->route('module.account-managers.show', $accountManager)
            ->with('success', 'User berhasil di-assign sebagai downline.');
    }
}

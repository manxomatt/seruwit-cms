<?php

namespace App\Http\Controllers\AccountManager;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestDownlineAssignmentRequest;
use App\Models\ReferralRelation;
use App\Models\User;
use App\Services\AccountManager\RequestDownlineAssignmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DownlineAssignmentController extends Controller
{
    public function __construct(
        private readonly RequestDownlineAssignmentService $requestAssignmentService,
    ) {}

    public function create(Request $request): Response
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

        return Inertia::render('AccountManager/Downlines/Assign', [
            'users' => $assignableUsers,
            'filters' => [
                'search' => $request->query('search'),
            ],
        ]);
    }

    public function store(RequestDownlineAssignmentRequest $request): RedirectResponse
    {
        $accountManager = $request->user()->accountManager;

        if ($accountManager === null || $accountManager->status !== 'active') {
            return redirect()
                ->route('account-manager.downlines.index')
                ->with('error', 'Akun Account Manager tidak aktif.');
        }

        $user = User::findOrFail($request->validated('user_id'));

        $this->requestAssignmentService->execute($accountManager, $user);

        return redirect()
            ->route('account-manager.downlines.index')
            ->with('success', 'Pengajuan assignment berhasil dikirim dan menunggu persetujuan admin.');
    }
}

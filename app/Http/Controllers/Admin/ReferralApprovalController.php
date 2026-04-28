<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminAssignDownlineRequest;
use App\Http\Requests\RejectReferralAssignmentRequest;
use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\Role;
use App\Models\User;
use App\Services\AccountManager\RequestDownlineAssignmentService;
use App\Services\Admin\ApproveReferralAssignmentService;
use App\Services\ExternalApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralApprovalController extends Controller
{
    public function __construct(
        private readonly ApproveReferralAssignmentService $approvalService,
        private readonly RequestDownlineAssignmentService $requestAssignmentService,
        private readonly ExternalApiService $externalApiService,
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
        $response = $this->externalApiService->getUsers(['manager', 'user']);

        if (! $response->successful()) {
            return Inertia::render('Module/AccountManagers/AssignDownline', [
                'accountManager' => $accountManager->load('user.profile'),
                'users' => ['data' => [], 'links' => [], 'from' => null, 'to' => null, 'total' => 0],
                'filters' => ['search' => $request->query('search')],
                'error' => 'Gagal mengambil data user dari sistem eksternal.',
            ]);
        }

        $data = $response->json();
        $externalUsers = $data['users'] ?? [];

        // Get external_ids of users already assigned (pending or approved)
        $assignedExternalIds = ReferralRelation::query()
            ->whereIn('status', [ReferralRelation::STATUS_PENDING, ReferralRelation::STATUS_APPROVED])
            ->pluck('external_manager_id')
            ->filter()
            ->flip()
            ->all();

        $filteredUsers = array_filter($externalUsers, function ($user) use ($request, $assignedExternalIds) {
            $managerId = $user['manager_id'] ?? 0;
            $userId = $user['id'];
            if ($managerId !== 0 && $managerId !== $userId) {
                return false;
            }

            if (isset($assignedExternalIds[$userId])) {
                return false;
            }

            $search = $request->query('search');
            if (! $search) {
                return true;
            }

            $searchLower = strtolower($search);

            return str_contains(strtolower($user['email'] ?? ''), $searchLower)
                || str_contains(strtolower($user['username'] ?? ''), $searchLower);
        });

        $formattedUsers = array_map(fn ($user) => [
            'id' => $user['id'],
            'name' => $user['username'] ?? $user['email'],
            'email' => $user['email'],
            'username' => $user['username'],
            'role' => $user['role'],
            'status' => $user['status'],
            'manager_id' => $user['manager_id'] ?? 0,
        ], $filteredUsers);

        $accountManager->load('user.profile');

        return Inertia::render('Module/AccountManagers/AssignDownline', [
            'accountManager' => $accountManager,
            'users' => [
                'data' => array_values($formattedUsers),
                'links' => [],
                'from' => empty($formattedUsers) ? null : 1,
                'to' => empty($formattedUsers) ? null : count($formattedUsers),
                'total' => count($formattedUsers),
            ],
            'filters' => ['search' => $request->query('search')],
        ]);
    }

    /**
     * Directly assign a user to an AccountManager — approved immediately (admin only).
     */
    public function storeDownlineAssignment(AdminAssignDownlineRequest $request, AccountManager $accountManager): RedirectResponse
    {
        $externalId = $request->validated('user_id');

        $user = User::where('external_id', $externalId)->first();

        if ($user !== null && $user->email_verified_at === null) {
            $user->email_verified_at = now();
            $user->save();
        }

        if ($user === null) {
            $userData = json_decode($request->validated('user_data'), true);

            try {
                $user = User::updateOrCreate(
                    ['email' => $userData['email']],
                    [
                        'name' => $userData['name'] ?? $userData['username'],
                        'username' => $userData['username'] ?? '',
                        'external_id' => $userData['id'],
                        'status' => ($userData['status'] === 'true' || $userData['status'] === true) ? 'active' : 'inactive',
                        'email_verified_at' => now(),
                        'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
                    ]
                );
            } catch (\Throwable $e) {
                return redirect()
                    ->route('module.account-managers.assign-downline', $accountManager)
                    ->with('error', 'Gagal menyimpan data user: '.$e->getMessage());
            }

            $externalUserRole = Role::where('slug', 'external_user')->first();
            if ($externalUserRole && ! $user->hasRole('external_user')) {
                $user->assignRole($externalUserRole);
            }
        }

        try {
            $relation = $this->requestAssignmentService->execute($accountManager, $user);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()
                ->route('module.account-managers.assign-downline', $accountManager)
                ->with('error', collect($e->errors())->flatten()->first());
        }

        // Admin assign = no approval needed, approve it immediately.
        $this->approvalService->approve($relation, $request->user());

        return redirect()
            ->route('module.account-managers.show', $accountManager)
            ->with('success', 'User berhasil di-assign sebagai downline.');
    }
}

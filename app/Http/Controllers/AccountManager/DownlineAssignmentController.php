<?php

namespace App\Http\Controllers\AccountManager;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestDownlineAssignmentRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\AccountManager\RequestDownlineAssignmentService;
use App\Services\ExternalApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DownlineAssignmentController extends Controller
{
    public function __construct(
        private readonly RequestDownlineAssignmentService $requestAssignmentService,
        private readonly ExternalApiService $externalApiService,
    ) {}

    public function create(Request $request): Response
    {
        // Fetch users from external API
        $response = $this->externalApiService->getUsers(['manager', 'user']);

        if (! $response->successful()) {
            return Inertia::render('AccountManager/Downlines/Assign', [
                'users' => [
                    'data' => [],
                    'links' => [],
                    'from' => null,
                    'to' => null,
                    'total' => 0,
                ],
                'filters' => ['search' => $request->query('search')],
                'error' => 'Gagal mengambil data user dari sistem eksternal.',
            ]);
        }

        $data = $response->json();
        $externalUsers = $data['users'] ?? [];

        // Filter users: only show those with manager_id = 0 (no parent manager) or manager_id = id (self-managed)
        // and apply search filter if provided
        $filteredUsers = array_filter($externalUsers, function ($user) use ($request) {
            $managerId = $user['manager_id'] ?? 0;
            $userId = $user['id'];
            if ($managerId !== 0 && $managerId !== $userId) {
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

        // Format users for frontend (convert external API format to app format)
        $formattedUsers = array_map(fn ($user) => [
            'id' => $user['id'],
            'name' => $user['username'] ?? $user['email'],
            'email' => $user['email'],
            'username' => $user['username'],
            'role' => $user['role'],
            'status' => $user['status'],
            'manager_id' => $user['manager_id'] ?? 0,
        ], $filteredUsers);

        return Inertia::render('AccountManager/Downlines/Assign', [
            'users' => [
                'data' => array_values($formattedUsers),
                'links' => [],
                'from' => empty($formattedUsers) ? null : 1,
                'to' => empty($formattedUsers) ? null : count($formattedUsers),
                'total' => count($formattedUsers),
            ],
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
                ->route('account-manager.downlines.assign')
                ->with('error', 'Akun Account Manager tidak ditemukan atau tidak aktif. Hubungi administrator.');
        }

        // Get the external_id from request (from external API list)
        $externalId = $request->validated('user_id');

        // Check if user exists locally by external_id
        $user = User::where('external_id', $externalId)->first();

        // Ensure existing local user is verified when assigned
        if ($user !== null && $user->email_verified_at === null) {
            $user->email_verified_at = now();
            $user->save();
        }

        // If user doesn't exist, use data from the list to create user locally
        if ($user === null) {
            $userData = $request->validated('user_data');
            if (! $userData) {
                return redirect()
                    ->route('account-manager.downlines.assign')
                    ->with('error', 'Data user tidak lengkap. Silakan muat ulang halaman dan coba lagi.');
            }

            $userData = json_decode($userData, true);

            // Create/update user from data already fetched in the list
            try {
                $user = User::updateOrCreate(
                    ['email' => $userData['email']],
                    [
                        'name' => $userData['name'] ?? $userData['username'],
                        'username' => $userData['username'] ?? '',
                        'external_id' => $userData['id'],
                        'status' => ($userData['status'] === 'true' || $userData['status'] === true) ? 'active' : 'inactive',
                        'email_verified_at' => now(),
                        'password' => Hash::make(Str::random(32)),
                    ]
                );
            } catch (\Throwable $e) {
                return redirect()
                    ->route('account-manager.downlines.assign')
                    ->with('error', 'Gagal menyimpan data user: '.$e->getMessage());
            }

            // Assign external_user role if needed
            $externalUserRole = Role::where('slug', 'external_user')->first();
            if ($externalUserRole && ! $user->hasRole('external_user')) {
                $user->assignRole($externalUserRole);
            }
        }

        // Create referral relation (service will validate if user already has a relation)
        try {
            $this->requestAssignmentService->execute($accountManager, $user);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()
                ->route('account-manager.downlines.assign')
                ->with('error', collect($e->errors())->flatten()->first());
        }

        return redirect()
            ->route('account-manager.downlines.index')
            ->with('success', 'Pengajuan assignment berhasil dikirim dan menunggu persetujuan admin.');
    }
}

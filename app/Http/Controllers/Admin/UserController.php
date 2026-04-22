<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\AccountManager\ProvisionAccountManagerRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly ProvisionAccountManagerRecord $provisionAccountManager,
    ) {}

    /**
     * Get the route prefix for this controller.
     */
    protected function getRoutePrefix(): string
    {
        return 'module';
    }

    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::query()
            ->with(['roles', 'profile'])
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', function ($profileQuery) use ($search) {
                            $profileQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone_number', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Modules/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => request('search'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::query()->orderBy('id')->get();

        return Inertia::render('Modules/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
            $this->provisionAccountManagerIfNeeded($user, $validated['roles']);
        }

        // Create user profile if any profile data is provided
        if (
            ! empty($validated['first_name']) ||
            ! empty($validated['last_name']) ||
            ! empty($validated['phone_number']) ||
            ! empty($validated['avatar_url'])
        ) {
            $user->profile()->create([
                'first_name' => $validated['first_name'] ?? null,
                'last_name' => $validated['last_name'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
                'avatar_url' => $validated['avatar_url'] ?? null,
            ]);
        }

        return redirect()->route($this->getRoutePrefix().'.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load(['roles.permissions', 'profile']);

        return Inertia::render('Modules/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $user->load(['roles', 'profile']);
        $roles = Role::query()->orderBy('id')->get();

        return Inertia::render('Modules/Users/Edit', [
            'user' => $user,
            'userRoles' => $user->roles->pluck('id')->toArray(),
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ?? $user->password,
        ]);

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
            $this->provisionAccountManagerIfNeeded($user, $validated['roles']);
        }

        // Update or create user profile
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $validated['first_name'] ?? null,
                'last_name' => $validated['last_name'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
                'avatar_url' => $validated['avatar_url'] ?? null,
            ]
        );

        return redirect()->route($this->getRoutePrefix().'.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Provision an AccountManager record for the user if the account_manager
     * role is among the assigned roles and the record does not yet exist.
     *
     * @param  array<int>  $roleIds
     */
    private function provisionAccountManagerIfNeeded(User $user, array $roleIds): void
    {
        $isAccountManager = Role::query()
            ->whereIn('id', $roleIds)
            ->where('slug', 'account_manager')
            ->exists();

        if ($isAccountManager) {
            DB::transaction(fn () => $this->provisionAccountManager->execute($user->fresh()));
        }
    }

    /**
     * Mark the user's email as verified.
     */
    public function verify(User $user): RedirectResponse
    {
        $user->markEmailAsVerified();

        return redirect()->back()
            ->with('success', "User {$user->name} has been verified.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route($this->getRoutePrefix().'.users.index')
            ->with('success', 'User deleted successfully.');
    }
}

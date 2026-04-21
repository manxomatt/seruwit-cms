<?php

namespace App\Http\Controllers\Module;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountManagerRequest;
use App\Models\AccountManager;
use App\Services\AccountManager\CreateAccountManagerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountManagerController extends Controller
{
    public function __construct(
        private readonly CreateAccountManagerService $createService,
    ) {}

    /**
     * Display a listing of account managers.
     */
    public function index(): Response
    {
        $accountManagers = AccountManager::query()
            ->with(['user.profile'])
            ->when(request('search'), function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('referral_code', 'like', "%{$search}%");
            })
            ->when(request('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Module/AccountManagers/Index', [
            'accountManagers' => $accountManagers,
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new account manager.
     */
    public function create(): Response
    {
        return Inertia::render('Module/AccountManagers/Create');
    }

    /**
     * Store a newly created account manager.
     */
    public function store(StoreAccountManagerRequest $request): RedirectResponse
    {
        $this->createService->execute($request->validated());

        return redirect()
            ->route('module.account-managers.index')
            ->with('success', 'Account Manager created successfully.');
    }

    /**
     * Display the specified account manager.
     */
    public function show(AccountManager $accountManager): Response
    {
        $accountManager->load([
            'user.profile',
            'walletTransactions' => fn ($q) => $q->latest()->limit(20),
            'commissions' => fn ($q) => $q->latest()->limit(20),
        ]);

        return Inertia::render('Module/AccountManagers/Show', [
            'accountManager' => $accountManager,
        ]);
    }
}

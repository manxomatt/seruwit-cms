<?php

namespace App\Http\Controllers\AccountManager;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDownlineRequest;
use App\Models\ReferralRelation;
use App\Services\AccountManager\CreateDownlineService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DownlineController extends Controller
{
    public function __construct(
        private readonly CreateDownlineService $createDownlineService,
    ) {}

    public function index(Request $request): Response
    {
        $accountManager = $request->user()->accountManager;

        $downlines = ReferralRelation::query()
            ->where('account_manager_id', $accountManager?->id)
            ->with(['user.profile'])
            ->when($request->query('search'), function ($query, $search) {
                $query->whereHas('user', fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                );
            })
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $pendingCount = ReferralRelation::query()
            ->where('account_manager_id', $accountManager?->id)
            ->pending()
            ->count();

        return Inertia::render('AccountManager/Downlines/Index', [
            'downlines' => $downlines,
            'pendingCount' => $pendingCount,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('AccountManager/Downlines/Create');
    }

    public function store(StoreDownlineRequest $request): RedirectResponse
    {
        $accountManager = $request->user()->accountManager;

        if ($accountManager === null || $accountManager->status !== 'active') {
            return redirect()
                ->route('account-manager.downlines.index')
                ->with('error', 'Akun Account Manager tidak aktif.');
        }

        try {
            $this->createDownlineService->execute($accountManager, $request->validated());
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\RuntimeException $e) {
            return back()->withErrors(['external' => $e->getMessage()]);
        }

        return redirect()
            ->route('account-manager.downlines.index')
            ->with('success', 'Pengajuan downline berhasil dibuat dan menunggu persetujuan admin.');
    }
}

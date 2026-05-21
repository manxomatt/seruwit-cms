<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviceExtensionBillingRequest;
use App\Models\User;
use App\Services\Billing\BillingTransactionService;
use App\Services\ExternalApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DeviceExtensionBillingController extends Controller
{
    public function __construct(
        private readonly BillingTransactionService $billingTransactionService,
        private readonly ExternalApiService $externalApiService,
    ) {}

    public function confirm(Request $request): RedirectResponse|Response
    {
        $validator = Validator::make(
            [
                'device_identifier' => $request->query('device_identifier'),
                'device_label' => $request->query('device_label'),
                'object_expire_dt' => $request->query('object_expire_dt'),
            ],
            [
                'device_identifier' => ['required', 'string', 'max:255'],
                'device_label' => ['nullable', 'string', 'max:255'],
                'object_expire_dt' => ['nullable', 'string', 'max:64'],
            ],
            [
                'device_identifier.required' => 'Identitas perangkat tidak valid untuk perpanjangan.',
            ],
        );

        if ($validator->fails()) {
            return redirect()
                ->route('external.objects.index')
                ->withErrors($validator);
        }

        $validated = $validator->validated();
        $user = $request->user();
        $managerQuota = $this->resolveManagerQuota($user);

        return Inertia::render('External/Billing/DeviceExtensionConfirm', [
            'amount' => (int) config('billing.device_extension_amount', 50_000),
            'device_identifier' => $validated['device_identifier'],
            'device_label' => $validated['device_label'] ?? null,
            'object_expire_dt' => $validated['object_expire_dt'] ?? null,
            'objectsUrl' => route('external.objects.index'),
            'storeUrl' => route('external.billing.device-extension.confirm.store'),
            'isManager' => $managerQuota !== null,
            'objectsRemaining' => $managerQuota,
            'canPayWithQuota' => $managerQuota !== null && $managerQuota >= 1,
        ]);
    }

    public function confirmStore(StoreDeviceExtensionBillingRequest $request): RedirectResponse
    {
        if ($request->validated('payment_method') === 'quota') {
            return $this->storeAndExtendWithQuota($request);
        }

        return $this->storeAndRedirectToWaitingReview($request);
    }

    public function create(): Response
    {
        return Inertia::render('External/Billing/DeviceExtension', [
            'amount' => (int) config('billing.device_extension_amount', 50_000),
            'dashboardUrl' => route('external.dashboard'),
            'objectsUrl' => route('external.objects.index'),
            'storeUrl' => route('external.billing.device-extension.store'),
        ]);
    }

    public function store(StoreDeviceExtensionBillingRequest $request): RedirectResponse
    {
        if ($request->validated('payment_method') === 'quota') {
            return $this->storeAndExtendWithQuota($request);
        }

        return $this->storeAndRedirectToWaitingReview($request);
    }

    private function storeAndRedirectToWaitingReview(StoreDeviceExtensionBillingRequest $request): RedirectResponse
    {
        $amount = (int) config('billing.device_extension_amount', 50_000);

        $transaction = $this->billingTransactionService->createDeviceExtension(
            $request->user(),
            $amount,
            [
                'device_identifier' => $request->validated('device_identifier'),
                'device_label' => $request->validated('device_label'),
                'notes' => $request->validated('notes'),
            ],
        );

        $request->session()->put('pending_billing_transaction_id', $transaction->id);
        $request->session()->put('device_extension_visit_waiting_review', true);

        return redirect()->route('external.quota.waiting-review');
    }

    private function storeAndExtendWithQuota(StoreDeviceExtensionBillingRequest $request): RedirectResponse
    {
        $user = $request->user();
        $remaining = $this->resolveManagerQuota($user);

        if ($remaining === null) {
            return redirect()
                ->route('external.objects.index')
                ->with('error', 'Perpanjangan dengan kuota hanya tersedia untuk akun manager.');
        }

        if ($remaining < 1) {
            return redirect()
                ->route('external.objects.index')
                ->with('error', 'Sisa kuota Anda tidak mencukupi untuk melakukan perpanjangan.');
        }

        $this->billingTransactionService->createDeviceExtensionViaQuota(
            $user,
            [
                'device_identifier' => $request->validated('device_identifier'),
                'device_label' => $request->validated('device_label'),
                'notes' => $request->validated('notes'),
            ],
        );

        return redirect()
            ->route('external.objects.index')
            ->with('success', 'Perangkat berhasil diperpanjang menggunakan kuota Anda.');
    }

    /**
     * Returns the manager's remaining quota (objects_remaining) when the user
     * is an external_manager and the external API reachable; null otherwise.
     */
    private function resolveManagerQuota(User $user): ?int
    {
        if (! $user->hasRole('external_manager')) {
            return null;
        }

        if (! $this->externalApiService->hasApiKey()) {
            return null;
        }

        $externalId = $user->external_id;

        if (! filled($externalId)) {
            return null;
        }

        try {
            $response = $this->externalApiService->getBillingUser($externalId);
        } catch (Throwable $e) {
            Log::warning('Failed to fetch billing user while resolving manager quota', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $data = $response->json();

        if (! is_array($data) || ($data['success'] ?? null) !== true) {
            return null;
        }

        $quota = $data['quota'] ?? null;

        if (! is_array($quota) || ! array_key_exists('objects_remaining', $quota)) {
            return null;
        }

        return (int) $quota['objects_remaining'];
    }
}

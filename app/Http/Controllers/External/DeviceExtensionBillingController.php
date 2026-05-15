<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviceExtensionBillingRequest;
use App\Services\Billing\BillingTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class DeviceExtensionBillingController extends Controller
{
    public function __construct(private readonly BillingTransactionService $billingTransactionService) {}

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

        return Inertia::render('External/Billing/DeviceExtensionConfirm', [
            'amount' => (int) config('billing.device_extension_amount', 50_000),
            'device_identifier' => $validated['device_identifier'],
            'device_label' => $validated['device_label'] ?? null,
            'object_expire_dt' => $validated['object_expire_dt'] ?? null,
            'objectsUrl' => route('external.objects.index'),
            'storeUrl' => route('external.billing.device-extension.confirm.store'),
        ]);
    }

    public function confirmStore(StoreDeviceExtensionBillingRequest $request): RedirectResponse
    {
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
}

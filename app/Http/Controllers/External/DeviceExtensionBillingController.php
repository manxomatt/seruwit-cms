<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviceExtensionBillingRequest;
use App\Services\Billing\BillingTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceExtensionBillingController extends Controller
{
    public function __construct(private readonly BillingTransactionService $billingTransactionService) {}

    public function create(Request $request): Response
    {
        return Inertia::render('External/Billing/DeviceExtension', [
            'amount' => (int) config('billing.device_extension_amount', 50_000),
            'dashboardUrl' => route('external.dashboard'),
            'storeUrl' => route('external.billing.device-extension.store'),
        ]);
    }

    public function store(StoreDeviceExtensionBillingRequest $request): RedirectResponse
    {
        $amount = (int) config('billing.device_extension_amount', 50_000);

        $this->billingTransactionService->createDeviceExtension(
            $request->user(),
            $amount,
            [
                'device_identifier' => $request->validated('device_identifier'),
                'device_label' => $request->validated('device_label'),
                'notes' => $request->validated('notes'),
            ],
        );

        return redirect()
            ->route('external.dashboard')
            ->with('success', 'Permintaan perpanjangan perangkat dicatat. Lanjutkan pembayaran melalui payment gateway bila sudah tersedia.');
    }
}

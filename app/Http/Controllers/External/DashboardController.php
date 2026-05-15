<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Services\ExternalApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly ExternalApiService $externalApiService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $primaryRole = $user->getPrimaryRole();

        $billingUser = null;
        $billingQuota = null;
        $billingError = null;

        $billingUserId = $user->external_id;

        if ($this->externalApiService->hasApiKey() && filled($billingUserId)) {
            try {
                $response = $this->externalApiService->getBillingUser($billingUserId);

                if ($response->successful()) {
                    $data = $response->json();

                    if (isset($data['success']) && $data['success'] === true) {
                        $billingUser = $data['user'] ?? null;
                        $billingQuota = $data['quota'] ?? null;
                    } else {
                        $billingError = 'The external API returned an unsuccessful response.';
                        Log::warning('External API billing/users/{id} returned success=false', [
                            'billing_user_id' => $billingUserId,
                            'data' => $data,
                        ]);
                    }
                } else {
                    $billingError = 'Failed to load billing profile from the external API.';
                    Log::warning('External API billing/users/{id} non-200 response', [
                        'billing_user_id' => $billingUserId,
                        'status' => $response->status(),
                    ]);
                }
            } catch (\Throwable $e) {
                $billingError = 'Unable to connect to the external API.';
                Log::error('External API billing/users/{id} connection error', [
                    'billing_user_id' => $billingUserId,
                    'error' => $e->getMessage(),
                ]);
            }
        } elseif ($this->externalApiService->hasApiKey() && ! filled($billingUserId)) {
            $billingError = 'Cannot load billing profile: external user ID is not set for this account.';
        }

        return Inertia::render('External/Dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
            ],
            'primaryRole' => $primaryRole ? [
                'name' => $primaryRole->name,
                'slug' => $primaryRole->slug,
            ] : null,
            'billingUser' => $billingUser,
            'billingQuota' => $billingQuota,
            'billingError' => $billingError,
            'quotaCartUrl' => route('external.quota-cart'),
            'deviceExtensionUrl' => route('external.billing.device-extension'),
            'objectsUrl' => route('external.objects.index'),
        ]);
    }
}

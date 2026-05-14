<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Services\Billing\BillingTransactionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class PaymentCallbackController extends Controller
{
    public function __construct(private readonly BillingTransactionService $billingTransactionService) {}

    public function __invoke(Request $request): JsonResponse
    {
        $authResponse = $this->authorizeCallback($request);
        if ($authResponse !== null) {
            return $authResponse;
        }

        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:36'],
            'status' => ['required', 'string', Rule::in(['paid', 'failed'])],
            'gateway_payment_id' => ['nullable', 'string', 'max:255'],
        ], [
            'reference.required' => 'Reference transaksi wajib ada.',
            'status.required' => 'Status pembayaran wajib ada.',
            'status.in' => 'Status pembayaran tidak valid.',
        ]);

        $rawPayload = $request->all();

        try {
            $transaction = $this->billingTransactionService->applyGatewayPaymentResult(
                $validated['reference'],
                $validated['status'],
                $validated['gateway_payment_id'] ?? null,
                $rawPayload,
                $request,
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Transaksi tidak ditemukan.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'reference' => $transaction->reference,
            'status' => $transaction->status->value,
        ]);
    }

    private function authorizeCallback(Request $request): ?JsonResponse
    {
        $token = (string) config('billing.payment_callback_token');

        if ($token === '') {
            if (! app()->environment('local', 'testing')) {
                return response()->json(['message' => 'Billing callback token is not configured.'], Response::HTTP_SERVICE_UNAVAILABLE);
            }

            return null;
        }

        $sent = (string) $request->header('X-Billing-Token', '');

        if (! hash_equals($token, $sent)) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        return null;
    }
}

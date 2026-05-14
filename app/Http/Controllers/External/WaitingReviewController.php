<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Services\Billing\BillingTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaitingReviewController extends Controller
{
    public function __construct(private readonly BillingTransactionService $billingTransactionService) {}

    /**
     * Menandai bahwa pengguna akan membuka halaman waiting review.
     */
    public function store(Request $request): RedirectResponse
    {
        $checkout = $request->session()->get('quota_checkout');

        if (! is_array($checkout) || ! isset($checkout['quantity'])) {
            return redirect()
                ->route('external.quota-cart')
                ->with('error', 'Sesi checkout kuota tidak valid. Mulai lagi dari cart.');
        }

        $transaction = $this->billingTransactionService->createQuotaPurchase($request->user(), [
            'quantity' => (int) $checkout['quantity'],
            'unit_price' => (int) $checkout['unit_price'],
            'total' => (int) $checkout['total'],
        ]);

        $request->session()->put('pending_billing_transaction_id', $transaction->id);
        $request->session()->put('quota_visit_waiting_review', true);

        return redirect()->route('external.quota.waiting-review');
    }

    /**
     * Menampilkan status menunggu review setelah konfirmasi dari halaman review.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->pull('quota_visit_waiting_review', false)) {
            return redirect()
                ->route('external.quota-cart')
                ->with('error', 'Tidak ada permintaan kuota untuk ditampilkan. Mulai dari cart atau review.');
        }

        $transactionId = $request->session()->pull('pending_billing_transaction_id');

        if (! is_int($transactionId) && ! is_numeric($transactionId)) {
            return redirect()
                ->route('external.quota-cart')
                ->with('error', 'Transaksi billing tidak ditemukan di sesi.');
        }

        $transaction = BillingTransaction::query()
            ->whereKey((int) $transactionId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($transaction === null) {
            return redirect()
                ->route('external.quota-cart')
                ->with('error', 'Transaksi billing tidak ditemukan.');
        }

        $checkout = $request->session()->get('quota_checkout');

        $quantity = is_array($checkout) && isset($checkout['quantity'])
            ? (int) $checkout['quantity']
            : (int) ($transaction->meta['quantity'] ?? 0);

        $request->session()->forget('quota_checkout');

        return Inertia::render('External/Quota/WaitingReview', [
            'success' => true,
            'quantity' => $quantity,
            'errorMessage' => null,
            'cartUrl' => route('external.quota-cart'),
            'reviewUrl' => route('external.quota.review'),
            'dashboardUrl' => route('external.dashboard'),
            'billingTransaction' => [
                'reference' => $transaction->reference,
                'amount' => $transaction->amount,
                'currency' => $transaction->currency,
                'status' => $transaction->status->value,
            ],
            'paymentCallbackUrl' => route('billing.payment.callback'),
        ]);
    }
}

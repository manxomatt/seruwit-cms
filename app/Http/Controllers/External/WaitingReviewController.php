<?php

namespace App\Http\Controllers\External;

use App\Enums\BillingTransactionType;
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
     * Menampilkan status menunggu review setelah konfirmasi dari halaman review atau perpanjangan object.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $isQuotaVisit = $request->session()->pull('quota_visit_waiting_review', false);
        $isDeviceVisit = $request->session()->pull('device_extension_visit_waiting_review', false);

        if (! $isQuotaVisit && ! $isDeviceVisit) {
            return redirect()
                ->route('external.dashboard')
                ->with('error', 'Tidak ada halaman konfirmasi pembayaran untuk ditampilkan. Mulai dari daftar object atau cart kuota.');
        }

        $transactionId = $request->session()->pull('pending_billing_transaction_id');

        if (! is_int($transactionId) && ! is_numeric($transactionId)) {
            return redirect()
                ->route($isQuotaVisit ? 'external.quota-cart' : 'external.objects.index')
                ->with('error', 'Transaksi billing tidak ditemukan di sesi.');
        }

        $transaction = BillingTransaction::query()
            ->whereKey((int) $transactionId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($transaction === null) {
            return redirect()
                ->route($isQuotaVisit ? 'external.quota-cart' : 'external.objects.index')
                ->with('error', 'Transaksi billing tidak ditemukan.');
        }

        if ($isQuotaVisit && $transaction->type !== BillingTransactionType::QuotaPurchase) {
            return redirect()
                ->route('external.quota-cart')
                ->with('error', 'Data transaksi tidak sesuai.');
        }

        if ($isDeviceVisit && $transaction->type !== BillingTransactionType::DeviceExtension) {
            return redirect()
                ->route('external.objects.index')
                ->with('error', 'Data transaksi tidak sesuai.');
        }

        if ($isQuotaVisit) {
            $checkout = $request->session()->get('quota_checkout');

            $quantity = is_array($checkout) && isset($checkout['quantity'])
                ? (int) $checkout['quantity']
                : (int) ($transaction->meta['quantity'] ?? 0);

            $request->session()->forget('quota_checkout');

            return Inertia::render('External/Quota/WaitingReview', [
                'flow' => 'quota',
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
                'deviceSummary' => null,
            ]);
        }

        $meta = is_array($transaction->meta) ? $transaction->meta : [];

        return Inertia::render('External/Quota/WaitingReview', [
            'flow' => 'device_extension',
            'success' => true,
            'quantity' => 0,
            'errorMessage' => null,
            'cartUrl' => route('external.objects.index'),
            'reviewUrl' => route('external.objects.index'),
            'dashboardUrl' => route('external.dashboard'),
            'billingTransaction' => [
                'reference' => $transaction->reference,
                'amount' => $transaction->amount,
                'currency' => $transaction->currency,
                'status' => $transaction->status->value,
            ],
            'paymentCallbackUrl' => route('billing.payment.callback'),
            'deviceSummary' => [
                'identifier' => (string) ($meta['device_identifier'] ?? ''),
                'label' => isset($meta['device_label']) ? (string) $meta['device_label'] : '',
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotaReviewController extends Controller
{
    /**
     * Ringkasan permintaan penambahan kuota sebelum dikirim ke billing.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $checkout = $request->session()->get('quota_checkout');

        if (! is_array($checkout) || ! isset($checkout['quantity'])) {
            return redirect()
                ->route('external.quota-cart')
                ->with('error', 'Silakan pilih jumlah kuota di cart terlebih dahulu.');
        }

        return Inertia::render('External/Quota/Review', [
            'cartUrl' => route('external.quota-cart'),
            'dashboardUrl' => route('external.dashboard'),
            'submitWaitingReviewUrl' => route('external.quota.waiting-review.store'),
            'quantity' => (int) $checkout['quantity'],
            'unitPrice' => (int) $checkout['unit_price'],
            'total' => (int) $checkout['total'],
        ]);
    }
}

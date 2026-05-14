<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuotaCartRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotaCartController extends Controller
{
    /**
     * Halaman cart untuk mengajukan penambahan kuota objek.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('External/QuotaCart/Index', [
            'dashboardUrl' => route('external.dashboard'),
            'userName' => $request->user()->name,
            'quotaUnitPrice' => (int) config('services.external_api.quota_unit_price', 10_000),
        ]);
    }

    /**
     * Simpan pilihan kuota di sesi dan lanjut ke halaman review sebelum payment gateway.
     */
    public function store(StoreQuotaCartRequest $request): RedirectResponse
    {
        $quantity = (int) $request->validated('quantity');
        $unitPrice = (int) config('services.external_api.quota_unit_price', 10_000);

        $request->session()->put('quota_checkout', [
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total' => $quantity * $unitPrice,
        ]);

        return redirect()->route('external.quota.review');
    }
}

<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Models\QuotaUsageLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotaUsageHistoryController extends Controller
{
    public function index(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if (! $user->hasRole('external_manager')) {
            return redirect()
                ->route('external.dashboard')
                ->with('error', 'Riwayat penggunaan kuota hanya tersedia untuk akun manager.');
        }

        $logs = QuotaUsageLog::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->paginate(15)
            ->through(fn (QuotaUsageLog $log): array => [
                'id' => $log->id,
                'device_identifier' => $log->device_identifier,
                'device_label' => $log->device_label,
                'quota_used' => $log->quota_used,
                'quota_before' => $log->quota_before,
                'quota_after' => $log->quota_after,
                'notes' => $log->notes,
                'billing_transaction_id' => $log->billing_transaction_id,
                'created_at' => $log->created_at?->toIso8601String(),
                'invoice_lunas_url' => $log->billing_transaction_id !== null
                    ? route('billing.invoices.download', ['billingTransaction' => $log->billing_transaction_id, 'type' => 'lunas'])
                    : null,
            ]);

        return Inertia::render('External/Quota/UsageHistory', [
            'logs' => $logs,
            'dashboardUrl' => route('external.dashboard'),
        ]);
    }
}

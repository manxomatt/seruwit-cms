<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Services\ExternalApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class QuotaUsageHistoryController extends Controller
{
    private const PER_PAGE = 50;

    public function __construct(private readonly ExternalApiService $externalApiService) {}

    public function index(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if (! $user->hasRole('external_manager')) {
            return redirect()
                ->route('external.dashboard')
                ->with('error', 'Riwayat penggunaan kuota hanya tersedia untuk akun manager.');
        }

        $externalId = $user->external_id;

        if ($externalId === null || $externalId === '') {
            return Inertia::render('External/Quota/UsageHistory', [
                'logs' => $this->emptyPaginator($request),
                'dashboardUrl' => route('external.dashboard'),
                'error' => 'External ID belum di-set untuk akun ini; tidak dapat memuat riwayat kuota.',
            ]);
        }

        if (! $this->externalApiService->hasApiKey()) {
            return Inertia::render('External/Quota/UsageHistory', [
                'logs' => $this->emptyPaginator($request),
                'dashboardUrl' => route('external.dashboard'),
                'error' => 'External API key tidak terkonfigurasi; tidak dapat memuat riwayat kuota.',
            ]);
        }

        $page = max(1, (int) $request->query('page', 1));

        try {
            $response = $this->externalApiService->listBillingQuotaTransactions($externalId, $page, self::PER_PAGE);
        } catch (Throwable $e) {
            Log::error('External API /billing/quota-transactions connection error', [
                'error' => $e->getMessage(),
                'user_id' => $externalId,
            ]);

            return Inertia::render('External/Quota/UsageHistory', [
                'logs' => $this->emptyPaginator($request),
                'dashboardUrl' => route('external.dashboard'),
                'error' => 'Tidak dapat terhubung ke sistem eksternal.',
            ]);
        }

        if (! $response->successful()) {
            Log::warning('External API /billing/quota-transactions non-200 response', [
                'status' => $response->status(),
                'user_id' => $externalId,
            ]);

            return Inertia::render('External/Quota/UsageHistory', [
                'logs' => $this->emptyPaginator($request),
                'dashboardUrl' => route('external.dashboard'),
                'error' => 'Gagal mengambil riwayat kuota dari sistem eksternal.',
            ]);
        }

        $payload = $response->json();
        $rows = is_array($payload) && isset($payload['data']) && is_array($payload['data'])
            ? $payload['data']
            : [];
        $pagination = is_array($payload) && isset($payload['pagination']) && is_array($payload['pagination'])
            ? $payload['pagination']
            : [];

        $invoiceTransactionIds = $this->resolveInvoiceTransactionIds($user->id, $rows);

        $mapped = array_values(array_map(
            fn (array $row): array => $this->mapRow($row, $invoiceTransactionIds),
            $rows,
        ));

        return Inertia::render('External/Quota/UsageHistory', [
            'logs' => [
                'data' => $mapped,
                'current_page' => (int) ($pagination['current_page'] ?? $page),
                'last_page' => (int) ($pagination['last_page'] ?? 1),
                'from' => isset($pagination['from']) ? (int) $pagination['from'] : null,
                'to' => isset($pagination['to']) ? (int) $pagination['to'] : null,
                'total' => (int) ($pagination['total'] ?? count($mapped)),
                'per_page' => (int) ($pagination['per_page'] ?? self::PER_PAGE),
                'path' => $request->url(),
            ],
            'dashboardUrl' => route('external.dashboard'),
            'error' => null,
        ]);
    }

    /**
     * Resolve which billing_transaction_ids from the external response
     * correspond to local invoices that this user is allowed to download.
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, true>
     */
    private function resolveInvoiceTransactionIds(int $userId, array $rows): array
    {
        $ids = array_values(array_filter(array_map(
            static fn (array $row): ?int => isset($row['billing_transaction_id']) && is_numeric($row['billing_transaction_id'])
                ? (int) $row['billing_transaction_id']
                : null,
            $rows,
        )));

        if ($ids === []) {
            return [];
        }

        return BillingTransaction::query()
            ->whereIn('id', $ids)
            ->where('user_id', $userId)
            ->pluck('id')
            ->mapWithKeys(static fn (int $id): array => [$id => true])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<int, true>  $invoiceTransactionIds
     * @return array<string, mixed>
     */
    private function mapRow(array $row, array $invoiceTransactionIds): array
    {
        $billingTransactionId = isset($row['billing_transaction_id']) && is_numeric($row['billing_transaction_id'])
            ? (int) $row['billing_transaction_id']
            : null;

        return [
            'id' => isset($row['id']) && is_numeric($row['id']) ? (int) $row['id'] : null,
            'type' => isset($row['type']) ? (string) $row['type'] : null,
            'delta' => isset($row['delta']) && is_numeric($row['delta']) ? (int) $row['delta'] : 0,
            'imei' => isset($row['imei']) && $row['imei'] !== '' ? (string) $row['imei'] : null,
            'object_name' => isset($row['object_name']) && $row['object_name'] !== '' ? (string) $row['object_name'] : null,
            'quota_before' => isset($row['quota_before']) && is_numeric($row['quota_before']) ? (int) $row['quota_before'] : null,
            'quota_after' => isset($row['quota_after']) && is_numeric($row['quota_after']) ? (int) $row['quota_after'] : null,
            'notes' => isset($row['notes']) && $row['notes'] !== '' ? (string) $row['notes'] : null,
            'billing_transaction_id' => $billingTransactionId,
            'created_at' => isset($row['created_at']) ? (string) $row['created_at'] : null,
            'invoice_lunas_url' => $billingTransactionId !== null && isset($invoiceTransactionIds[$billingTransactionId])
                ? route('billing.invoices.download', ['billingTransaction' => $billingTransactionId, 'type' => 'lunas'])
                : null,
        ];
    }

    /**
     * @return array{data: array<int, mixed>, current_page: int, last_page: int, from: null, to: null, total: int, per_page: int, path: string}
     */
    private function emptyPaginator(Request $request): array
    {
        return [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'from' => null,
            'to' => null,
            'total' => 0,
            'per_page' => self::PER_PAGE,
            'path' => $request->url(),
        ];
    }
}

<?php

namespace App\Http\Controllers\Billing;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\QuotaUsageLog;
use App\Models\Setting;
use App\Services\Billing\InvoiceNumberGenerator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceNumberGenerator $invoiceNumberGenerator,
    ) {}

    public function download(Request $request, BillingTransaction $billingTransaction): Response
    {
        abort_unless($billingTransaction->user_id === $request->user()->id, 403);

        $type = $this->resolveInvoiceType($request->query('type'), $billingTransaction);

        if ($type === 'lunas') {
            abort_unless(
                $billingTransaction->status === BillingTransactionStatus::Paid,
                404,
                'Invoice lunas hanya tersedia untuk transaksi yang sudah dibayar.',
            );
        } else {
            abort_unless(
                in_array($billingTransaction->status, [
                    BillingTransactionStatus::AwaitingPayment,
                    BillingTransactionStatus::Paid,
                ], true),
                404,
                'Invoice penagihan tidak tersedia untuk transaksi yang gagal atau dibatalkan.',
            );
        }

        if (! filled($billingTransaction->invoice_number)) {
            $this->invoiceNumberGenerator->assign($billingTransaction);
            $billingTransaction->refresh();
        }

        $data = $this->buildInvoiceData($billingTransaction, $type);

        $pdf = Pdf::loadView('invoices.transaction', $data)
            ->setPaper('a4');

        $filename = sprintf(
            '%s-%s.pdf',
            $billingTransaction->invoice_number,
            $type === 'penagihan' ? 'penagihan' : 'lunas',
        );

        return $pdf->download($filename);
    }

    private function resolveInvoiceType(mixed $requested, BillingTransaction $transaction): string
    {
        if ($requested === 'penagihan' || $requested === 'lunas') {
            return $requested;
        }

        return $transaction->status === BillingTransactionStatus::Paid ? 'lunas' : 'penagihan';
    }

    /**
     * @return array<string, mixed>
     */
    private function buildInvoiceData(BillingTransaction $transaction, string $invoiceType): array
    {
        $user = $transaction->user()->first();
        $meta = $transaction->meta ?? [];
        $paymentMethod = $meta['payment_method'] ?? ($transaction->gateway_provider !== null ? 'gateway' : 'unknown');

        $companyName = (string) (Setting::getValue('general.site_name') ?? config('app.name', 'Seruwit'));
        $logoDataUri = $this->resolveLogoDataUri();

        $items = $this->buildItems($transaction, $meta);
        $subtotal = (int) $transaction->amount;

        $quotaUsage = null;
        if ($paymentMethod === 'quota') {
            $log = QuotaUsageLog::query()
                ->where('billing_transaction_id', $transaction->id)
                ->first();

            if ($log !== null) {
                $quotaUsage = [
                    'quota_used' => $log->quota_used,
                    'quota_before' => $log->quota_before,
                    'quota_after' => $log->quota_after,
                ];
            }
        }

        $issuedAt = $invoiceType === 'lunas' && $transaction->paid_at !== null
            ? Carbon::parse($transaction->paid_at)
            : Carbon::parse($transaction->created_at);

        return [
            'transaction' => $transaction,
            'customer' => (object) [
                'name' => $user?->name ?? '—',
                'email' => $user?->email ?? '—',
                'username' => $user?->username,
            ],
            'companyName' => $companyName,
            'companyTagline' => 'Sistem manajemen kuota & device',
            'logoDataUri' => $logoDataUri,
            'documentTitle' => $invoiceType === 'penagihan' ? 'INVOICE PENAGIHAN' : 'INVOICE LUNAS',
            'invoiceType' => $invoiceType,
            'issuedAt' => $issuedAt,
            'items' => $items,
            'subtotalFormatted' => $this->formatCurrency($subtotal, $transaction->currency),
            'totalFormatted' => $this->formatCurrency($subtotal, $transaction->currency),
            'paymentMethod' => $paymentMethod,
            'quotaUsage' => $quotaUsage,
        ];
    }

    /**
     * @param  array<string, mixed>  $meta
     * @return array<int, array<string, mixed>>
     */
    private function buildItems(BillingTransaction $transaction, array $meta): array
    {
        return match ($transaction->type) {
            BillingTransactionType::QuotaPurchase => [[
                'title' => 'Pembelian kuota objek',
                'description' => 'Penambahan slot objek pada akun manager.',
                'quantity' => (int) ($meta['quantity'] ?? 1),
                'quantity_unit' => 'slot',
                'unit_price_formatted' => $this->formatCurrency((int) ($meta['unit_price'] ?? 0), $transaction->currency),
                'subtotal_formatted' => $this->formatCurrency((int) $transaction->amount, $transaction->currency),
            ]],
            BillingTransactionType::DeviceExtension => [[
                'title' => 'Perpanjangan masa aktif perangkat',
                'description' => trim(sprintf(
                    'IMEI / ID: %s%s',
                    (string) ($meta['device_identifier'] ?? '—'),
                    isset($meta['device_label']) && $meta['device_label'] !== '' && $meta['device_label'] !== null
                        ? ' · '.$meta['device_label']
                        : '',
                )),
                'quantity' => 1,
                'quantity_unit' => '',
                'unit_price_formatted' => $this->formatCurrency((int) $transaction->amount, $transaction->currency),
                'subtotal_formatted' => $this->formatCurrency((int) $transaction->amount, $transaction->currency),
            ]],
        };
    }

    private function formatCurrency(int $amount, ?string $currency): string
    {
        $code = $currency ?? 'IDR';

        if ($code === 'IDR') {
            return 'Rp '.number_format($amount, 0, ',', '.');
        }

        return $code.' '.number_format($amount, 0, ',', '.');
    }

    /**
     * Tries to resolve the configured site logo into an inline base64 data URI
     * so DomPDF can render it without making remote HTTP calls. Falls back
     * to the favicon, and returns null if neither file is readable.
     */
    private function resolveLogoDataUri(): ?string
    {
        $candidates = array_filter([
            (string) Setting::getValue('site.logo', ''),
            '/favicon.png',
            '/favicon.ico',
        ], static fn (string $path): bool => $path !== '');

        foreach ($candidates as $path) {
            $absolute = public_path(ltrim($path, '/'));

            if (! is_file($absolute) || ! is_readable($absolute)) {
                continue;
            }

            $mime = match (strtolower((string) pathinfo($absolute, PATHINFO_EXTENSION))) {
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'webp' => 'image/webp',
                'ico' => 'image/x-icon',
                default => null,
            };

            if ($mime === null) {
                continue;
            }

            $contents = @file_get_contents($absolute);

            if ($contents === false) {
                continue;
            }

            return 'data:'.$mime.';base64,'.base64_encode($contents);
        }

        return null;
    }
}

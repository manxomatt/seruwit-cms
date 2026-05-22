<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }} {{ $transaction->invoice_number }}</title>
    <style>
        @page {
            margin: 24mm 18mm 24mm 18mm;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            font-size: 11px;
            margin: 0;
        }
        h1, h2, h3 { margin: 0; }
        .muted { color: #6b7280; }
        .header {
            display: table;
            width: 100%;
            border-bottom: 2px solid {{ $invoiceType === 'penagihan' ? '#b45309' : '#0891b2' }};
            padding-bottom: 12px;
            margin-bottom: 18px;
        }
        .header-left,
        .header-right {
            display: table-cell;
            vertical-align: top;
        }
        .header-right { text-align: right; }
        .brand-row {
            display: table;
            border-collapse: collapse;
        }
        .brand-logo,
        .brand-text {
            display: table-cell;
            vertical-align: middle;
        }
        .brand-logo {
            padding-right: 10px;
        }
        .brand-logo img {
            max-height: 42px;
            max-width: 140px;
        }
        .brand {
            font-size: 20px;
            font-weight: bold;
            color: {{ $invoiceType === 'penagihan' ? '#92400e' : '#0e7490' }};
            line-height: 1.1;
        }
        .invoice-label {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #111827;
        }
        .meta-block {
            display: table;
            width: 100%;
            margin-bottom: 18px;
        }
        .meta-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .meta-col h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        table.items th {
            background: #f3f4f6;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
        }
        table.items td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        .text-right { text-align: right; }
        .totals {
            width: 280px;
            float: right;
            border-collapse: collapse;
        }
        .totals td {
            padding: 6px 10px;
        }
        .totals .total-row td {
            border-top: 2px solid #111827;
            font-weight: bold;
            font-size: 13px;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .badge-paid { background: #d1fae5; color: #065f46; }
        .badge-quota { background: #cffafe; color: #155e75; }
        .badge-unpaid { background: #fef3c7; color: #92400e; }
        .instructions {
            margin-top: 18px;
            padding: 12px 14px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 4px;
            font-size: 11px;
        }
        .instructions h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #92400e;
            margin-bottom: 6px;
        }
        .footer {
            margin-top: 60px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="brand-row">
                @if (! empty($logoDataUri))
                    <div class="brand-logo">
                        <img src="{{ $logoDataUri }}" alt="{{ $companyName }} logo">
                    </div>
                @endif
                <div class="brand-text">
                    <div class="brand">{{ $companyName }}</div>
                    <div class="muted">{{ $companyTagline }}</div>
                </div>
            </div>
        </div>
        <div class="header-right">
            <div class="invoice-label">{{ $documentTitle }}</div>
            <div><strong>{{ $transaction->invoice_number }}</strong></div>
            <div class="muted">Ref: {{ $transaction->reference }}</div>
        </div>
    </div>

    <div class="meta-block">
        <div class="meta-col">
            <h3>Ditagihkan kepada</h3>
            <div><strong>{{ $customer->name }}</strong></div>
            <div class="muted">{{ $customer->email }}</div>
            @if ($customer->username)
                <div class="muted">@ {{ $customer->username }}</div>
            @endif
        </div>
        <div class="meta-col" style="text-align: right;">
            <h3>Detail invoice</h3>
            <div>Tanggal terbit: <strong>{{ $issuedAt->translatedFormat('d F Y') }}</strong></div>
            @if ($invoiceType === 'lunas')
                <div>Tanggal dibayar: <strong>{{ optional($transaction->paid_at)->translatedFormat('d F Y H:i') ?? '—' }}</strong></div>
            @endif
            <div style="margin-top: 4px;">
                @if ($invoiceType === 'penagihan')
                    <span class="badge badge-unpaid">Belum dibayar</span>
                @elseif ($paymentMethod === 'quota')
                    <span class="badge badge-quota">Dibayar dengan kuota</span>
                @else
                    <span class="badge badge-paid">Lunas</span>
                @endif
            </div>
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Deskripsi</th>
                <th class="text-right" style="width: 80px;">Qty</th>
                <th class="text-right" style="width: 130px;">Harga satuan</th>
                <th class="text-right" style="width: 140px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $item)
                <tr>
                    <td>
                        <div><strong>{{ $item['title'] }}</strong></div>
                        @if (! empty($item['description']))
                            <div class="muted">{{ $item['description'] }}</div>
                        @endif
                    </td>
                    <td class="text-right">{{ $item['quantity'] }}{{ ! empty($item['quantity_unit']) ? ' '.$item['quantity_unit'] : '' }}</td>
                    <td class="text-right">{{ $item['unit_price_formatted'] }}</td>
                    <td class="text-right">{{ $item['subtotal_formatted'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Subtotal</td>
            <td class="text-right">{{ $subtotalFormatted }}</td>
        </tr>
        <tr class="total-row">
            <td>{{ $invoiceType === 'penagihan' ? 'Total tagihan' : 'Total' }}</td>
            <td class="text-right">{{ $totalFormatted }}</td>
        </tr>
        @if ($paymentMethod === 'quota' && $invoiceType === 'lunas')
            <tr>
                <td class="muted" colspan="2" style="font-size: 10px; padding-top: 8px;">
                    Transaksi ini dibayar dengan kuota manager. Tidak ada penagihan uang.
                </td>
            </tr>
        @endif
    </table>

    @if ($invoiceType === 'penagihan')
        <div style="clear: both;"></div>
        <div class="instructions">
            <h3>Cara pembayaran</h3>
            <div>
                Mohon lakukan pembayaran sebesar <strong>{{ $totalFormatted }}</strong> melalui payment gateway yang tersedia di portal.
                Setelah pembayaran berhasil, status transaksi akan otomatis berubah menjadi <strong>Lunas</strong> dan
                invoice lunas dapat diunduh dari halaman riwayat transaksi.
            </div>
            <div class="muted" style="margin-top: 8px;">
                Referensi pembayaran: <strong>{{ $transaction->reference }}</strong>
            </div>
        </div>
    @endif

    @if ($paymentMethod === 'quota' && $invoiceType === 'lunas' && $quotaUsage !== null)
        <div style="clear: both; margin-top: 30px;">
            <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px;">
                Detail penggunaan kuota
            </h3>
            <table class="items">
                <tr>
                    <td style="width: 33%;">
                        <div class="muted">Kuota terpakai</div>
                        <div><strong>{{ $quotaUsage['quota_used'] }} slot</strong></div>
                    </td>
                    <td style="width: 33%;">
                        <div class="muted">Sisa sebelum</div>
                        <div><strong>{{ $quotaUsage['quota_before'] ?? '—' }}</strong></div>
                    </td>
                    <td>
                        <div class="muted">Sisa sesudah</div>
                        <div><strong>{{ $quotaUsage['quota_after'] ?? '—' }}</strong></div>
                    </td>
                </tr>
            </table>
        </div>
    @endif

    <div class="footer">
        {{ $documentTitle }} ini diterbitkan otomatis oleh sistem {{ $companyName }} pada {{ now()->translatedFormat('d F Y H:i') }} WIB.
    </div>
</body>
</html>

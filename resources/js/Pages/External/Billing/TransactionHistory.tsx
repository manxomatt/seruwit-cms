import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface TransactionRow {
    id: number;
    reference: string;
    invoice_number: string | null;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    amount: number;
    currency: string;
    gateway_provider: string | null;
    gateway_payment_id: string | null;
    paid_at: string | null;
    failed_at: string | null;
    created_at: string | null;
    invoice_penagihan_url: string | null;
    invoice_lunas_url: string | null;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    links: PaginatorLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface Props {
    transactions: Paginator<TransactionRow>;
}

const formatIdr = (amount: number, currency: string): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency === 'IDR' ? 'IDR' : currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

const formatDateTime = (iso: string | null): string => {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const statusBadgeClass = (status: string): string => {
    switch (status) {
        case 'paid':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
        case 'awaiting_payment':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
        case 'failed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
};

const HistoryIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

export default function TransactionHistory({ transactions }: Props): JSX.Element {
    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-3">
                    <HistoryIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Riwayat transaksi
                    </h2>
                </div>
            }
        >
            <Head title="Riwayat transaksi" />

            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Invoice / Referensi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Jenis
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Jumlah
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Dibuat
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Dibayar
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Invoice
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {transactions.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Belum ada transaksi billing.
                                    </td>
                                </tr>
                            ) : (
                                transactions.data.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-900 dark:text-gray-100">
                                            {row.invoice_number !== null ? (
                                                <div className="font-semibold">{row.invoice_number}</div>
                                            ) : null}
                                            <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                                                {row.reference}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{row.type_label}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                                            >
                                                {row.status_label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatIdr(row.amount, row.currency)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDateTime(row.created_at)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDateTime(row.paid_at)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            {row.invoice_lunas_url !== null ? (
                                                <a
                                                    href={row.invoice_lunas_url}
                                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                    </svg>
                                                    Lunas
                                                </a>
                                            ) : row.invoice_penagihan_url !== null ? (
                                                <a
                                                    href={row.invoice_penagihan_url}
                                                    className="inline-flex items-center gap-1 rounded-md border border-amber-500 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-300 dark:hover:bg-amber-900/30"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                    </svg>
                                                    Penagihan
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan {transactions.from ?? 0}–{transactions.to ?? 0} dari {transactions.total}
                        </p>
                        <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                            {transactions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-1 text-sm ${
                                        link.active
                                            ? 'bg-cyan-600 font-semibold text-white'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                                    } ${link.url === null ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </DynamicLayout>
    );
}

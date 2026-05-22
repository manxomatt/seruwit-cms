import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface QuotaUsageRow {
    id: number;
    device_identifier: string;
    device_label: string | null;
    quota_used: number;
    quota_before: number | null;
    quota_after: number | null;
    notes: string | null;
    billing_transaction_id: number | null;
    created_at: string | null;
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
    logs: Paginator<QuotaUsageRow>;
    dashboardUrl: string;
}

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

const QuotaIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM9 8.25v7.5m6-7.5v7.5m-9-3.75h12"
        />
    </svg>
);

export default function UsageHistory({ logs, dashboardUrl }: Props): JSX.Element {
    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-3">
                    <QuotaIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Riwayat penggunaan kuota
                    </h2>
                </div>
            }
        >
            <Head title="Riwayat penggunaan kuota" />

            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Daftar perpanjangan masa aktif perangkat yang dibayar menggunakan kuota Anda.
                    </p>
                    <Link
                        href={dashboardUrl}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                        Kembali ke dashboard
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Perangkat
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Kuota dipakai
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Sisa sebelum
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Sisa sesudah
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Catatan
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Invoice
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Belum ada penggunaan kuota.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                <div className="font-mono text-xs text-gray-900 dark:text-gray-100">
                                                    {row.device_identifier}
                                                </div>
                                                {row.device_label !== null && row.device_label !== '' && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {row.device_label}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {row.quota_used}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">
                                                {row.quota_before ?? '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">
                                                {row.quota_after ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {row.notes ?? '—'}
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

                    {logs.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Menampilkan {logs.from ?? 0}–{logs.to ?? 0} dari {logs.total}
                            </p>
                            <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                                {logs.links.map((link, index) => (
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
            </div>
        </DynamicLayout>
    );
}

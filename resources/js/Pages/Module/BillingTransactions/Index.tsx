import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface UserSummary {
    id: number;
    name: string;
    username: string | null;
    email: string;
    external_id: string | null;
}

interface TransactionRow {
    id: number;
    reference: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    amount: number;
    currency: string;
    gateway_provider: string | null;
    gateway_payment_id: string | null;
    failure_message: string | null;
    paid_at: string | null;
    failed_at: string | null;
    created_at: string | null;
    user: UserSummary | null;
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

interface Stats {
    total_count: number;
    paid_count: number;
    awaiting_count: number;
    failed_count: number;
    paid_revenue: number;
    awaiting_amount: number;
}

interface Option {
    value: string;
    label: string;
}

interface Props {
    transactions: Paginator<TransactionRow>;
    filters: {
        search: string | null;
        status: string | null;
        type: string | null;
        date_from: string | null;
        date_to: string | null;
    };
    stats: Stats;
    statusOptions: Option[];
    typeOptions: Option[];
}

const formatIdr = (amount: number, currency: string = 'IDR'): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
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
        case 'cancelled':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
};

const StatCard = ({
    label,
    value,
    accent = 'gray',
}: {
    label: string;
    value: string | number;
    accent?: 'gray' | 'emerald' | 'amber' | 'red' | 'cyan';
}): JSX.Element => {
    const accentClasses: Record<string, string> = {
        gray: 'text-gray-900 dark:text-white',
        emerald: 'text-emerald-700 dark:text-emerald-300',
        amber: 'text-amber-700 dark:text-amber-300',
        red: 'text-red-700 dark:text-red-300',
        cyan: 'text-cyan-700 dark:text-cyan-300',
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${accentClasses[accent]}`}>{value}</p>
        </div>
    );
};

const ChartIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941"
        />
    </svg>
);

export default function BillingTransactionsIndex({ transactions, filters, stats, statusOptions, typeOptions }: Props): JSX.Element {
    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [status, setStatus] = useState<string>(filters.status ?? '');
    const [type, setType] = useState<string>(filters.type ?? '');
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to ?? '');

    const applyFilters = (overrides: Partial<{ search: string; status: string; type: string; date_from: string; date_to: string }> = {}): void => {
        router.get(
            route('module.billing-transactions.index'),
            {
                search: overrides.search ?? search,
                status: overrides.status ?? status,
                type: overrides.type ?? type,
                date_from: overrides.date_from ?? dateFrom,
                date_to: overrides.date_to ?? dateTo,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetFilters = (): void => {
        setSearch('');
        setStatus('');
        setType('');
        setDateFrom('');
        setDateTo('');
        router.get(route('module.billing-transactions.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-3">
                    <ChartIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Manajemen Transaksi Billing
                    </h2>
                </div>
            }
        >
            <Head title="Manajemen Billing" />

            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatCard label="Total transaksi" value={stats.total_count} />
                    <StatCard label="Lunas" value={stats.paid_count} accent="emerald" />
                    <StatCard label="Menunggu" value={stats.awaiting_count} accent="amber" />
                    <StatCard label="Gagal" value={stats.failed_count} accent="red" />
                    <StatCard label="Total revenue" value={formatIdr(stats.paid_revenue)} accent="emerald" />
                    <StatCard label="Nilai pending" value={formatIdr(stats.awaiting_amount)} accent="amber" />
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filter</h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <input
                                type="text"
                                placeholder="Cari ref, nama, email, username..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 lg:col-span-2"
                            />
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="">Semua status</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    applyFilters({ type: e.target.value });
                                }}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="">Semua jenis</option>
                                {typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => applyFilters()}
                                    className="flex-1 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500"
                                >
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tanggal dari</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    onBlur={() => applyFilters()}
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tanggal sampai</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    onBlur={() => applyFilters()}
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Referensi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Jenis
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Jumlah
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Tidak ada transaksi billing.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {row.user ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{row.user.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{row.user.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">
                                                {row.reference}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                {row.type_label}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatIdr(row.amount, row.currency)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                                                >
                                                    {row.status_label}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                <Link
                                                    href={route('module.billing-transactions.show', { billingTransaction: row.id })}
                                                    className="text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                                                >
                                                    Lihat detail
                                                </Link>
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
                                        preserveState
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

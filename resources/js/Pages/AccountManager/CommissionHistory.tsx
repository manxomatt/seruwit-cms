import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface BillingInfo {
    amount: number;
    currency: string;
    type: string;
    paid_at: string | null;
}

interface DownlineInfo {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface CommissionRow {
    id: number;
    transaction_reference: string;
    commission_type: string;
    commission_type_label: string;
    commission_value: number;
    commission_amount: number;
    status: string;
    status_label: string;
    created_at: string | null;
    billing: BillingInfo | null;
    downline: DownlineInfo | null;
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
    total_commission_amount: number;
    paid_commission_amount: number;
    pending_commission_amount: number;
    total_count: number;
}

interface Props {
    commissions: Paginator<CommissionRow>;
    stats: Stats;
    wallet_balance: number;
}

const formatIdr = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
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
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
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
    value: string;
    accent?: 'gray' | 'emerald' | 'amber' | 'cyan';
}): JSX.Element => {
    const accentClasses: Record<string, string> = {
        gray: 'text-gray-900 dark:text-white',
        emerald: 'text-emerald-700 dark:text-emerald-300',
        amber: 'text-amber-700 dark:text-amber-300',
        cyan: 'text-cyan-700 dark:text-cyan-300',
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${accentClasses[accent]}`}>{value}</p>
        </div>
    );
};

const ReferralIcon = (): JSX.Element => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
    </svg>
);

export default function CommissionHistory({ commissions, stats, wallet_balance }: Props): JSX.Element {
    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-3">
                    <ReferralIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Riwayat Transaksi Referral
                    </h2>
                </div>
            }
        >
            <Head title="Riwayat Transaksi Referral" />

            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Saldo wallet" value={formatIdr(wallet_balance)} accent="cyan" />
                    <StatCard label="Total komisi" value={formatIdr(stats.total_commission_amount)} />
                    <StatCard label="Komisi dibayarkan" value={formatIdr(stats.paid_commission_amount)} accent="emerald" />
                    <StatCard label="Komisi menunggu" value={formatIdr(stats.pending_commission_amount)} accent="amber" />
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Daftar komisi</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Total {stats.total_count} transaksi komisi
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Downline
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Referensi
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Jumlah billing
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Persen
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Komisi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {commissions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            Belum ada transaksi komisi referral.
                                        </td>
                                    </tr>
                                ) : (
                                    commissions.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {row.downline ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {row.downline.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            @{row.downline.username}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">
                                                {row.transaction_reference}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                                                {row.billing ? formatIdr(row.billing.amount) : '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                                                {row.commission_value.toFixed(2)}%
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatIdr(row.commission_amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                                                >
                                                    {row.status_label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {commissions.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Menampilkan {commissions.from ?? 0}–{commissions.to ?? 0} dari {commissions.total}
                            </p>
                            <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                                {commissions.links.map((link, index) => (
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

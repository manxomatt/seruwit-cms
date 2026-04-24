import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface WalletTransaction {
    id: number;
    type: string;
    amount: string;
    balance_after: string;
    description: string | null;
    created_at: string;
}

interface RecentCommission {
    id: number;
    commission_type: string;
    commission_amount: string;
    status: string;
    created_at: string;
}

interface AccountManagerData {
    id: number;
    referral_code: string;
    wallet_balance: string;
    status: string;
    recent_transactions: WalletTransaction[];
    recent_commissions: RecentCommission[];
}

interface Stats {
    wallet_balance: string;
    total_referrals: number;
    total_commissions: number;
    pending_commissions: number;
    paid_commissions: number;
    downlines_count: number;
    pending_downlines: number;
}

interface Props {
    user: {
        name: string;
        email: string;
    };
    primaryRole: {
        name: string;
        slug: string;
    } | null;
    accountManager: AccountManagerData | null;
    stats: Stats | null;
}

const WalletIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
);

const UsersIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const ChartBarIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

const formatCurrency = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num);
};

const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) { return 'Selamat Pagi'; }
    if (hour < 18) { return 'Selamat Siang'; }
    return 'Selamat Malam';
};

const CommissionStatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
        pending: 'Menunggu',
        paid: 'Dibayar',
        cancelled: 'Dibatalkan',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}>
            {labels[status] ?? status}
        </span>
    );
};

const TransactionTypeBadge = ({ type }: { type: string }) => {
    const isCredit = type === 'credit';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCredit ? 'Masuk' : 'Keluar'}
        </span>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: JSX.Element;
    color: 'cyan' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
    cyan: {
        bg: 'bg-cyan-50',
        icon: 'text-cyan-600',
        border: 'border-cyan-100',
    },
    emerald: {
        bg: 'bg-emerald-50',
        icon: 'text-emerald-600',
        border: 'border-emerald-100',
    },
    amber: {
        bg: 'bg-amber-50',
        icon: 'text-amber-600',
        border: 'border-amber-100',
    },
    rose: {
        bg: 'bg-rose-50',
        icon: 'text-rose-600',
        border: 'border-rose-100',
    },
};

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => {
    const c = colorMap[color];
    return (
        <div className={`overflow-hidden rounded-xl border ${c.border} bg-white p-6 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
                </div>
                <div className={`rounded-lg ${c.bg} p-3 ${c.icon}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ user, primaryRole, accountManager, stats }: Props): JSX.Element {
    const firstName = user.name.split(' ')[0];

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Account Manager
                </h2>
            }
        >
            <Head title="Dashboard Account Manager" />

            <div className="space-y-6">
                {/* Hero / Greeting */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-8 py-6 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <SparklesIcon />
                                <span className="text-sm font-medium text-white/70">{getGreeting()}</span>
                            </div>
                            <h1 className="mt-1 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-3xl font-bold text-transparent">
                                Selamat Datang, {firstName}!
                            </h1>
                            <p className="mt-2 text-white/70">
                                Anda masuk sebagai{' '}
                                <span className="font-semibold text-cyan-400">
                                    {primaryRole?.name ?? 'Account Manager'}
                                </span>
                            </p>
                        </div>
                        {accountManager && (
                            <div className="hidden text-right lg:block">
                                <p className="text-xs text-white/50">Kode Referral</p>
                                <p className="mt-1 font-mono text-lg font-bold tracking-widest text-cyan-300">
                                    {accountManager.referral_code}
                                </p>
                                <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${accountManager.status === 'active' ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                                    {accountManager.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* No account manager record warning */}
                {!accountManager && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                        Akun Account Manager belum dikonfigurasi. Hubungi administrator.
                    </div>
                )}

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Saldo Wallet"
                            value={formatCurrency(stats.wallet_balance)}
                            icon={<WalletIcon />}
                            color="cyan"
                        />
                        <StatCard
                            title="Total Referral"
                            value={stats.total_referrals}
                            icon={<UsersIcon />}
                            color="emerald"
                        />
                        <StatCard
                            title="Komisi Pending"
                            value={stats.pending_commissions}
                            subtitle={`dari ${stats.total_commissions} total`}
                            icon={<ChartBarIcon />}
                            color="amber"
                        />
                        <StatCard
                            title="Komisi Dibayar"
                            value={stats.paid_commissions}
                            icon={<ChartBarIcon />}
                            color="rose"
                        />
                    </div>
                )}

                {/* Downlines quick access */}
                {stats && (
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Downline</h3>
                                <p className="mt-0.5 text-sm text-gray-500">
                                    {stats.downlines_count} disetujui
                                    {stats.pending_downlines > 0 && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                            {stats.pending_downlines} menunggu
                                        </span>
                                    )}
                                </p>
                            </div>
                            <Link
                                href={route('account-manager.downlines.index')}
                                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="flex gap-4 px-6 py-4">
                            <Link
                                href={route('account-manager.downlines.create')}
                                className="flex-1 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-center text-sm text-gray-500 hover:border-cyan-400 hover:text-cyan-600"
                            >
                                + Buat Downline Baru
                            </Link>
                            <Link
                                href={route('account-manager.downlines.assign')}
                                className="flex-1 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-center text-sm text-gray-500 hover:border-cyan-400 hover:text-cyan-600"
                            >
                                + Request Assign User
                            </Link>
                        </div>
                    </div>
                )}

                {/* Recent activity */}
                {accountManager && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Commissions */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">Komisi Terbaru</h3>
                            </div>
                            {accountManager.recent_commissions.length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-gray-400">Belum ada data komisi.</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {accountManager.recent_commissions.map((c) => (
                                        <li key={c.id} className="flex items-center justify-between px-6 py-3">
                                            <div>
                                                <p className="text-sm font-medium capitalize text-gray-900">
                                                    {c.commission_type}
                                                </p>
                                                <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {formatCurrency(c.commission_amount)}
                                                </span>
                                                <CommissionStatusBadge status={c.status} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Recent Wallet Transactions */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">Transaksi Wallet Terbaru</h3>
                            </div>
                            {accountManager.recent_transactions.length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-gray-400">Belum ada transaksi.</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {accountManager.recent_transactions.map((tx) => (
                                        <li key={tx.id} className="flex items-center justify-between px-6 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {tx.description ?? 'Transaksi wallet'}
                                                </p>
                                                <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {formatCurrency(tx.amount)}
                                                </span>
                                                <TransactionTypeBadge type={tx.type} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Referral code (mobile) */}
                {accountManager && (
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:hidden">
                        <p className="text-sm font-medium text-gray-500">Kode Referral Anda</p>
                        <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-cyan-600">
                            {accountManager.referral_code}
                        </p>
                    </div>
                )}
            </div>
        </DynamicLayout>
    );
}

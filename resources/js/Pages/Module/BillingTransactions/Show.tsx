import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface UserSummary {
    id: number;
    name: string;
    username: string | null;
    email: string;
    external_id: string | null;
}

interface TransactionLog {
    id: number;
    action: string;
    message: string | null;
    context: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string | null;
}

interface Transaction {
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
    meta: Record<string, unknown> | null;
    logs: TransactionLog[];
}

interface Props {
    transaction: Transaction;
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

const DataRow = ({ label, value }: { label: string; value: React.ReactNode }): JSX.Element => (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:flex-row sm:gap-4 dark:border-gray-700">
        <dt className="w-full text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:w-48 sm:shrink-0">
            {label}
        </dt>
        <dd className="text-sm text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
);

export default function BillingTransactionsShow({ transaction }: Props): JSX.Element {
    return (
        <DynamicLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Detail Transaksi Billing
                    </h2>
                    <Link
                        href={route('module.billing-transactions.index')}
                        className="text-sm text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
                    >
                        ← Kembali ke daftar
                    </Link>
                </div>
            }
        >
            <Head title={`Transaksi ${transaction.reference}`} />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Referensi
                            </p>
                            <p className="mt-0.5 font-mono text-base text-gray-900 dark:text-gray-100">
                                {transaction.reference}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Jumlah
                            </p>
                            <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">
                                {formatIdr(transaction.amount, transaction.currency)}
                            </p>
                            <span
                                className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(transaction.status)}`}
                            >
                                {transaction.status_label}
                            </span>
                        </div>
                    </div>

                    <dl className="grid gap-x-8 gap-y-0 px-6 py-4 lg:grid-cols-2">
                        <DataRow label="Jenis transaksi" value={transaction.type_label} />
                        <DataRow label="Mata uang" value={transaction.currency} />
                        <DataRow label="Gateway provider" value={transaction.gateway_provider ?? '—'} />
                        <DataRow label="Gateway payment ID" value={transaction.gateway_payment_id ?? '—'} />
                        <DataRow label="Dibuat" value={formatDateTime(transaction.created_at)} />
                        <DataRow label="Dibayarkan" value={formatDateTime(transaction.paid_at)} />
                        <DataRow label="Gagal pada" value={formatDateTime(transaction.failed_at)} />
                        <DataRow
                            label="Pesan kegagalan"
                            value={transaction.failure_message ?? '—'}
                        />
                    </dl>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pengguna</h3>
                        </div>
                        <dl className="px-6 py-4">
                            {transaction.user ? (
                                <>
                                    <DataRow label="Nama" value={transaction.user.name} />
                                    <DataRow label="Username" value={transaction.user.username ?? '—'} />
                                    <DataRow label="Email" value={transaction.user.email} />
                                    <DataRow label="External ID" value={transaction.user.external_id ?? '—'} />
                                </>
                            ) : (
                                <p className="py-3 text-sm text-gray-500 dark:text-gray-400">Data pengguna tidak tersedia.</p>
                            )}
                        </dl>
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Metadata</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Payload tambahan yang disimpan saat transaksi dibuat
                            </p>
                        </div>
                        <div className="max-h-72 overflow-auto px-6 py-4">
                            {transaction.meta && Object.keys(transaction.meta).length > 0 ? (
                                <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
                                    {JSON.stringify(transaction.meta, null, 2)}
                                </pre>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada metadata.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Riwayat aktivitas</h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {transaction.logs.length} log entry tercatat
                        </p>
                    </div>
                    {transaction.logs.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            Belum ada catatan aktivitas.
                        </div>
                    ) : (
                        <ol className="divide-y divide-gray-100 dark:divide-gray-700">
                            {transaction.logs.map((log) => (
                                <li key={log.id} className="px-6 py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="font-mono text-xs font-semibold uppercase text-cyan-700 dark:text-cyan-300">
                                                {log.action}
                                            </p>
                                            {log.message && (
                                                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{log.message}</p>
                                            )}
                                            {log.context && Object.keys(log.context).length > 0 && (
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                                        Lihat context
                                                    </summary>
                                                    <pre className="mt-2 overflow-x-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
                                                        {JSON.stringify(log.context, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                            <p>{formatDateTime(log.created_at)}</p>
                                            {log.ip_address && <p className="mt-0.5 font-mono">{log.ip_address}</p>}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </DynamicLayout>
    );
}

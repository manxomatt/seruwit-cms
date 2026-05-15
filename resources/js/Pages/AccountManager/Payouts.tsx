import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface PayoutRow {
    id: number;
    reference: string;
    amount: number;
    status: string;
    status_label: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    notes: string | null;
    rejection_reason: string | null;
    processed_at: string | null;
    created_at: string | null;
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

interface Flash {
    success?: string;
    error?: string;
}

interface Props {
    payouts: Paginator<PayoutRow>;
    wallet_balance: number;
    minimum_amount: number;
    has_pending_request: boolean;
}

interface PayoutForm {
    amount: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    notes: string;
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
        case 'approved':
            return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200';
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
};

const WalletIcon = (): JSX.Element => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
        />
    </svg>
);

export default function Payouts({ payouts, wallet_balance, minimum_amount, has_pending_request }: Props): JSX.Element {
    const { flash } = usePage<{ flash: Flash }>().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<PayoutForm>({
        amount: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        notes: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        post(route('account-manager.payouts.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const canRequestPayout = wallet_balance >= minimum_amount && !has_pending_request;

    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-3">
                    <WalletIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Pencairan Komisi
                    </h2>
                </div>
            }
        >
            <Head title="Pencairan Komisi" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Saldo wallet tersedia
                            </p>
                            <p className="mt-1 text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                                {formatIdr(wallet_balance)}
                            </p>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Minimum pencairan: {formatIdr(minimum_amount)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowForm((prev) => !prev)}
                            disabled={!canRequestPayout}
                            className="inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                        >
                            {showForm ? 'Tutup form' : 'Ajukan pencairan'}
                        </button>
                    </div>

                    {has_pending_request && (
                        <div className="border-b border-gray-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-gray-700 dark:bg-amber-950/40 dark:text-amber-200">
                            Anda memiliki permintaan pencairan yang masih menunggu verifikasi. Tunggu sampai diproses sebelum mengajukan lagi.
                        </div>
                    )}

                    {wallet_balance < minimum_amount && !has_pending_request && (
                        <div className="border-b border-gray-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-gray-700 dark:bg-amber-950/40 dark:text-amber-200">
                            Saldo Anda belum mencapai minimum pencairan {formatIdr(minimum_amount)}.
                        </div>
                    )}

                    {showForm && canRequestPayout && (
                        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Jumlah pencairan (Rp)
                                </label>
                                <input
                                    id="amount"
                                    type="number"
                                    min={minimum_amount}
                                    max={wallet_balance}
                                    step="1"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    required
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Nama bank
                                    </label>
                                    <input
                                        id="bank_name"
                                        type="text"
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                        placeholder="BCA, Mandiri, BNI, ..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        required
                                    />
                                    {errors.bank_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bank_name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Nomor rekening
                                    </label>
                                    <input
                                        id="bank_account_number"
                                        type="text"
                                        value={data.bank_account_number}
                                        onChange={(e) => setData('bank_account_number', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        required
                                    />
                                    {errors.bank_account_number && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bank_account_number}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Nama pemilik rekening
                                </label>
                                <input
                                    id="bank_account_name"
                                    type="text"
                                    value={data.bank_account_name}
                                    onChange={(e) => setData('bank_account_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    required
                                />
                                {errors.bank_account_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bank_account_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Catatan (opsional)
                                </label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        setShowForm(false);
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                                >
                                    {processing ? 'Mengirim...' : 'Ajukan pencairan'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Riwayat pencairan</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Total {payouts.total} permintaan pencairan
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
                                        Referensi
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Jumlah
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Bank tujuan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Diproses
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {payouts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Belum ada permintaan pencairan.
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">
                                                {row.reference}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatIdr(row.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{row.bank_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {row.bank_account_number} — {row.bank_account_name}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                                                >
                                                    {row.status_label}
                                                </span>
                                                {row.rejection_reason && (
                                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                        {row.rejection_reason}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(row.processed_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {payouts.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Menampilkan {payouts.from ?? 0}–{payouts.to ?? 0} dari {payouts.total}
                            </p>
                            <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                                {payouts.links.map((link, index) => (
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

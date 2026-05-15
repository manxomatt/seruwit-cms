import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect, useState } from 'react';

interface AccountManagerSummary {
    id: number;
    referral_code: string;
    wallet_balance: number;
    user: {
        id: number;
        name: string;
        email: string;
        username: string;
    } | null;
}

interface ProcessedBy {
    id: number;
    name: string;
    email: string;
}

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
    account_manager: AccountManagerSummary | null;
    processed_by: ProcessedBy | null;
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
    pending_count: number;
    approved_count: number;
    paid_count: number;
    rejected_count: number;
    pending_amount: number;
}

interface Flash {
    success?: string;
    error?: string;
}

interface Props {
    payouts: Paginator<PayoutRow>;
    filters: {
        search: string | null;
        status: string | null;
    };
    stats: Stats;
}

type ActionVariant = 'approve' | 'reject' | 'mark-paid';

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

const StatCard = ({ label, value, accent = 'gray' }: { label: string; value: string | number; accent?: string }): JSX.Element => {
    const accentClasses: Record<string, string> = {
        gray: 'text-gray-900 dark:text-white',
        emerald: 'text-emerald-700 dark:text-emerald-300',
        amber: 'text-amber-700 dark:text-amber-300',
        cyan: 'text-cyan-700 dark:text-cyan-300',
        red: 'text-red-700 dark:text-red-300',
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${accentClasses[accent] ?? accentClasses.gray}`}>{value}</p>
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = () => (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BanknotesIcon = () => (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 12a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V12zm-12 0h.008v.008H6V12z" />
    </svg>
);

/**
 * Backdrop + modal frame with subtle fade/scale entrance animation.
 */
const ModalShell = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (open) {
            const t = window.setTimeout(() => setMounted(true), 10);
            return () => window.clearTimeout(t);
        }
        setMounted(false);
    }, [open]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (open) {
            window.addEventListener('keydown', handler);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
                mounted ? 'opacity-100' : 'opacity-0'
            }`}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />
            <div
                className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 transition-all duration-200 dark:bg-gray-800 dark:ring-white/10 ${
                    mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
                }`}
            >
                {children}
            </div>
        </div>
    );
};

/**
 * Card that summarises the payout, shared by all three action modals.
 */
const PayoutSummaryCard = ({ payout }: { payout: PayoutRow }): JSX.Element => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Referensi</p>
                <p className="mt-0.5 font-mono text-xs text-gray-700 dark:text-gray-200">{payout.reference}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Jumlah</p>
                <p className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white">{formatIdr(payout.amount)}</p>
            </div>
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Account Manager</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                {payout.account_manager?.user?.name ?? '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{payout.account_manager?.user?.email ?? ''}</p>
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Tujuan transfer</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                {payout.bank_name} — {payout.bank_account_number}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">a/n {payout.bank_account_name}</p>
        </div>
    </div>
);

const ApproveModal = ({ payout, open, onClose }: { payout: PayoutRow | null; open: boolean; onClose: () => void }) => {
    const { post, processing } = useForm({});

    if (!payout) {
        return null;
    }

    const submit = () => {
        post(route('module.payouts.approve', { payout: payout.id }), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <ModalShell open={open} onClose={onClose}>
            <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-700">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <CheckCircleIcon />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Setujui Pencairan</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Permintaan pencairan akan ditandai sebagai disetujui. Lakukan transfer ke rekening tujuan kemudian
                        klik "Tandai dibayar" setelahnya.
                    </p>
                </div>
            </div>
            <div className="px-6 py-5">
                <PayoutSummaryCard payout={payout} />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/30">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={submit}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                    {processing && (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    )}
                    {processing ? 'Memproses...' : 'Ya, setujui'}
                </button>
            </div>
        </ModalShell>
    );
};

const REJECT_REASON_PRESETS = [
    'Nomor rekening tidak valid setelah verifikasi.',
    'Nama pemilik rekening tidak sesuai.',
    'Saldo komisi tidak sesuai dengan riwayat.',
    'Pencairan duplikat (sudah pernah dibayarkan).',
];

const RejectModal = ({ payout, open, onClose }: { payout: PayoutRow | null; open: boolean; onClose: () => void }) => {
    const { data, setData, post, processing, errors, reset } = useForm({ rejection_reason: '' });

    useEffect(() => {
        if (!open) {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!payout) {
        return null;
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('module.payouts.reject', { payout: payout.id }), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <ModalShell open={open} onClose={onClose}>
            <form onSubmit={submit}>
                <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-700">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        <XCircleIcon />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tolak Pencairan</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Saldo <span className="font-semibold text-gray-900 dark:text-gray-100">{formatIdr(payout.amount)}</span>{' '}
                            akan otomatis dikembalikan ke wallet account manager.
                        </p>
                    </div>
                </div>
                <div className="space-y-4 px-6 py-5">
                    <PayoutSummaryCard payout={payout} />

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Pilih alasan cepat
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {REJECT_REASON_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setData('rejection_reason', preset)}
                                    className={`rounded-full border px-3 py-1 text-xs transition ${
                                        data.rejection_reason === preset
                                            ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/40 dark:text-red-200'
                                            : 'border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="rejection_reason" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Alasan penolakan
                        </label>
                        <textarea
                            id="rejection_reason"
                            rows={4}
                            value={data.rejection_reason}
                            onChange={(e) => setData('rejection_reason', e.target.value)}
                            placeholder="Tulis alasan detail (min. 5 karakter)..."
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            required
                            minLength={5}
                            maxLength={500}
                        />
                        <div className="mt-1 flex items-center justify-between">
                            {errors.rejection_reason ? (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.rejection_reason}</p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">{data.rejection_reason.length}/500</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/30">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing || data.rejection_reason.length < 5}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing && (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        )}
                        {processing ? 'Memproses...' : 'Tolak & kembalikan saldo'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
};

const MarkPaidModal = ({ payout, open, onClose }: { payout: PayoutRow | null; open: boolean; onClose: () => void }) => {
    const { post, processing } = useForm({});

    if (!payout) {
        return null;
    }

    const submit = () => {
        post(route('module.payouts.mark-paid', { payout: payout.id }), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <ModalShell open={open} onClose={onClose}>
            <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-700">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                    <BanknotesIcon />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tandai sebagai Dibayarkan</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Pastikan transfer ke rekening tujuan sudah berhasil sebelum menandai pencairan ini sebagai dibayarkan.
                    </p>
                </div>
            </div>
            <div className="px-6 py-5">
                <PayoutSummaryCard payout={payout} />
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <p className="font-semibold">Catatan:</p>
                    <p className="mt-0.5">Status ini bersifat final dan tidak dapat diubah kembali.</p>
                </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/30">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={submit}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                >
                    {processing && (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    )}
                    {processing ? 'Memproses...' : 'Tandai sudah dibayar'}
                </button>
            </div>
        </ModalShell>
    );
};

export default function PayoutApprovalsIndex({ payouts, filters, stats }: Props): JSX.Element {
    const { flash } = usePage<{ flash: Flash }>().props;
    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status ?? '');
    const [actionTarget, setActionTarget] = useState<{ payout: PayoutRow; action: ActionVariant } | null>(null);

    const closeModal = (): void => setActionTarget(null);

    const applyFilters = (overrides: Partial<{ search: string; status: string }> = {}): void => {
        router.get(
            route('module.payouts.index'),
            {
                search: overrides.search ?? search,
                status: overrides.status ?? statusFilter,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                    Persetujuan Pencairan Komisi
                </h2>
            }
        >
            <Head title="Persetujuan Pencairan" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Menunggu" value={stats.pending_count} accent="amber" />
                    <StatCard label="Disetujui" value={stats.approved_count} accent="cyan" />
                    <StatCard label="Dibayarkan" value={stats.paid_count} accent="emerald" />
                    <StatCard label="Ditolak" value={stats.rejected_count} accent="red" />
                    <StatCard label="Nilai menunggu" value={formatIdr(stats.pending_amount)} accent="amber" />
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                type="text"
                                placeholder="Cari referensi, nama, email, atau username..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:max-w-md"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="block rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="">Semua status</option>
                                <option value="pending">Menunggu</option>
                                <option value="approved">Disetujui</option>
                                <option value="paid">Dibayarkan</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => applyFilters()}
                                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                            >
                                Cari
                            </button>
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
                                        Account Manager
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
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {payouts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Tidak ada permintaan pencairan.
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {row.account_manager?.user ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {row.account_manager.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {row.account_manager.user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Saldo: {formatIdr(row.account_manager.wallet_balance)}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
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
                                                    {row.bank_account_number}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    a/n {row.bank_account_name}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                                                >
                                                    {row.status_label}
                                                </span>
                                                {row.rejection_reason && (
                                                    <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">
                                                        {row.rejection_reason}
                                                    </p>
                                                )}
                                                {row.processed_at && (
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDateTime(row.processed_at)}
                                                        {row.processed_by && ` oleh ${row.processed_by.name}`}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                <div className="flex flex-wrap justify-end gap-1">
                                                    {row.status === 'pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActionTarget({ payout: row, action: 'approve' })}
                                                                className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActionTarget({ payout: row, action: 'reject' })}
                                                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </>
                                                    )}
                                                    {row.status === 'approved' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActionTarget({ payout: row, action: 'mark-paid' })}
                                                                className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500"
                                                            >
                                                                Tandai dibayar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActionTarget({ payout: row, action: 'reject' })}
                                                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
                                                            >
                                                                Batalkan
                                                            </button>
                                                        </>
                                                    )}
                                                    {(row.status === 'paid' || row.status === 'rejected') && (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </div>
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

            <ApproveModal
                payout={actionTarget?.action === 'approve' ? actionTarget.payout : null}
                open={actionTarget?.action === 'approve'}
                onClose={closeModal}
            />
            <RejectModal
                payout={actionTarget?.action === 'reject' ? actionTarget.payout : null}
                open={actionTarget?.action === 'reject'}
                onClose={closeModal}
            />
            <MarkPaidModal
                payout={actionTarget?.action === 'mark-paid' ? actionTarget.payout : null}
                open={actionTarget?.action === 'mark-paid'}
                onClose={closeModal}
            />
        </DynamicLayout>
    );
}

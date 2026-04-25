import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface AccountManager {
    id: number;
    referral_code: string;
    user: { name: string; email: string };
}

interface DownlineUser {
    id: number;
    name: string;
    email: string;
    username: string | null;
    status: string;
}

interface ReferralRelation {
    id: number;
    referral_code: string;
    status: string;
    notes: string | null;
    created_at: string;
    account_manager: AccountManager;
    user: DownlineUser;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRelations {
    data: ReferralRelation[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    referralRelations: PaginatedRelations;
    filters: { search: string | null; status: string | null };
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}>
            {labels[status] ?? status}
        </span>
    );
};

const RejectModal = ({
    relation,
    onClose,
}: {
    relation: ReferralRelation;
    onClose: () => void;
}) => {
    const { data, setData, post, processing, errors } = useForm({ notes: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('module.referral-approvals.reject', { referralRelation: relation.id }), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tolak Pengajuan</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Tolak pengajuan downline dari <span className="font-medium">{relation.user.name}</span>
                    </p>
                </div>
                <form onSubmit={submit} className="space-y-4 p-6">
                    <div>
                        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
                            Alasan penolakan (opsional)
                        </label>
                        <textarea
                            id="notes"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="Tuliskan alasan penolakan..."
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Tolak'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ApproveButton = ({ relation }: { relation: ReferralRelation }) => {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('module.referral-approvals.approve', { referralRelation: relation.id }));
    };

    return (
        <form onSubmit={submit}>
            <button
                type="submit"
                disabled={processing}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
                {processing ? '...' : 'Setujui'}
            </button>
        </form>
    );
};

export default function Index({ referralRelations, filters }: Props): JSX.Element {
    const [search, setSearch] = useState(filters.search ?? '');
    const [rejectTarget, setRejectTarget] = useState<ReferralRelation | null>(null);
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('module.referral-approvals.index'), { search: search || undefined, status: filters.status || undefined }, { preserveState: true });
    };

    const handleStatusFilter = (status: string | null) => {
        router.get(route('module.referral-approvals.index'), { search: filters.search || undefined, status: status || undefined }, { preserveState: true });
    };

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Persetujuan Referral
                </h2>
            }
        >
            <Head title="Persetujuan Referral" />

            {rejectTarget && (
                <RejectModal relation={rejectTarget} onClose={() => setRejectTarget(null)} />
            )}

            {flash.success && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 ring-1 ring-green-200">
                    {flash.success}
                </div>
            )}

            {flash.error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                    {flash.error}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email..."
                            className="w-64 rounded-lg border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Status filter */}
                <div className="flex gap-2">
                    {[null, 'pending', 'approved', 'rejected'].map((s) => (
                        <button
                            key={s ?? 'all'}
                            onClick={() => handleStatusFilter(s)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                filters.status === s
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {s === null ? 'Semua' : s === 'pending' ? 'Menunggu' : s === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    {referralRelations.data.length === 0 ? (
                        <div className="px-6 py-16 text-center text-sm text-gray-400">
                            Tidak ada pengajuan referral.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Account Manager</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {referralRelations.data.map((relation) => (
                                    <tr key={relation.id}>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{relation.user.name}</p>
                                            <p className="text-xs text-gray-500">{relation.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{relation.account_manager.user.name}</p>
                                            <p className="font-mono text-xs text-gray-400">{relation.account_manager.referral_code}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={relation.status} />
                                            {relation.notes && (
                                                <p className="mt-1 text-xs text-red-500">{relation.notes}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(relation.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {relation.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <ApproveButton relation={relation} />
                                                    <button
                                                        onClick={() => setRejectTarget(relation)}
                                                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {referralRelations.total > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                            <p className="text-xs text-gray-500">
                                Menampilkan {referralRelations.from}–{referralRelations.to} dari {referralRelations.total} data
                            </p>
                            <div className="flex gap-1">
                                {referralRelations.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`rounded px-3 py-1 text-xs ${
                                            link.active
                                                ? 'bg-cyan-600 text-white'
                                                : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'cursor-not-allowed text-gray-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DynamicLayout>
    );
}

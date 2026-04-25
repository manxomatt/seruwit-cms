import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface UserProfile {
    first_name: string | null;
    last_name: string | null;
}

interface DownlineUser {
    id: number;
    name: string;
    email: string;
    username: string | null;
    profile: UserProfile | null;
}

interface Downline {
    id: number;
    referral_code: string;
    status: string;
    created_at: string;
    approved_at: string | null;
    notes: string | null;
    user: DownlineUser;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDownlines {
    data: Downline[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    downlines: PaginatedDownlines;
    pendingCount: number;
    filters: {
        search: string | null;
        status: string | null;
    };
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

const PlusIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const UserPlusIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
);

export default function Index({ downlines, pendingCount, filters }: Props): JSX.Element {
    const [search, setSearch] = useState(filters.search ?? '');
    const { flash } = usePage<{ flash: { error?: string; success?: string } }>().props;

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('account-manager.downlines.index'), { search: search || undefined, status: filters.status || undefined }, { preserveState: true });
    };

    const handleStatusFilter = (status: string | null) => {
        router.get(route('account-manager.downlines.index'), { search: filters.search || undefined, status: status || undefined }, { preserveState: true });
    };

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Downline Saya
                </h2>
            }
        >
            <Head title="Downline Saya" />

            <div className="space-y-6">
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}
                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {/* Action bar */}
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

                    <div className="flex gap-2">
                        <Link
                            href={route('account-manager.downlines.assign')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            <UserPlusIcon />
                            Request Assign User
                        </Link>
                        <Link
                            href={route('account-manager.downlines.create')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700"
                        >
                            <PlusIcon />
                            Buat Downline Baru
                        </Link>
                    </div>
                </div>

                {/* Pending warning */}
                {pendingCount > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Ada <span className="font-semibold">{pendingCount}</span> pengajuan menunggu persetujuan admin.
                    </div>
                )}

                {/* Status filter */}
                <div className="flex gap-2">
                    {[null, 'approved', 'pending', 'rejected'].map((s) => (
                        <button
                            key={s ?? 'all'}
                            onClick={() => handleStatusFilter(s)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                filters.status === s
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {s === null ? 'Semua' : s === 'approved' ? 'Disetujui' : s === 'pending' ? 'Menunggu' : 'Ditolak'}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    {downlines.data.length === 0 ? (
                        <div className="px-6 py-16 text-center text-sm text-gray-400">
                            Belum ada downline.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kode Referral</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {downlines.data.map((downline) => (
                                    <tr key={downline.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {downline.user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{downline.user.email}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-700">{downline.referral_code}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={downline.status} />
                                            {downline.status === 'rejected' && downline.notes && (
                                                <p className="mt-1 text-xs text-red-500">{downline.notes}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(downline.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {downlines.total > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                            <p className="text-xs text-gray-500">
                                Menampilkan {downlines.from}–{downlines.to} dari {downlines.total} data
                            </p>
                            <div className="flex gap-1">
                                {downlines.links.map((link, i) => (
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

import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface AccountManager {
    id: number;
    referral_code: string;
    user: { id: number; name: string; email: string };
}

interface PendingUser {
    id: number;
    name: string;
    email: string;
    username: string | null;
    status: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: PendingUser[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    accountManager: AccountManager;
    users: PaginatedUsers;
    filters: { search: string | null };
}

const ArrowLeftIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const AssignButton = ({ userId, accountManagerId }: { userId: number; accountManagerId: number }) => {
    const { post, processing, errors } = useForm({ user_id: userId });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('module.account-managers.assign-downline.store', { accountManager: accountManagerId }));
    };

    return (
        <form onSubmit={submit}>
            {errors.user_id && <p className="mb-1 text-xs text-red-500">{errors.user_id}</p>}
            <button
                type="submit"
                disabled={processing}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
            >
                {processing ? 'Memproses...' : 'Assign'}
            </button>
        </form>
    );
};

export default function AssignDownline({ accountManager, users, filters }: Props): JSX.Element {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('module.account-managers.assign-downline', { accountManager: accountManager.id }),
            { search: search || undefined },
            { preserveState: true },
        );
    };

    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('module.account-managers.show', { accountManager: accountManager.id })}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
                    >
                        <ArrowLeftIcon />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assign Downline</h1>
                        <p className="text-sm text-gray-500">
                            AM: {accountManager.user.name} ({accountManager.referral_code})
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Assign Downline ke AM" />

            <div className="space-y-6">
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Assign user secara langsung ke Account Manager ini. Persetujuan langsung diberikan tanpa menunggu.
                </div>

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

                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    {users.data.length === 0 ? (
                        <div className="px-6 py-16 text-center text-sm text-gray-400">
                            Tidak ada user yang tersedia untuk di-assign.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.status}</td>
                                        <td className="px-6 py-4 text-right">
                                            <AssignButton userId={user.id} accountManagerId={accountManager.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {users.total > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                            <p className="text-xs text-gray-500">
                                Menampilkan {users.from}–{users.to} dari {users.total} data
                            </p>
                            <div className="flex gap-1">
                                {users.links.map((link, i) => (
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

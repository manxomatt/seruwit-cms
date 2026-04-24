import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, router } from '@inertiajs/react';

interface UserPrivileges {
    type: string;
}

interface UserInfo {
    name: string;
    company: string;
}

interface ExternalUser {
    id: number;
    username: string;
    email: string;
    active: string;
    privileges: UserPrivileges;
    info: UserInfo | null;
    dt_reg: string;
    dt_login: string | null;
}

interface Pagination {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

interface Props {
    users: ExternalUser[];
    pagination: Pagination | null;
    error: string | null;
}

const UsersIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const ExclamationIcon = () => (
    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const formatDate = (dateString: string | null): string => {
    if (!dateString) {
        return '-';
    }
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const StatusBadge = ({ active }: { active: string }) => {
    const isActive = active === 'true';
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
            {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
    );
};

const RoleBadge = ({ type }: { type: string }) => (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 capitalize">
        {type}
    </span>
);

export default function Index({ users, pagination, error }: Props): JSX.Element {
    const handlePageChange = (page: number): void => {
        router.get(
            route('external.users.index'),
            { page, per_page: pagination?.per_page ?? 15 },
            { preserveState: true, preserveScroll: true },
        );
    };

    const renderPagination = (): JSX.Element | null => {
        if (!pagination || pagination.last_page <= 1) {
            return null;
        }

        const { current_page, last_page, from, to, total } = pagination;

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                        Menampilkan{' '}
                        <span className="font-medium">{from}</span>
                        {' '}–{' '}
                        <span className="font-medium">{to}</span>
                        {' '}dari{' '}
                        <span className="font-medium">{total}</span>
                        {' '}pengguna
                    </p>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => handlePageChange(current_page - 1)}
                            disabled={current_page <= 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon />
                        </button>

                        {Array.from({ length: last_page }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2)
                            .reduce<(number | null)[]>((acc, p, idx, arr) => {
                                if (idx > 0 && arr[idx - 1] !== p - 1) {
                                    acc.push(null);
                                }
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === null ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                                            p === current_page
                                                ? 'z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'
                                                : 'text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ),
                            )}

                        <button
                            onClick={() => handlePageChange(current_page + 1)}
                            disabled={current_page >= last_page}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon />
                        </button>
                    </nav>
                </div>

                {/* Mobile pagination */}
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(current_page - 1)}
                        disabled={current_page <= 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-sm text-gray-700 self-center">
                        {current_page} / {last_page}
                    </span>
                    <button
                        onClick={() => handlePageChange(current_page + 1)}
                        disabled={current_page >= last_page}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        );
    };

    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-3">
                    <UsersIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Daftar Pengguna Eksternal
                    </h2>
                    {pagination && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                            {pagination.total} total
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Daftar Pengguna Eksternal" />

            <div className="space-y-4">
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <ExclamationIcon />
                        <div>
                            <p className="font-medium text-red-800">Gagal memuat data</p>
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {!error && (
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Pengguna
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Perusahaan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Terdaftar
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Login Terakhir
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                                Tidak ada pengguna ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.info?.name || user.username}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            @{user.username}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <p className="text-sm text-gray-700">
                                                        {user.info?.company || '-'}
                                                    </p>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <RoleBadge type={user.privileges.type} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <StatusBadge active={user.active} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(user.dt_reg)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(user.dt_login)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination()}
                    </div>
                )}
            </div>
        </DynamicLayout>
    );
}

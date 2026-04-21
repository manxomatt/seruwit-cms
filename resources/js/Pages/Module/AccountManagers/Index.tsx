import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface Profile {
    first_name: string;
    last_name: string | null;
    phone_number: string | null;
    full_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    username: string | null;
    status: string;
    profile: Profile | null;
}

interface AccountManager {
    id: number;
    referral_code: string;
    wallet_balance: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: User;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated {
    data: AccountManager[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

interface Props {
    accountManagers: Paginated;
    filters: {
        search: string | null;
        status: string | null;
    };
}

const PlusIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export default function Index({ accountManagers, filters }: Props): JSX.Element {
    return (
        <DynamicLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Account Managers
                    </h1>
                    <Link
                        href={route('module.account-managers.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                    >
                        <PlusIcon />
                        New Account Manager
                    </Link>
                </div>
            }
        >
            <Head title="Account Managers" />

            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {accountManagers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No account managers found.
                                    </td>
                                </tr>
                            ) : (
                                accountManagers.data.map((am) => (
                                    <tr key={am.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {am.user.profile?.full_name ?? am.user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{am.user.email}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{am.referral_code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {parseFloat(am.wallet_balance).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${am.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {am.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link
                                                href={route('module.account-managers.show', am.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DynamicLayout>
    );
}

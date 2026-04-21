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

interface WalletTransaction {
    id: number;
    type: string;
    amount: string;
    balance_before: string;
    balance_after: string;
    description: string | null;
    created_at: string;
}

interface Commission {
    id: number;
    commission_type: string;
    commission_amount: string;
    status: string;
    created_at: string;
}

interface AccountManager {
    id: number;
    referral_code: string;
    wallet_balance: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: User;
    wallet_transactions: WalletTransaction[];
    commissions: Commission[];
}

interface Props {
    accountManager: AccountManager;
}

const ArrowLeftIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export default function Show({ accountManager }: Props): JSX.Element {
    const profile = accountManager.user.profile;

    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('module.account-managers.index')}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                    >
                        <ArrowLeftIcon />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Account Manager Detail
                    </h1>
                </div>
            }
        >
            <Head title="Account Manager Detail" />

            <div className="space-y-6 max-w-4xl">
                {/* Profile Card */}
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile?.full_name ?? accountManager.user.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{accountManager.user.email}</dd>
                        </div>
                        {profile?.phone_number && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                <dd className="mt-1 text-sm text-gray-900">{profile.phone_number}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${accountManager.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {accountManager.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Referral Code</dt>
                            <dd className="mt-1 text-sm font-mono text-gray-900">{accountManager.referral_code}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Wallet Balance</dt>
                            <dd className="mt-1 text-sm font-semibold text-gray-900">
                                {parseFloat(accountManager.wallet_balance).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Wallet Transactions */}
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Wallet Transactions</h2>
                    {accountManager.wallet_transactions.length === 0 ? (
                        <p className="text-sm text-gray-500">No transactions yet.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Balance After</th>
                                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {accountManager.wallet_transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="py-3 text-sm capitalize text-gray-900">{tx.type}</td>
                                        <td className="py-3 text-sm text-gray-900">{parseFloat(tx.amount).toLocaleString('id-ID')}</td>
                                        <td className="py-3 text-sm text-gray-900">{parseFloat(tx.balance_after).toLocaleString('id-ID')}</td>
                                        <td className="py-3 text-sm text-gray-500">{tx.description ?? '-'}</td>
                                        <td className="py-3 text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DynamicLayout>
    );
}

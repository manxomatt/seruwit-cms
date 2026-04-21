import DynamicLayout from '@/Layouts/DynamicLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const ArrowLeftIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export default function Create(): JSX.Element {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        status: 'active',
        initial_wallet_balance: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('module.account-managers.store'));
    };

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
                        Create Account Manager
                    </h1>
                </div>
            }
        >
            <Head title="Create Account Manager" />

            <div className="max-w-2xl">
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    <form onSubmit={submit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="first_name" value="First Name" />
                                <TextInput
                                    id="first_name"
                                    className="mt-1 block w-full"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.first_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="last_name" value="Last Name" />
                                <TextInput
                                    id="last_name"
                                    className="mt-1 block w-full"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                />
                                <InputError message={errors.last_name} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone_number" value="Phone Number" />
                            <TextInput
                                id="phone_number"
                                className="mt-1 block w-full"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                            />
                            <InputError message={errors.phone_number} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password (leave empty to auto-generate)" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="initial_wallet_balance" value="Initial Wallet Balance" />
                                <TextInput
                                    id="initial_wallet_balance"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.initial_wallet_balance}
                                    onChange={(e) => setData('initial_wallet_balance', e.target.value)}
                                    placeholder="0"
                                />
                                <InputError message={errors.initial_wallet_balance} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link
                                href={route('module.account-managers.index')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Creating...' : 'Create Account Manager'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DynamicLayout>
    );
}

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
        username: '',
        email: '',
        password: '',
        role: 'external_user',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('account-manager.downlines.store'));
    };

    return (
        <DynamicLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('account-manager.downlines.index')}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
                    >
                        <ArrowLeftIcon />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Buat Downline Baru
                    </h1>
                </div>
            }
        >
            <Head title="Buat Downline Baru" />

            <div className="max-w-2xl">
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-sm text-gray-500">
                            Akun akan dibuat di sistem eksternal dan membutuhkan persetujuan admin sebelum user dapat login.
                        </p>
                    </div>
                    <form onSubmit={submit} className="space-y-6 p-6">
                        {errors.external && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errors.external}
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="username" value="Username" />
                            <TextInput
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="off"
                            />
                            <InputError message={errors.username} className="mt-2" />
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
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Role" />
                            <select
                                id="role"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            >
                                <option value="external_user">External User</option>
                                <option value="external_manager">External Manager</option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <Link
                                href={route('account-manager.downlines.index')}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Buat Downline'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DynamicLayout>
    );
}

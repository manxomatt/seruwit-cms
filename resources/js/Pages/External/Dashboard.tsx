import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, usePage } from '@inertiajs/react';

interface LocalUser {
    name: string;
    email: string;
    username: string;
}

interface RoleSummary {
    name: string;
    slug: string;
}

interface BillingUser {
    id: number;
    username: string;
    email: string;
    active: string;
    manager_id: number;
    role: string;
    privileges: Record<string, boolean | string>;
    account_expire: string;
    account_expire_dt: string | null;
    obj_add: string;
    obj_limit: string;
    obj_limit_num: number;
    obj_days: string;
    obj_days_dt: string | null;
    currency: string;
    timezone: string;
    language: string;
    dt_reg: string;
    dt_login: string | null;
}

interface BillingQuota {
    obj_limit_num: number;
    objects_assigned: number;
    objects_trial_linked: number;
    linked_objects_total: number;
    objects_remaining: number;
    objects_expired: number;
    objects_expired_non_trial: number;
    objects_expired_trial: number;
}

interface Flash {
    success?: string;
}

interface Props {
    user: LocalUser;
    primaryRole: RoleSummary | null;
    billingUser: BillingUser | null;
    billingQuota: BillingQuota | null;
    billingError: string | null;
    quotaCartUrl: string;
    deviceExtensionUrl: string;
    objectsUrl: string;
}

const ExclamationIcon = () => (
    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const formatDateTime = (value: string | null): string => {
    if (!value) {
        return '—';
    }
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const YesNoBadge = ({ value }: { value: string }) => {
    const ok = value === 'true';
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                ok ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
        >
            {ok ? 'Ya' : 'Tidak'}
        </span>
    );
};

const StatCard = ({ label, value }: { label: string; value: string | number }): JSX.Element => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
);

const greetingForHour = (hour: number): string => {
    if (hour >= 4 && hour < 11) {
        return 'Selamat pagi';
    }
    if (hour >= 11 && hour < 15) {
        return 'Selamat siang';
    }
    if (hour >= 15 && hour < 19) {
        return 'Selamat sore';
    }
    return 'Selamat malam';
};

const formatTodayId = (date: Date): string =>
    date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join('') || 'U';
};

export default function Dashboard({
    user,
    primaryRole,
    billingUser,
    billingQuota,
    billingError,
    quotaCartUrl,
    deviceExtensionUrl,
    objectsUrl,
}: Props): JSX.Element {
    const { flash } = usePage<{ flash: Flash }>().props;

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {primaryRole ? `${primaryRole.name} Dashboard` : 'Dashboard'}
                </h2>
            }
        >
            <Head title={primaryRole ? `${primaryRole.name} Dashboard` : 'Dashboard'} />

            <div className="space-y-6">
                {flash?.success !== undefined && flash.success !== null && flash.success !== '' && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-6 shadow-xl ring-1 ring-white/10 sm:p-8">
                    <div
                        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl"
                        aria-hidden
                    />
                    <svg
                        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.07]"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                    >
                        <defs>
                            <pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="200" height="200" fill="url(#hero-grid)" />
                    </svg>

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 sm:h-16 sm:w-16">
                                <span className="text-xl font-bold text-white sm:text-2xl">
                                    {getInitials(user.name)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-cyan-200/90">
                                    {greetingForHour(new Date().getHours())} ✨
                                </p>
                                <h3 className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">{user.name}</h3>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cyan-100/80">
                                    <span className="inline-flex items-center gap-1">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                        @{user.username}
                                    </span>
                                    {primaryRole && (
                                        <span className="inline-flex items-center gap-1">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {primaryRole.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative flex shrink-0 items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur ring-1 ring-white/20">
                            <svg className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-200/80">Hari ini</p>
                                <p className="text-sm font-semibold text-white">{formatTodayId(new Date())}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {billingError !== null && (
                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
                        <ExclamationIcon />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-200">Gagal memuat profil billing</p>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{billingError}</p>
                        </div>
                    </div>
                )}

                {billingUser !== null && (
                    <>
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Akun billing</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Data dari API billing (autentikasi server)
                                </p>
                            </div>
                            <div className="grid gap-6 p-6 sm:grid-cols-2">
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">ID</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.id}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Username</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.username}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                                        <dd className="break-all font-medium text-gray-900 dark:text-gray-100">{billingUser.email}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Peran</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.role}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Tipe hak</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">
                                            {String(billingUser.privileges.type ?? '—')}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Aktif</dt>
                                        <dd>
                                            <YesNoBadge value={billingUser.active} />
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Manager ID</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.manager_id}</dd>
                                    </div>
                                </dl>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Mata uang</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.currency}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Zona waktu</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.timezone}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Bahasa</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{billingUser.language}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Terdaftar</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(billingUser.dt_reg)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Login terakhir</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(billingUser.dt_login)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Akun kedaluwarsa</dt>
                                        <dd>
                                            <YesNoBadge value={billingUser.account_expire} />
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Tambah objek</dt>
                                        <dd>
                                            <YesNoBadge value={billingUser.obj_add} />
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Limit objek</dt>
                                        <dd className="font-medium text-gray-900 dark:text-gray-100">
                                            <YesNoBadge value={billingUser.obj_limit} />
                                            {billingUser.obj_limit === 'true' && (
                                                <span className="ml-2 text-gray-600 dark:text-gray-300">({billingUser.obj_limit_num})</span>
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {billingQuota !== null && (
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Kuota objek</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Butuh slot tambahan? Ajukan melalui cart kuota.
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                                    <Link
                                        href={quotaCartUrl}
                                        className="inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                                    >
                                        Request penambahan kuota
                                    </Link>
                                    </div>
                                </div>
                                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatCard label="Limit objek" value={billingQuota.obj_limit_num} />
                                    <StatCard label="Objek ter-assign" value={billingQuota.objects_assigned} />
                                    <StatCard label="Total terhubung" value={billingQuota.linked_objects_total} />
                                    <StatCard label="Sisa slot" value={billingQuota.objects_remaining} />
                                    <StatCard label="Trial terhubung" value={billingQuota.objects_trial_linked} />
                                    <StatCard label="Kedaluwarsa" value={billingQuota.objects_expired} />
                                    <StatCard label="Kedaluwarsa (non-trial)" value={billingQuota.objects_expired_non_trial} />
                                    <StatCard label="Kedaluwarsa (trial)" value={billingQuota.objects_expired_trial} />
                                </div>
                            </div>
                        )}

                    </>
                )}
            </div>
        </DynamicLayout>
    );
}

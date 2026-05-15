import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface DeviceObject {
    name: string;
    icon: string;
    object_expire_dt: string | null;
    trial: string;
    device_identifier: string;
}

interface Props {
    objects: DeviceObject[];
    error: string | null;
    externalAppUrl: string;
}

const buildDeviceExtensionConfirmUrl = (object: DeviceObject): string => {
    const params = new URLSearchParams();
    params.set('device_identifier', object.device_identifier);
    if (object.name.trim() !== '') {
        params.set('device_label', object.name);
    }
    if (object.object_expire_dt) {
        params.set('object_expire_dt', object.object_expire_dt);
    }
    return `${route('external.billing.device-extension.confirm')}?${params.toString()}`;
};

const ExclamationIcon = () => (
    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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

const CubeIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
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

const TrialBadge = ({ trial }: { trial: string }) => {
    const isTrial = trial === 'true';
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isTrial ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
        >
            {isTrial ? 'Trial' : 'Full'}
        </span>
    );
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function Index({ objects, error, externalAppUrl }: Props): JSX.Element {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
    const pageProps = usePage().props as { errors?: Record<string, string> };
    const inertiaErrors = pageProps.errors ?? {};
    const inertiaErrorMessages = Object.values(inertiaErrors).filter(Boolean);

    const totalItems = objects.length;
    const lastPage = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(currentPage, lastPage);
    const from = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
    const to = Math.min(safePage * perPage, totalItems);
    const paginated = objects.slice(from - 1, to);

    const handlePageChange = (page: number): void => {
        setCurrentPage(Math.max(1, Math.min(page, lastPage)));
    };

    const handlePerPageChange = (value: number): void => {
        setPerPage(value);
        setCurrentPage(1);
    };

    const renderPagination = (): JSX.Element | null => {
        if (totalItems === 0) {
            return null;
        }

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-700">
                            Menampilkan{' '}
                            <span className="font-medium">{from}</span>
                            {' '}–{' '}
                            <span className="font-medium">{to}</span>
                            {' '}dari{' '}
                            <span className="font-medium">{totalItems}</span>
                            {' '}object
                        </p>
                        <div className="flex items-center gap-2">
                            <label htmlFor="per-page" className="text-sm text-gray-500">
                                Per halaman:
                            </label>
                            <select
                                id="per-page"
                                value={perPage}
                                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {PER_PAGE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {lastPage > 1 && (
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(safePage - 1)}
                                disabled={safePage <= 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon />
                            </button>

                            {Array.from({ length: lastPage }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === lastPage || Math.abs(p - safePage) <= 2)
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
                                                p === safePage
                                                    ? 'z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'
                                                    : 'text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}

                            <button
                                onClick={() => handlePageChange(safePage + 1)}
                                disabled={safePage >= lastPage}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon />
                            </button>
                        </nav>
                    )}
                </div>

                {/* Mobile pagination */}
                <div className="flex flex-1 items-center justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(safePage - 1)}
                        disabled={safePage <= 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-sm text-gray-700">
                        {safePage} / {lastPage}
                    </span>
                    <button
                        onClick={() => handlePageChange(safePage + 1)}
                        disabled={safePage >= lastPage}
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
                    <CubeIcon />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Daftar Object
                    </h2>
                    {totalItems > 0 && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                            {totalItems} total
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Daftar Object" />

            <div className="space-y-4">
                {inertiaErrorMessages.length > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <ExclamationIcon />
                        <div>
                            <p className="font-medium text-amber-900">Tidak dapat membuka halaman konfirmasi</p>
                            <ul className="mt-1 list-inside list-disc text-sm text-amber-800">
                                {inertiaErrorMessages.map((msg, i) => (
                                    <li key={i}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
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
                                        <th className="w-12 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Nama Object
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Expired
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                                Tidak ada data object ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((object, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="w-12 px-4 py-4 text-center text-sm text-gray-400">
                                                    {from + index}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {object.icon ? (
                                                            <img
                                                                src={`${externalAppUrl}/${object.icon}`}
                                                                alt={object.name}
                                                                className="h-8 w-8 flex-shrink-0 object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="h-8 w-8 flex-shrink-0" />
                                                        )}
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {object.name || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <TrialBadge trial={object.trial} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(object.object_expire_dt)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                    {object.device_identifier ? (
                                                        <Link
                                                            href={buildDeviceExtensionConfirmUrl(object)}
                                                            className="font-medium text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300"
                                                        >
                                                            Perpanjang
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400" title="Identitas perangkat tidak tersedia dari API">
                                                            —
                                                        </span>
                                                    )}
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

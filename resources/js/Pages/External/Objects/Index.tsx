import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head } from '@inertiajs/react';

interface DeviceObject {
    name: string;
    icon: string;
    object_expire_dt: string | null;
    trial: string;
}

interface Props {
    objects: DeviceObject[];
    error: string | null;
    externalAppUrl: string;
}

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

export default function Index({ objects, error, externalAppUrl }: Props): JSX.Element {
    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Objects
                </h2>
            }
        >
            <Head title="Objects" />

            {error && (
                <div className="mb-6 overflow-hidden rounded-lg bg-red-50 shadow-sm dark:bg-red-900/20">
                    <div className="flex items-start gap-3 p-4">
                        <ExclamationIcon />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-300">Gagal Memuat Data</p>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                {objects.length === 0 && !error ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Tidak ada data object ditemukan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                    >
                                        Nama
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                    >
                                        Expired
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {objects.map((object, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="whitespace-nowrap px-6 py-4">
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
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {object.name || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <TrialBadge trial={object.trial} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(object.object_expire_dt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DynamicLayout>
    );
}

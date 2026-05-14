import PrimaryButton from '@/Components/PrimaryButton';
import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    cartUrl: string;
    dashboardUrl: string;
    submitWaitingReviewUrl: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

const formatIdr = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

export default function Review({
    cartUrl,
    dashboardUrl,
    submitWaitingReviewUrl,
    quantity,
    unitPrice,
    total,
}: Props): JSX.Element {
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = (): void => {
        setSubmitting(true);
        router.post(submitWaitingReviewUrl, {}, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Review kuota</h2>
            }
        >
            <Head title="Review kuota" />

            <div className="space-y-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Periksa permintaan Anda</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Setelah dikonfirmasi, permintaan dikirim ke billing dan Anda akan melihat halaman status review.
                            Integrasi payment gateway dapat ditambahkan pada langkah berikutnya.
                        </p>
                    </div>
                    <div className="p-6">
                        <dl className="max-w-lg space-y-4 text-sm">
                            <div className="flex justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                                <dt className="text-gray-500 dark:text-gray-400">Jumlah kuota tambahan</dt>
                                <dd className="font-semibold text-gray-900 dark:text-white">
                                    {quantity.toLocaleString('id-ID')} slot
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                                <dt className="text-gray-500 dark:text-gray-400">Harga per kuota</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{formatIdr(unitPrice)}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-500 dark:text-gray-400">Total estimasi</dt>
                                <dd className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">{formatIdr(total)}</dd>
                            </div>
                        </dl>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <PrimaryButton type="button" disabled={submitting} onClick={handleConfirm}>
                                Konfirmasi dan kirim ke billing
                            </PrimaryButton>
                            <Link
                                href={cartUrl}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            >
                                Ubah di cart
                            </Link>
                            <Link
                                href={dashboardUrl}
                                className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                Kembali ke dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DynamicLayout>
    );
}

import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link } from '@inertiajs/react';

interface BillingTransactionSummary {
    reference: string;
    amount: number;
    currency: string;
    status: string;
}

interface DeviceSummary {
    identifier: string;
    label: string;
}

interface Props {
    flow: 'quota' | 'device_extension';
    success: boolean;
    quantity: number;
    errorMessage: string | null;
    cartUrl: string;
    reviewUrl: string;
    dashboardUrl: string;
    billingTransaction: BillingTransactionSummary | null;
    paymentCallbackUrl: string;
    deviceSummary: DeviceSummary | null;
}

const formatIdr = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

export default function WaitingReview({
    flow,
    success,
    quantity,
    errorMessage,
    cartUrl,
    reviewUrl,
    dashboardUrl,
    billingTransaction,
    paymentCallbackUrl,
    deviceSummary,
}: Props): JSX.Element {
    const isDevice = flow === 'device_extension';
    const pageTitle = isDevice ? 'Menunggu review perpanjangan' : 'Menunggu review kuota';

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {isDevice ? 'Konfirmasi pembayaran perpanjangan' : 'Menunggu review'}
                </h2>
            }
        >
            <Head title={pageTitle} />

            <div className="space-y-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="p-6">
                        {success ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
                                <div className="flex gap-4">
                                    <div className="shrink-0">
                                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/60">
                                            <svg
                                                className="h-7 w-7 text-amber-700 dark:text-amber-300"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                aria-hidden
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                                            {isDevice ? 'Perpanjangan dicatat — lanjutkan pembayaran' : 'Permintaan sedang ditinjau'}
                                        </h3>
                                        {isDevice ? (
                                            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                                                Transaksi perpanjangan masa aktif perangkat telah dibuat. Selesaikan
                                                pembayaran melalui payment gateway; gateway memanggil URL callback
                                                aplikasi setelah pembayaran.
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                                                Penambahan{' '}
                                                <span className="font-semibold">{quantity.toLocaleString('id-ID')} kuota</span>{' '}
                                                telah dicatat sebagai transaksi billing. Tim dapat meninjau permintaan
                                                Anda. Selesaikan pembayaran melalui payment gateway; gateway memanggil URL
                                                callback aplikasi ini setelah pembayaran.
                                            </p>
                                        )}
                                        {isDevice && deviceSummary !== null && (
                                            <div className="mt-3 rounded-md border border-amber-200/80 bg-white/70 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-gray-900/40 dark:text-amber-100">
                                                <p>
                                                    <span className="font-medium">Perangkat:</span>{' '}
                                                    {deviceSummary.label.trim() ? deviceSummary.label : '—'}
                                                </p>
                                                <p className="mt-1 break-all font-mono text-xs">
                                                    {deviceSummary.identifier}
                                                </p>
                                            </div>
                                        )}
                                        {billingTransaction !== null && (
                                            <div className="mt-4 rounded-md border border-amber-300/60 bg-white/80 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-gray-900/50 dark:text-amber-100">
                                                <p className="font-medium">Referensi transaksi (untuk gateway)</p>
                                                <p className="mt-1 font-mono text-xs break-all">{billingTransaction.reference}</p>
                                                <p className="mt-2">
                                                    Jumlah tagihan:{' '}
                                                    <span className="font-semibold">
                                                        {formatIdr(billingTransaction.amount)} ({billingTransaction.currency})
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/90">
                                                    Status: {billingTransaction.status}
                                                </p>
                                                <p className="mt-3 text-xs text-amber-800/90 dark:text-amber-200/90">
                                                    URL callback pembayaran (POST):{' '}
                                                    <span className="break-all font-mono text-[11px]">{paymentCallbackUrl}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                                    Permintaan tidak berhasil diproses
                                </h3>
                                <p className="mt-2 text-sm text-red-800 dark:text-red-200">
                                    {errorMessage ?? 'Terjadi kesalahan saat menghubungi sistem billing.'}
                                </p>
                                <p className="mt-3 text-sm text-red-800 dark:text-red-200">
                                    {isDevice
                                        ? 'Anda dapat kembali ke daftar object atau mencoba lagi dari halaman perpanjangan.'
                                        : 'Anda dapat mengubah jumlah di cart atau mencoba konfirmasi ulang dari halaman review jika data checkout masih tersedia.'}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href={cartUrl}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            >
                                {isDevice ? 'Ke daftar object' : 'Ke cart kuota'}
                            </Link>
                            {!isDevice && !success && (
                                <Link
                                    href={reviewUrl}
                                    className="inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                                >
                                    Kembali ke review
                                </Link>
                            )}
                            <Link
                                href={dashboardUrl}
                                className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DynamicLayout>
    );
}

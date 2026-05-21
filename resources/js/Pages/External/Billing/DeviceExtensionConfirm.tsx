import PrimaryButton from '@/Components/PrimaryButton';
import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type PaymentMethod = 'gateway' | 'quota';

interface ExtensionForm {
    device_identifier: string;
    device_label: string;
    payment_method: PaymentMethod;
}

interface Props {
    amount: number;
    device_identifier: string;
    device_label: string | null;
    object_expire_dt: string | null;
    objectsUrl: string;
    storeUrl: string;
    isManager: boolean;
    objectsRemaining: number | null;
    canPayWithQuota: boolean;
}

const formatIdr = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

const formatDate = (dateString: string | null): string => {
    if (!dateString) {
        return '—';
    }
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function DeviceExtensionConfirm({
    amount,
    device_identifier,
    device_label,
    object_expire_dt,
    objectsUrl,
    storeUrl,
    isManager,
    objectsRemaining,
    canPayWithQuota,
}: Props): JSX.Element {
    const form = useForm<ExtensionForm>({
        device_identifier,
        device_label: device_label ?? '',
        payment_method: 'gateway',
    });

    const submit = (e: FormEvent): void => {
        e.preventDefault();
        form.post(storeUrl, { preserveScroll: true });
    };

    const isQuota = form.data.payment_method === 'quota';

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Konfirmasi perpanjangan masa aktif
                </h2>
            }
        >
            <Head title="Konfirmasi perpanjangan" />

            <div className="space-y-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ringkasan</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Pastikan data perangkat benar sebelum melanjutkan ke pembayaran.
                        </p>
                    </div>
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Nama / label</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">
                                    {device_label?.trim() ? device_label : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Identitas perangkat</dt>
                                <dd className="break-all font-mono text-xs font-medium text-gray-900 dark:text-white">
                                    {device_identifier}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Berlaku hingga (sekarang)</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{formatDate(object_expire_dt)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Tarif perpanjangan</dt>
                                <dd className="font-semibold text-cyan-700 dark:text-cyan-300">
                                    {isQuota ? '1 slot kuota' : formatIdr(amount)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <form onSubmit={submit} className="p-6">
                        <div className="max-w-xl space-y-5">
                            {isManager && (
                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Metode pembayaran
                                    </legend>
                                    <label
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                                            form.data.payment_method === 'gateway'
                                                ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/30'
                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="gateway"
                                            checked={form.data.payment_method === 'gateway'}
                                            onChange={() => form.setData('payment_method', 'gateway')}
                                            className="mt-1 h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500 dark:border-gray-600"
                                        />
                                        <span className="flex-1">
                                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                                Bayar via payment gateway
                                            </span>
                                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                                Tarif {formatIdr(amount)} melalui instruksi pembayaran.
                                            </span>
                                        </span>
                                    </label>
                                    <label
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                                            !canPayWithQuota
                                                ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800/40'
                                                : form.data.payment_method === 'quota'
                                                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/30'
                                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="quota"
                                            disabled={!canPayWithQuota}
                                            checked={form.data.payment_method === 'quota'}
                                            onChange={() => form.setData('payment_method', 'quota')}
                                            className="mt-1 h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500 disabled:cursor-not-allowed dark:border-gray-600"
                                        />
                                        <span className="flex-1">
                                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                                Gunakan kuota saya
                                            </span>
                                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                                Sisa kuota: {objectsRemaining ?? 0}. 1 slot akan dipotong dan perangkat
                                                langsung diperpanjang tanpa pembayaran.
                                            </span>
                                            {!canPayWithQuota && (
                                                <span className="mt-1 block text-xs font-medium text-amber-700 dark:text-amber-400">
                                                    Sisa kuota tidak mencukupi.
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                </fieldset>
                            )}

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isQuota
                                    ? 'Setelah konfirmasi, 1 slot kuota Anda akan dipotong dan masa aktif perangkat langsung diperpanjang.'
                                    : 'Setelah konfirmasi, Anda akan dibawa ke halaman instruksi pembayaran (menunggu review). Pembayaran dilakukan melalui payment gateway; gunakan referensi transaksi yang ditampilkan.'}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <PrimaryButton disabled={form.processing}>
                                    {isQuota
                                        ? 'Konfirmasi dan potong kuota'
                                        : 'Konfirmasi dan lanjutkan pembayaran'}
                                </PrimaryButton>
                                <Link
                                    href={objectsUrl}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                >
                                    Batal
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DynamicLayout>
    );
}

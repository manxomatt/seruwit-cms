import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface ExtensionForm {
    device_identifier: string;
    device_label: string;
    notes: string;
}

interface Props {
    amount: number;
    dashboardUrl: string;
    storeUrl: string;
}

const formatIdr = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

export default function DeviceExtension({ amount, dashboardUrl, storeUrl }: Props): JSX.Element {
    const form = useForm<ExtensionForm>({
        device_identifier: '',
        device_label: '',
        notes: '',
    });

    const submit = (e: FormEvent): void => {
        e.preventDefault();
        form.post(storeUrl, { preserveScroll: true });
    };

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Perpanjang perangkat
                </h2>
            }
        >
            <Head title="Perpanjang perangkat" />

            <div className="space-y-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Perpanjangan masa aktif</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Transaksi tipe perpanjangan akan dicatat di billing. Tarif flat saat ini:{' '}
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatIdr(amount)}</span>.
                            Pembayaran dilakukan melalui payment gateway; gunakan URL callback aplikasi setelah
                            pembayaran selesai.
                        </p>
                    </div>
                    <form onSubmit={submit} className="p-6">
                        <div className="max-w-xl space-y-4">
                            <div>
                                <InputLabel htmlFor="device_identifier" value="Identitas perangkat (IMEI / ID)" />
                                <TextInput
                                    id="device_identifier"
                                    name="device_identifier"
                                    value={form.data.device_identifier}
                                    className="mt-1 block w-full"
                                    onChange={(e) => form.setData('device_identifier', e.target.value)}
                                    required
                                />
                                <InputError message={form.errors.device_identifier} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="device_label" value="Nama / label (opsional)" />
                                <TextInput
                                    id="device_label"
                                    name="device_label"
                                    value={form.data.device_label}
                                    className="mt-1 block w-full"
                                    onChange={(e) => form.setData('device_label', e.target.value)}
                                />
                                <InputError message={form.errors.device_label} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="notes" value="Catatan (opsional)" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                                />
                                <InputError message={form.errors.notes} className="mt-2" />
                            </div>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <PrimaryButton disabled={form.processing}>Simpan permintaan perpanjangan</PrimaryButton>
                                <Link
                                    href={dashboardUrl}
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

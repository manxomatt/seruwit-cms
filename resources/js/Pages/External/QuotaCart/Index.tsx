import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import DynamicLayout from '@/Layouts/DynamicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

const MAX_QUOTA = 9999;

interface QuotaForm {
    quantity: number;
}

interface Flash {
    error?: string;
}

interface Props {
    dashboardUrl: string;
    userName: string;
    quotaUnitPrice: number;
}

const formatIdr = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

export default function Index({ dashboardUrl, userName, quotaUnitPrice }: Props): JSX.Element {
    const { flash } = usePage<{ flash: Flash }>().props;

    const form = useForm<QuotaForm>({
        quantity: 1,
    });

    const [draft, setDraft] = useState('1');

    const previewQuantity = useMemo((): number => {
        const digits = draft.replace(/\D/g, '');
        if (digits === '') {
            return form.data.quantity;
        }
        const parsed = parseInt(digits, 10);
        if (Number.isNaN(parsed)) {
            return form.data.quantity;
        }

        return Math.max(1, Math.min(MAX_QUOTA, parsed));
    }, [draft, form.data.quantity]);

    const estimatedTotal = previewQuantity * quotaUnitPrice;

    const commitDraftToForm = (): void => {
        const digits = draft.replace(/\D/g, '');
        if (digits === '') {
            form.setData('quantity', 1);
            setDraft('1');

            return;
        }
        const n = parseInt(digits, 10);
        if (Number.isNaN(n)) {
            form.setData('quantity', 1);
            setDraft('1');

            return;
        }
        const clamped = Math.max(1, Math.min(MAX_QUOTA, n));
        form.setData('quantity', clamped);
        setDraft(String(clamped));
    };

    const bump = (delta: number): void => {
        const next = Math.max(1, Math.min(MAX_QUOTA, form.data.quantity + delta));
        form.setData('quantity', next);
        setDraft(String(next));
    };

    const submit = (e: FormEvent): void => {
        e.preventDefault();
        commitDraftToForm();
        form.post(route('external.quota-cart.store'), { preserveScroll: true });
    };

    return (
        <DynamicLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Cart kuota</h2>
            }
        >
            <Head title="Cart kuota" />

            <div className="space-y-6">
                {flash?.error !== undefined && flash.error !== null && flash.error !== '' && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Penambahan kuota objek</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Halo {userName}, tentukan jumlah kuota tambahan. Harga per 1 kuota:{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{formatIdr(quotaUnitPrice)}</span>
                            .
                        </p>
                    </div>

                    <form onSubmit={submit} className="p-6">
                        <div className="max-w-xl">
                            <InputLabel htmlFor="quota-quantity" value="Jumlah kuota" />

                            <div className="mt-2 flex flex-wrap items-stretch gap-2">
                                <button
                                    type="button"
                                    onClick={() => bump(-1)}
                                    disabled={form.data.quantity <= 1 || form.processing}
                                    className="inline-flex min-w-[2.75rem] items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                    aria-label="Kurangi kuota"
                                >
                                    −
                                </button>

                                <TextInput
                                    id="quota-quantity"
                                    name="quantity"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={draft}
                                    className="block min-w-[6rem] flex-1"
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        setDraft(raw);
                                    }}
                                    onBlur={() => commitDraftToForm()}
                                    disabled={form.processing}
                                />

                                <button
                                    type="button"
                                    onClick={() => bump(1)}
                                    disabled={form.data.quantity >= MAX_QUOTA || form.processing}
                                    className="inline-flex min-w-[2.75rem] items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                    aria-label="Tambah kuota"
                                >
                                    +
                                </button>
                            </div>

                            <InputError message={form.errors.quantity} className="mt-2" />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Minimal 1, maksimal {MAX_QUOTA.toLocaleString('id-ID')}.</p>

                            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/40">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total estimasi</p>
                                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{formatIdr(estimatedTotal)}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {previewQuantity.toLocaleString('id-ID')} × {formatIdr(quotaUnitPrice)}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <PrimaryButton disabled={form.processing}>Ajukan penambahan kuota</PrimaryButton>
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                >
                                    Kembali ke dashboard
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DynamicLayout>
    );
}

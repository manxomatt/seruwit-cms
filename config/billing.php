<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payment gateway callback
    |--------------------------------------------------------------------------
    |
    | Gateway harus mengirim header X-Billing-Token yang sama dengan nilai ini.
    | Kosongkan hanya di lingkungan local/testing; production wajib diisi.
    |
    */
    'payment_callback_token' => env('BILLING_PAYMENT_CALLBACK_TOKEN'),

    'default_gateway' => env('BILLING_DEFAULT_GATEWAY', 'generic'),

    /*
    |--------------------------------------------------------------------------
    | Perpanjangan device / object
    |--------------------------------------------------------------------------
    |
    | Tarif flat per transaksi perpanjangan (IDR) sampai integrasi harga dinamis.
    |
    */
    'device_extension_amount' => (int) env('BILLING_DEVICE_EXTENSION_AMOUNT', 50_000),

    /*
    |--------------------------------------------------------------------------
    | Komisi referral (account manager)
    |--------------------------------------------------------------------------
    |
    | Persentase dari nilai transaksi billing (IDR) yang dikreditkan ke wallet
    | account manager ketika downline membayar dan referral disetujui.
    |
    */
    'referral_commission_rate' => (float) env('BILLING_REFERRAL_COMMISSION_RATE', 0.10),
];

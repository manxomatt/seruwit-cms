<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'external_api' => [
        'url' => env('EXTERNAL_API_URL'),
        'app_url' => env('EXTERNAL_APP_URL'),
        'key' => env('EXTERNAL_API_KEY'),
        'timeout' => (int) env('EXTERNAL_API_TIMEOUT', 10),
        'quota_unit_price' => (int) env('EXTERNAL_QUOTA_UNIT_PRICE', 10_000),
        // Path endpoint untuk fulfillment otomatis setelah callback paid.
        // {id} akan diganti dengan external_id user. Path dapat mengandung
        // placeholder {id} di mana saja (path / query).
        'quota_fulfillment_path' => env('EXTERNAL_QUOTA_FULFILLMENT_PATH', 'billing/users/{id}/quota'),
        'device_extension_fulfillment_path' => env('EXTERNAL_DEVICE_EXTENSION_FULFILLMENT_PATH', 'billing/objects/expire'),
    ],

];

<?php

namespace App\Enums;

enum BillingTransactionType: string
{
    case QuotaPurchase = 'quota_purchase';
    case DeviceExtension = 'device_extension';
}

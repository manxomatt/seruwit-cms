<?php

namespace App\Enums;

enum TrialConvertMode: string
{
    case BillingPayment = 'billing_payment';
    case ExistingQuota = 'existing_quota';
}

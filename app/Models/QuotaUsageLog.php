<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotaUsageLog extends Model
{
    /** @use HasFactory<\Database\Factories\QuotaUsageLogFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'billing_transaction_id',
        'device_identifier',
        'device_label',
        'quota_used',
        'quota_before',
        'quota_after',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quota_used' => 'integer',
            'quota_before' => 'integer',
            'quota_after' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<BillingTransaction, $this>
     */
    public function billingTransaction(): BelongsTo
    {
        return $this->belongsTo(BillingTransaction::class);
    }
}

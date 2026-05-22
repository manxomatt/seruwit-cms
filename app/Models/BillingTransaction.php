<?php

namespace App\Models;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class BillingTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\BillingTransactionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'status',
        'amount',
        'currency',
        'meta',
        'gateway_provider',
        'gateway_payment_id',
        'paid_at',
        'failed_at',
        'failure_message',
        'fulfilled_at',
        'fulfillment_attempts',
        'fulfillment_error',
        'fulfillment_response',
        'fulfillment_endpoint',
        'fulfillment_method',
        'fulfillment_request',
        'invoice_number',
    ];

    protected static function booted(): void
    {
        static::creating(function (BillingTransaction $transaction): void {
            if ($transaction->reference === null || $transaction->reference === '') {
                $transaction->reference = (string) Str::ulid();
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => BillingTransactionType::class,
            'status' => BillingTransactionStatus::class,
            'meta' => 'array',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'fulfilled_at' => 'datetime',
            'fulfillment_attempts' => 'integer',
            'fulfillment_request' => 'array',
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
     * @return HasMany<BillingTransactionLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(BillingTransactionLog::class);
    }
}

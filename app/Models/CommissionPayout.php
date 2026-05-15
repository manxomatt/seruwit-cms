<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CommissionPayout extends Model
{
    /** @use HasFactory<\Database\Factories\CommissionPayoutFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_PAID = 'paid';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'account_manager_id',
        'reference',
        'amount',
        'status',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'notes',
        'rejection_reason',
        'processed_by',
        'processed_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (CommissionPayout $payout): void {
            if ($payout->reference === null || $payout->reference === '') {
                $payout->reference = 'PAYOUT-'.strtoupper(Str::ulid());
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<AccountManager, $this>
     */
    public function accountManager(): BelongsTo
    {
        return $this->belongsTo(AccountManager::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * @param  Builder<CommissionPayout>  $query
     * @return Builder<CommissionPayout>
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}

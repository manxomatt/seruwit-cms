<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Commission extends Model
{
    /** @use HasFactory<\Database\Factories\CommissionFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'account_manager_id',
        'transaction_id',
        'commission_type',
        'commission_value',
        'commission_amount',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'commission_value' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'created_at' => 'datetime',
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
     * @return HasOne<WalletTransaction, $this>
     */
    public function walletTransaction(): HasOne
    {
        return $this->hasOne(WalletTransaction::class);
    }
}

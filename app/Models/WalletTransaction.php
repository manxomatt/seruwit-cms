<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\WalletTransactionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'account_manager_id',
        'commission_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
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
     * @return BelongsTo<Commission, $this>
     */
    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }
}

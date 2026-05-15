<?php

namespace Tests\Feature\Billing;

use App\Enums\BillingTransactionStatus;
use App\Models\AccountManager;
use App\Models\BillingTransaction;
use App\Models\Commission;
use App\Models\ReferralRelation;
use App\Models\User;
use App\Services\Referral\BillingPaidReferralCommissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentCallbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_callback_returns_forbidden_when_token_mismatch(): void
    {
        config(['billing.payment_callback_token' => 'correct-token']);

        $response = $this->postJson(route('billing.payment.callback'), [
            'reference' => '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            'status' => 'paid',
        ], [
            'X-Billing-Token' => 'wrong-token',
        ]);

        $response->assertForbidden();
    }

    public function test_callback_marks_transaction_paid_and_writes_logs(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);

        $user = User::factory()->create();
        $transaction = BillingTransaction::factory()->for($user)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
        ]);

        $response = $this->postJson(route('billing.payment.callback'), [
            'reference' => $transaction->reference,
            'status' => 'paid',
            'gateway_payment_id' => 'gw_abc_123',
        ], [
            'X-Billing-Token' => 'gateway-secret',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('status', BillingTransactionStatus::Paid->value);

        $this->assertDatabaseHas('billing_transactions', [
            'id' => $transaction->id,
            'status' => BillingTransactionStatus::Paid->value,
            'gateway_payment_id' => 'gw_abc_123',
        ]);

        $this->assertGreaterThanOrEqual(2, $transaction->fresh()->logs()->count());
    }

    public function test_paid_callback_credits_account_manager_wallet_when_referral_is_approved(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);
        config(['billing.referral_commission_rate' => 0.10]);

        $buyer = User::factory()->create();
        $accountManager = AccountManager::factory()->create([
            'wallet_balance' => 1000.00,
        ]);

        ReferralRelation::factory()->create([
            'account_manager_id' => $accountManager->id,
            'user_id' => $buyer->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $transaction = BillingTransaction::factory()->for($buyer)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 100_000,
        ]);

        $response = $this->postJson(route('billing.payment.callback'), [
            'reference' => $transaction->reference,
            'status' => 'paid',
            'gateway_payment_id' => 'gw_abc_123',
        ], [
            'X-Billing-Token' => 'gateway-secret',
        ]);

        $response->assertOk();

        $accountManager->refresh();
        $this->assertEqualsWithDelta(11_000.00, (float) $accountManager->wallet_balance, 0.01);

        $this->assertDatabaseHas('commissions', [
            'account_manager_id' => $accountManager->id,
            'transaction_id' => $transaction->reference,
            'commission_type' => BillingPaidReferralCommissionService::COMMISSION_TYPE_BILLING_REFERRAL,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'account_manager_id' => $accountManager->id,
            'type' => 'credit',
            'amount' => 10_000.00,
        ]);
    }

    public function test_paid_callback_does_not_credit_wallet_when_referral_is_pending(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);

        $buyer = User::factory()->create();
        $accountManager = AccountManager::factory()->create([
            'wallet_balance' => 500.00,
        ]);

        ReferralRelation::factory()->create([
            'account_manager_id' => $accountManager->id,
            'user_id' => $buyer->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);

        $transaction = BillingTransaction::factory()->for($buyer)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 50_000,
        ]);

        $this->postJson(route('billing.payment.callback'), [
            'reference' => $transaction->reference,
            'status' => 'paid',
        ], [
            'X-Billing-Token' => 'gateway-secret',
        ])->assertOk();

        $accountManager->refresh();
        $this->assertEqualsWithDelta(500.00, (float) $accountManager->wallet_balance, 0.01);

        $this->assertDatabaseMissing('commissions', [
            'transaction_id' => $transaction->reference,
            'commission_type' => BillingPaidReferralCommissionService::COMMISSION_TYPE_BILLING_REFERRAL,
        ]);
    }

    public function test_duplicate_paid_callback_does_not_double_referral_credit(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);

        $buyer = User::factory()->create();
        $accountManager = AccountManager::factory()->create([
            'wallet_balance' => 0,
        ]);

        ReferralRelation::factory()->create([
            'account_manager_id' => $accountManager->id,
            'user_id' => $buyer->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $transaction = BillingTransaction::factory()->for($buyer)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 20_000,
        ]);

        $payload = [
            'reference' => $transaction->reference,
            'status' => 'paid',
            'gateway_payment_id' => 'gw-1',
        ];

        $this->postJson(route('billing.payment.callback'), $payload, [
            'X-Billing-Token' => 'gateway-secret',
        ])->assertOk();

        $this->postJson(route('billing.payment.callback'), array_merge($payload, [
            'gateway_payment_id' => 'gw-2',
        ]), [
            'X-Billing-Token' => 'gateway-secret',
        ])->assertOk();

        $accountManager->refresh();
        $this->assertEqualsWithDelta(2_000.00, (float) $accountManager->wallet_balance, 0.01);

        $this->assertEquals(1, Commission::query()
            ->where('transaction_id', $transaction->reference)
            ->where('commission_type', BillingPaidReferralCommissionService::COMMISSION_TYPE_BILLING_REFERRAL)
            ->count());
    }

    public function test_failed_callback_does_not_credit_referral(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);

        $buyer = User::factory()->create();
        $accountManager = AccountManager::factory()->create([
            'wallet_balance' => 100.00,
        ]);

        ReferralRelation::factory()->create([
            'account_manager_id' => $accountManager->id,
            'user_id' => $buyer->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $transaction = BillingTransaction::factory()->for($buyer)->create([
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 30_000,
        ]);

        $this->postJson(route('billing.payment.callback'), [
            'reference' => $transaction->reference,
            'status' => 'failed',
        ], [
            'X-Billing-Token' => 'gateway-secret',
        ])->assertOk();

        $accountManager->refresh();
        $this->assertEqualsWithDelta(100.00, (float) $accountManager->wallet_balance, 0.01);
    }

    public function test_callback_returns_not_found_for_unknown_reference(): void
    {
        config(['billing.payment_callback_token' => 'gateway-secret']);

        $response = $this->postJson(route('billing.payment.callback'), [
            'reference' => '01UNKNOWNUNKNOWNUNKNOWNUNKNOWN',
            'status' => 'paid',
        ], [
            'X-Billing-Token' => 'gateway-secret',
        ]);

        $response->assertNotFound();
    }
}

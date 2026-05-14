<?php

namespace Tests\Feature\Billing;

use App\Enums\BillingTransactionStatus;
use App\Models\BillingTransaction;
use App\Models\User;
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

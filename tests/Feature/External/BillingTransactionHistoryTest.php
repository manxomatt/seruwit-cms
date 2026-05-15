<?php

namespace Tests\Feature\External;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingTransactionHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalUser(): User
    {
        $role = \App\Models\Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('external.billing.transactions.index'));

        $response->assertRedirect('/login');
    }

    public function test_external_user_sees_empty_history(): void
    {
        $user = $this->makeExternalUser();

        $response = $this->actingAs($user)->get(route('external.billing.transactions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Billing/TransactionHistory')
            ->has('transactions.data', 0)
            ->where('transactions.total', 0)
        );
    }

    public function test_external_user_only_sees_own_transactions(): void
    {
        $user = $this->makeExternalUser();
        $other = $this->makeExternalUser();

        BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 50_000,
        ]);
        BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 75_000,
        ]);
        BillingTransaction::factory()->for($other)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 99_000,
        ]);

        $response = $this->actingAs($user)->get(route('external.billing.transactions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('External/Billing/TransactionHistory')
            ->has('transactions.data', 2)
            ->where('transactions.total', 2)
        );
    }

    public function test_transaction_row_contains_expected_fields(): void
    {
        $user = $this->makeExternalUser();
        $tx = BillingTransaction::factory()->for($user)->create([
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 40_000,
        ]);

        $response = $this->actingAs($user)->get(route('external.billing.transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('transactions.data.0.reference', $tx->reference)
            ->where('transactions.data.0.type', BillingTransactionType::QuotaPurchase->value)
            ->where('transactions.data.0.type_label', 'Pembelian kuota')
            ->where('transactions.data.0.status', BillingTransactionStatus::Paid->value)
            ->where('transactions.data.0.status_label', 'Lunas')
            ->where('transactions.data.0.amount', 40_000)
            ->where('transactions.data.0.currency', 'IDR')
        );
    }
}

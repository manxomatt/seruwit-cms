<?php

namespace Tests\Feature\Billing;

use App\Enums\BillingTransactionStatus;
use App\Enums\BillingTransactionType;
use App\Models\BillingTransaction;
use App\Models\QuotaUsageLog;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeExternalUser(): User
    {
        $role = Role::query()->where('slug', 'external_user')->firstOrFail();
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    public function test_guest_cannot_download_invoice(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'status' => BillingTransactionStatus::Paid,
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0001',
        ]);

        $response = $this->get(route('billing.invoices.download', $transaction));

        $response->assertRedirect('/login');
    }

    public function test_owner_can_download_invoice_pdf_for_quota_purchase(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 250_000,
            'meta' => ['quantity' => 5, 'unit_price' => 50_000],
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0042',
        ]);

        $response = $this->actingAs($user)->get(route('billing.invoices.download', $transaction));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('INV-202605-0042-lunas.pdf', (string) $response->headers->get('content-disposition'));
    }

    public function test_owner_can_download_invoice_for_device_extension(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 50_000,
            'meta' => ['device_identifier' => 'IMEI-PDF-1', 'device_label' => 'Truk PDF'],
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0099',
        ]);

        $response = $this->actingAs($user)->get(route('billing.invoices.download', $transaction));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_owner_can_download_invoice_for_quota_paid_extension_with_usage_log(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::DeviceExtension,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 0,
            'meta' => [
                'device_identifier' => 'IMEI-QUOTA-PDF',
                'payment_method' => 'quota',
            ],
            'gateway_provider' => null,
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0123',
        ]);

        QuotaUsageLog::factory()->create([
            'user_id' => $user->id,
            'billing_transaction_id' => $transaction->id,
            'device_identifier' => 'IMEI-QUOTA-PDF',
            'quota_used' => 1,
            'quota_before' => 5,
            'quota_after' => 4,
        ]);

        $response = $this->actingAs($user)->get(route('billing.invoices.download', $transaction));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_non_owner_cannot_download_invoice(): void
    {
        $owner = $this->makeExternalUser();
        $intruder = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $owner->id,
            'status' => BillingTransactionStatus::Paid,
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0007',
        ]);

        $response = $this->actingAs($intruder)->get(route('billing.invoices.download', $transaction));

        $response->assertForbidden();
    }

    public function test_default_invoice_for_awaiting_payment_renders_penagihan(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::AwaitingPayment,
            'amount' => 100_000,
            'meta' => ['quantity' => 2, 'unit_price' => 50_000],
            'invoice_number' => 'INV-202605-0010',
        ]);

        $response = $this->actingAs($user)->get(route('billing.invoices.download', $transaction));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('INV-202605-0010-penagihan.pdf', (string) $response->headers->get('content-disposition'));
    }

    public function test_explicit_penagihan_invoice_works_for_paid_transaction(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 100_000,
            'meta' => ['quantity' => 2, 'unit_price' => 50_000],
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0011',
        ]);

        $response = $this->actingAs($user)->get(
            route('billing.invoices.download', ['billingTransaction' => $transaction, 'type' => 'penagihan'])
        );

        $response->assertOk();
        $this->assertStringContainsString('INV-202605-0011-penagihan.pdf', (string) $response->headers->get('content-disposition'));
    }

    public function test_explicit_lunas_invoice_works_for_paid_transaction(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 100_000,
            'meta' => ['quantity' => 2, 'unit_price' => 50_000],
            'paid_at' => now(),
            'invoice_number' => 'INV-202605-0012',
        ]);

        $response = $this->actingAs($user)->get(
            route('billing.invoices.download', ['billingTransaction' => $transaction, 'type' => 'lunas'])
        );

        $response->assertOk();
        $this->assertStringContainsString('INV-202605-0012-lunas.pdf', (string) $response->headers->get('content-disposition'));
    }

    public function test_lunas_invoice_blocked_for_awaiting_payment(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'status' => BillingTransactionStatus::AwaitingPayment,
            'invoice_number' => 'INV-202605-0013',
        ]);

        $response = $this->actingAs($user)->get(
            route('billing.invoices.download', ['billingTransaction' => $transaction, 'type' => 'lunas'])
        );

        $response->assertNotFound();
    }

    public function test_penagihan_invoice_blocked_for_failed_transaction(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'status' => BillingTransactionStatus::Failed,
            'invoice_number' => 'INV-202605-0014',
        ]);

        $response = $this->actingAs($user)->get(
            route('billing.invoices.download', ['billingTransaction' => $transaction, 'type' => 'penagihan'])
        );

        $response->assertNotFound();
    }

    public function test_invoice_number_is_lazily_assigned_on_download_when_missing(): void
    {
        $user = $this->makeExternalUser();

        $transaction = BillingTransaction::factory()->create([
            'user_id' => $user->id,
            'type' => BillingTransactionType::QuotaPurchase,
            'status' => BillingTransactionStatus::Paid,
            'amount' => 100_000,
            'meta' => ['quantity' => 2, 'unit_price' => 50_000],
            'paid_at' => now(),
            'invoice_number' => null,
        ]);

        $response = $this->actingAs($user)->get(route('billing.invoices.download', $transaction));

        $response->assertOk();

        $transaction->refresh();
        $this->assertNotNull($transaction->invoice_number);
        $this->assertMatchesRegularExpression('/^INV-\d{6}-\d{4}$/', (string) $transaction->invoice_number);
    }
}

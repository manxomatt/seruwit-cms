<?php

namespace Tests\Unit\Billing;

use App\Enums\BillingTransactionStatus;
use App\Models\BillingTransaction;
use App\Services\Billing\InvoiceNumberGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class InvoiceNumberGeneratorTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigns_sequential_invoice_numbers_within_same_month(): void
    {
        $generator = app(InvoiceNumberGenerator::class);
        $issuedAt = Carbon::parse('2026-05-15');

        $a = BillingTransaction::factory()->create([
            'status' => BillingTransactionStatus::Paid,
            'invoice_number' => null,
        ]);
        $b = BillingTransaction::factory()->create([
            'status' => BillingTransactionStatus::Paid,
            'invoice_number' => null,
        ]);
        $c = BillingTransaction::factory()->create([
            'status' => BillingTransactionStatus::Paid,
            'invoice_number' => null,
        ]);

        $numberA = $generator->assign($a, $issuedAt);
        $numberB = $generator->assign($b, $issuedAt);
        $numberC = $generator->assign($c, $issuedAt);

        $this->assertSame('INV-202605-0001', $numberA);
        $this->assertSame('INV-202605-0002', $numberB);
        $this->assertSame('INV-202605-0003', $numberC);
    }

    public function test_invoice_number_resets_sequence_per_month(): void
    {
        $generator = app(InvoiceNumberGenerator::class);

        $may = BillingTransaction::factory()->create([
            'status' => BillingTransactionStatus::Paid,
            'invoice_number' => null,
        ]);
        $generator->assign($may, Carbon::parse('2026-05-31'));

        $june = BillingTransaction::factory()->create([
            'status' => BillingTransactionStatus::Paid,
            'invoice_number' => null,
        ]);
        $generator->assign($june, Carbon::parse('2026-06-01'));

        $this->assertSame('INV-202605-0001', $may->fresh()->invoice_number);
        $this->assertSame('INV-202606-0001', $june->fresh()->invoice_number);
    }

    public function test_does_not_overwrite_existing_invoice_number(): void
    {
        $generator = app(InvoiceNumberGenerator::class);

        $transaction = BillingTransaction::factory()->create([
            'status' => BillingTransactionStatus::Paid,
            'invoice_number' => 'INV-202605-9999',
        ]);

        $result = $generator->assign($transaction, Carbon::parse('2026-05-15'));

        $this->assertSame('INV-202605-9999', $result);
        $this->assertSame('INV-202605-9999', $transaction->fresh()->invoice_number);
    }
}

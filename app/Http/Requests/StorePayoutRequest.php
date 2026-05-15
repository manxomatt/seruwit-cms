<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->getPrimaryRole()?->slug === 'account_manager';
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $minimum = (float) config('billing.payout_minimum_amount', 50_000);

        return [
            'amount' => ['required', 'numeric', "min:{$minimum}"],
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_name' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $minimum = number_format((float) config('billing.payout_minimum_amount', 50_000), 0, ',', '.');

        return [
            'amount.required' => 'Jumlah pencairan wajib diisi.',
            'amount.numeric' => 'Jumlah pencairan harus berupa angka.',
            'amount.min' => "Jumlah pencairan minimum Rp {$minimum}.",
            'bank_name.required' => 'Nama bank wajib diisi.',
            'bank_account_number.required' => 'Nomor rekening wajib diisi.',
            'bank_account_name.required' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}

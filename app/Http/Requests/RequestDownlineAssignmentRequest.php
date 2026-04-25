<?php

namespace App\Http\Requests;

use App\Models\ReferralRelation;
use Illuminate\Foundation\Http\FormRequest;

class RequestDownlineAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                // No exists check needed - user will be synced from external API if needed
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $exists = ReferralRelation::query()
                        ->whereHas('user', fn ($q) => $q->where('external_id', $value))
                        ->whereIn('status', [ReferralRelation::STATUS_PENDING, ReferralRelation::STATUS_APPROVED])
                        ->exists();

                    if ($exists) {
                        $fail('User ini sudah memiliki Account Manager atau sedang dalam proses pengajuan.');
                    }
                },
            ],
            'user_data' => ['nullable', 'json'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'User wajib dipilih.',
            'user_id.exists' => 'User tidak ditemukan.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\ReferralRelation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
                Rule::exists('users', 'id'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $exists = ReferralRelation::query()
                        ->where('user_id', $value)
                        ->whereIn('status', [ReferralRelation::STATUS_PENDING, ReferralRelation::STATUS_APPROVED])
                        ->exists();

                    if ($exists) {
                        $fail('User ini sudah memiliki Account Manager atau sedang dalam proses pengajuan.');
                    }
                },
            ],
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

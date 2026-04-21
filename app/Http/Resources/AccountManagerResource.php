<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountManagerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'referral_code' => $this->referral_code,
            'wallet_balance' => $this->wallet_balance,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'username' => $this->user->username,
                'status' => $this->user->status,
                'profile' => $this->user->relationLoaded('profile') && $this->user->profile ? [
                    'first_name' => $this->user->profile->first_name,
                    'last_name' => $this->user->profile->last_name,
                    'phone_number' => $this->user->profile->phone_number,
                    'avatar_url' => $this->user->profile->avatar_url,
                    'full_name' => $this->user->profile->full_name,
                ] : null,
            ]),
        ];
    }
}

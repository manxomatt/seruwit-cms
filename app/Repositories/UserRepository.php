<?php

namespace App\Repositories;

use App\DTOs\ExternalUserData;
use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserRepository implements UserRepositoryInterface
{
    /**
     * Sync an externally authenticated user into the local database.
     * When creating a new user, an unguessable random password is assigned
     * so that local password-based login remains impossible for external-only accounts.
     * Existing users' passwords are never overwritten.
     */
    public function syncFromExternal(ExternalUserData $data): User
    {
        return DB::transaction(function () use ($data): User {
            $isNew = ! User::query()->where('email', $data->email)->exists();

            $updateValues = [
                'name' => $data->name,
                'username' => $data->username,
                'external_id' => $data->externalId,
                'status' => $data->status,
                'last_login_at' => now(),
            ];

            if ($isNew) {
                $updateValues['email_verified_at'] = now();
                $updateValues['password'] = Hash::make(Str::uuid()->toString());
            }

            $user = User::query()->updateOrCreate(
                ['email' => $data->email],
                $updateValues,
            );

            // Ensure existing external users are always verified on login.
            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $this->syncRole($user, $data->role);

            return $user;
        });
    }

    /**
     * Stamp the user's last login timestamp.
     */
    public function updateLastLogin(User $user): void
    {
        $user->update(['last_login_at' => now()]);
    }

    /**
     * Synchronize the user's role based on the role slug from the external system.
     *
     * External API role slugs are prefixed with "external_" before lookup so they
     * map to dedicated local roles (e.g. "manager" → "external_manager").
     * Falls back to "external_user" if the prefixed role does not exist locally.
     */
    private function syncRole(User $user, string $roleSlug): void
    {
        $prefixedSlug = 'external_'.$roleSlug;

        $role = Role::query()->where('slug', $prefixedSlug)->first()
            ?? Role::query()->where('slug', 'external_user')->first();

        if ($role !== null) {
            $user->roles()->sync([$role->id]);
        }
    }
}

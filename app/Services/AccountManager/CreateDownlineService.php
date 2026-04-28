<?php

namespace App\Services\AccountManager;

use App\DTOs\ExternalUserData;
use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\ExternalApiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CreateDownlineService
{
    public function __construct(
        private readonly ExternalApiService $externalApiService,
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    /**
     * Create a new external user/manager via the external API, sync locally,
     * and create a pending ReferralRelation for the given AccountManager.
     *
     * The user is set to 'inactive' immediately after sync so they cannot log in
     * until an admin approves the referral relation.
     *
     * @param  array<string, mixed>  $data  Validated input: username, email, password, role
     *
     * @throws ValidationException when user already has a pending/approved relation
     * @throws \RuntimeException when the external API call fails
     */
    public function execute(AccountManager $accountManager, array $data): ReferralRelation
    {
        Log::channel('downline')->info('Memulai pembuatan downline', [
            'account_manager_id' => $accountManager->id,
            'account_manager_name' => $accountManager->user?->name,
            'username' => $data['username'],
            'email' => $data['email'],
            'role' => $data['role'],
        ]);

        $response = $this->externalApiService->postWithApiKey('/users/register_user', [
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role_type' => $data['role'],
        ]);

        if (! $response->successful()) {
            $errorBody = $response->json();
            $errorMessage = is_array($errorBody) && isset($errorBody['message'])
                ? (string) $errorBody['message']
                : 'Gagal membuat akun di sistem eksternal.';

            Log::channel('downline')->error('Gagal membuat akun di sistem eksternal', [
                'account_manager_id' => $accountManager->id,
                'email' => $data['email'],
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            throw new \RuntimeException($errorMessage);
        }

        $responseData = $response->json();

        // Register endpoint returns 'data', auth endpoint returns 'user'.
        // Normalize to 'user' key so ExternalUserData::fromApiResponse() works for both.
        if (is_array($responseData) && isset($responseData['data']) && ! isset($responseData['user'])) {
            $responseData['user'] = $responseData['data'];
        }

        if (! is_array($responseData) || ! isset($responseData['user'])) {
            Log::channel('downline')->error('Respons tidak valid dari sistem eksternal', [
                'account_manager_id' => $accountManager->id,
                'email' => $data['email'],
                'response' => $responseData,
            ]);

            throw new \RuntimeException('Respons tidak valid dari sistem eksternal.');
        }

        return DB::transaction(function () use ($accountManager, $responseData): ReferralRelation {
            $externalUserData = ExternalUserData::fromApiResponse($responseData);

            Log::channel('downline')->debug('Data user dari API eksternal diterima', [
                'external_id' => $externalUserData->externalId,
                'email' => $externalUserData->email,
                'role' => $externalUserData->role,
            ]);

            $this->ensureUserHasNoActiveRelation($externalUserData->email);

            $user = $this->userRepository->syncFromExternal($externalUserData);

            // Block login until admin approves the referral relation.
            $user->update(['status' => 'inactive']);

            $relation = ReferralRelation::create([
                'account_manager_id' => $accountManager->id,
                'user_id' => $user->id,
                'referral_code' => $accountManager->referral_code,
                'status' => ReferralRelation::STATUS_PENDING,
            ]);

            Log::channel('downline')->info('Downline berhasil dibuat, menunggu persetujuan admin', [
                'referral_relation_id' => $relation->id,
                'account_manager_id' => $accountManager->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'referral_code' => $relation->referral_code,
            ]);

            return $relation;
        });
    }

    /**
     * @throws ValidationException
     */
    private function ensureUserHasNoActiveRelation(string $email): void
    {
        $exists = ReferralRelation::query()
            ->whereHas('user', fn ($q) => $q->where('email', $email))
            ->whereIn('status', [ReferralRelation::STATUS_PENDING, ReferralRelation::STATUS_APPROVED])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'email' => 'User ini sudah memiliki Account Manager atau sedang dalam proses pengajuan.',
            ]);
        }
    }
}

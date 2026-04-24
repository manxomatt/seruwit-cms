<?php

namespace App\Services\AccountManager;

use App\DTOs\ExternalUserData;
use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\ExternalApiService;
use Illuminate\Support\Facades\DB;
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
        $response = $this->externalApiService->post('/users', [
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Gagal membuat akun di sistem eksternal: '.$response->body()
            );
        }

        $responseData = $response->json();

        if (! is_array($responseData) || ! isset($responseData['user'])) {
            throw new \RuntimeException('Respons tidak valid dari sistem eksternal.');
        }

        return DB::transaction(function () use ($accountManager, $responseData): ReferralRelation {
            $externalUserData = ExternalUserData::fromApiResponse($responseData);

            $this->ensureUserHasNoActiveRelation($externalUserData->email);

            $user = $this->userRepository->syncFromExternal($externalUserData);

            // Block login until admin approves the referral relation.
            $user->update(['status' => 'inactive']);

            return ReferralRelation::create([
                'account_manager_id' => $accountManager->id,
                'user_id' => $user->id,
                'referral_code' => $accountManager->referral_code,
                'status' => ReferralRelation::STATUS_PENDING,
            ]);
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

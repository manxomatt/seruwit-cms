<?php

namespace App\Services;

use App\DTOs\ExternalUserData;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalAuthService
{
    /**
     * Attempt authentication against the external REST API.
     *
     * Returns a populated DTO on success, or null when authentication
     * fails or the external system is unreachable.
     */
    /**
     * @param  'email'|'username'  $loginField  The field name sent in the API payload.
     */
    public function authenticate(string $login, string $password, string $loginField = 'email'): ?ExternalUserData
    {
        try {
            $response = Http::timeout($this->timeout())
                ->post($this->loginUrl(), [
                    $loginField => $login,
                    'password' => $password,
                ]);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();

            if (! is_array($data)) {
                Log::warning('External API returned non-JSON or empty response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            if (! $this->hasRequiredFields($data)) {
                Log::warning('External API response missing required fields', [
                    'keys' => array_keys($data),
                ]);

                return null;
            }

            return ExternalUserData::fromApiResponse($data);
        } catch (ConnectionException $e) {
            Log::warning('External API unreachable', ['error' => $e->getMessage()]);

            return null;
        } catch (\Throwable $e) {
            Log::error('External API authentication error', ['error' => $e->getMessage()]);

            return null;
        }
    }

    private function loginUrl(): string
    {
        return rtrim((string) config('services.external_api.url'), '/').'/auth/login';
    }

    private function timeout(): int
    {
        return (int) config('services.external_api.timeout', 10);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function hasRequiredFields(array $data): bool
    {
        if (! isset($data['user']) || ! is_array($data['user'])) {
            return false;
        }

        /** @var array<string, mixed> $user */
        $user = $data['user'];

        foreach (['id', 'username', 'email'] as $field) {
            if (empty($user[$field])) {
                return false;
            }
        }

        return true;
    }
}

<?php

namespace App\Actions\Auth;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\ExternalAuthService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;

class LoginAction
{
    /**
     * Session key used to store the external API JWT access token.
     */
    public const EXTERNAL_TOKEN_KEY = 'external_api_token';

    /**
     * Session key used to store the external API JWT refresh token.
     */
    public const EXTERNAL_REFRESH_TOKEN_KEY = 'external_api_refresh_token';

    public function __construct(
        private readonly ExternalAuthService $externalAuthService,
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    /**
     * Execute the dual authentication flow.
     *
     * Accepts an email address or a username as the $login parameter.
     *
     * 1. Attempt local database authentication (email or username).
     * 2. On failure, fall back to the external REST API (requires email).
     * 3. On external success, sync the user locally and open a Laravel session.
     *    The external JWT access_token is stored in session for subsequent API calls.
     *
     * @throws ValidationException when both strategies fail.
     */
    public function execute(
        string $login,
        string $password,
        string $throttleKey,
        bool $remember = false,
    ): void {
        $isEmail = str_contains($login, '@');

        // Strategy 1 – local database
        $localCredentials = $isEmail
            ? ['email' => $login, 'password' => $password]
            : ['username' => $login, 'password' => $password];

        if (Auth::attempt($localCredentials, $remember)) {
            RateLimiter::clear($throttleKey);
            $this->userRepository->updateLastLogin(Auth::user());

            return;
        }

        // Strategy 2 – external REST API accepts {"username": "...", "password": "..."}.
        // Determine which username to send:
        // - Login with username  → use directly.
        // - Login with email     → look up username from local DB first;
        //                          fall back to the name column for users synced
        //                          before the username column was added.
        //                          If still not found (first-time external user),
        //                          use the email itself as the username since some
        //                          external accounts use their email as username.
        $usernameForApi = $isEmail
            ? (
                \App\Models\User::query()->where('email', $login)->value('username')
                ?? \App\Models\User::query()->where('email', $login)->value('name')
                ?? $login
            )
            : $login;

        $externalUserData = $this->externalAuthService->authenticate($usernameForApi, $password, 'username');

        if ($externalUserData === null) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'login' => trans('auth.failed'),
            ]);
        }

        $user = $this->userRepository->syncFromExternal($externalUserData);

        if ($user->status !== 'active') {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'login' => trans('auth.failed'),
            ]);
        }

        Auth::login($user, $remember);

        if ($externalUserData->accessToken !== null) {
            Session::put(self::EXTERNAL_TOKEN_KEY, $externalUserData->accessToken);
        }

        if ($externalUserData->refreshToken !== null) {
            Session::put(self::EXTERNAL_REFRESH_TOKEN_KEY, $externalUserData->refreshToken);
        }

        RateLimiter::clear($throttleKey);
    }
}

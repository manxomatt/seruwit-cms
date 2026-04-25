<?php

namespace App\Services;

use App\Actions\Auth\LoginAction;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

class ExternalApiService
{
    /**
     * Make an authenticated GET request to the external API.
     *
     * @param  array<string, mixed>  $query
     */
    public function get(string $path, array $query = []): Response
    {
        return $this->client()->get($this->url($path), $query);
    }

    /**
     * Make an authenticated POST request to the external API.
     *
     * @param  array<string, mixed>  $data
     */
    public function post(string $path, array $data = []): Response
    {
        return $this->client()->post($this->url($path), $data);
    }

    /**
     * Make an authenticated PUT request to the external API.
     *
     * @param  array<string, mixed>  $data
     */
    public function put(string $path, array $data = []): Response
    {
        return $this->client()->put($this->url($path), $data);
    }

    /**
     * Make an authenticated DELETE request to the external API.
     */
    public function delete(string $path): Response
    {
        return $this->client()->delete($this->url($path));
    }

    /**
     * Determine whether the current session holds a valid external API token.
     */
    public function hasToken(): bool
    {
        return Session::has(LoginAction::EXTERNAL_TOKEN_KEY);
    }

    /**
     * Retrieve the external JWT access token from the session, or null if absent.
     */
    public function token(): ?string
    {
        return Session::get(LoginAction::EXTERNAL_TOKEN_KEY);
    }

    /**
     * Retrieve the external JWT refresh token from the session, or null if absent.
     */
    public function refreshToken(): ?string
    {
        return Session::get(LoginAction::EXTERNAL_REFRESH_TOKEN_KEY);
    }

    /**
     * Determine whether the current session holds a refresh token.
     */
    public function hasRefreshToken(): bool
    {
        return Session::has(LoginAction::EXTERNAL_REFRESH_TOKEN_KEY);
    }

    /**
     * Build an HTTP client pre-configured with the JWT Bearer token and timeout.
     */
    private function client(): PendingRequest
    {
        $client = Http::timeout($this->timeout())
            ->acceptJson();

        $token = $this->token();

        if ($token !== null) {
            $client = $client->withToken($token);
        }

        return $client;
    }

    /**
     * Build an HTTP client with API key authentication (for public endpoints).
     */
    private function clientWithApiKey(): PendingRequest
    {
        $apiKey = (string) config('services.external_api.key');

        return Http::timeout($this->timeout())
            ->acceptJson()
            ->withHeaders([
                'X-Api-Key' => $apiKey,
            ]);
    }

    /**
     * Get users from the external API with optional role filter.
     *
     * @param  array<string>  $roles
     */
    public function getUsers(array $roles = ['manager', 'user']): Response
    {
        return $this->clientWithApiKey()->get(
            $this->url('users_api'),
            ['role' => implode(',', $roles)]
        );
    }

    private function url(string $path): string
    {
        return rtrim((string) config('services.external_api.url'), '/').'/'.ltrim($path, '/');
    }

    private function timeout(): int
    {
        return (int) config('services.external_api.timeout', 10);
    }
}

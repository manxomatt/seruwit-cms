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
     * Determine whether a non-empty external API key is configured.
     */
    public function hasApiKey(): bool
    {
        $key = config('services.external_api.key');

        return is_string($key) && $key !== '';
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
     * Make a GET request to the external API using API key authentication.
     *
     * @param  array<string, mixed>  $query
     */
    public function getWithApiKey(string $path, array $query = []): Response
    {
        return $this->clientWithApiKey()->get($this->url($path), $query);
    }

    /**
     * Make a POST request to the external API using API key authentication.
     *
     * @param  array<string, mixed>  $data
     */
    public function postWithApiKey(string $path, array $data = []): Response
    {
        return $this->clientWithApiKey()->post($this->url($path), $data);
    }

    /**
     * Make a PATCH request to the external API using API key authentication.
     *
     * @param  array<string, mixed>  $data
     */
    public function patchWithApiKey(string $path, array $data = []): Response
    {
        return $this->clientWithApiKey()->patch($this->url($path), $data);
    }

    /**
     * Fetch a billing account profile (user + quota) using API key authentication.
     *
     * @param  string|int  $billingUserId  External billing user id (typically {@see User::$external_id}).
     */
    public function getBillingUser(string|int $billingUserId): Response
    {
        $segment = rawurlencode((string) $billingUserId);

        return $this->getWithApiKey('billing/users/'.$segment);
    }

    /**
     * Get users from the external API with optional role filter.
     *
     * @param  array<string>  $roles
     */
    public function getUsers(array $roles = ['manager', 'user']): Response
    {
        return $this->getWithApiKey('users_api', ['role' => implode(',', $roles)]);
    }

    /**
     * Increment the user's object quota in the external system after a
     * successful quota purchase callback.
     *
     * External contract: PATCH /billing/users/{id}/quota with body { "add_to_quota": N }.
     */
    public function incrementUserQuota(string|int $billingUserId, int $addToQuota): Response
    {
        $template = (string) config('services.external_api.quota_fulfillment_path', 'billing/users/{id}/quota');

        return $this->patchWithApiKey(
            $this->resolvePath($template, $billingUserId),
            ['add_to_quota' => $addToQuota],
        );
    }

    /**
     * Extend a device / object active period in the external system after a
     * successful device extension callback.
     *
     * External contract: PATCH /billing/objects/expire with body { imei, user_id }.
     */
    public function extendDeviceExpiry(string|int $billingUserId, string $imei): Response
    {
        $path = (string) config('services.external_api.device_extension_fulfillment_path', 'billing/objects/expire');

        return $this->patchWithApiKey($path, [
            'imei' => $imei,
            'user_id' => is_numeric($billingUserId) ? (int) $billingUserId : $billingUserId,
        ]);
    }

    /**
     * Replace `{id}` placeholder in the configured path with the real external id.
     */
    private function resolvePath(string $template, string|int $billingUserId): string
    {
        $segment = rawurlencode((string) $billingUserId);

        return str_replace('{id}', $segment, $template);
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

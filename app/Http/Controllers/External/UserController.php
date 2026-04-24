<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Services\ExternalApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly ExternalApiService $externalApiService) {}

    /**
     * Display a paginated list of users fetched from the external API.
     */
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('per_page', 15)));

        $users = [];
        $pagination = null;
        $error = null;

        try {
            $response = $this->externalApiService->get('/users', [
                'page' => $page,
                'per_page' => $perPage,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['success']) && $data['success'] === true) {
                    $users = $data['users'] ?? [];
                    $pagination = $data['pagination'] ?? null;
                } else {
                    $error = 'The external API returned an unsuccessful response.';
                    Log::warning('External API /users returned success=false', ['data' => $data]);
                }
            } else {
                $error = 'Failed to fetch users from the external API.';
                Log::warning('External API /users non-200 response', ['status' => $response->status()]);
            }
        } catch (\Throwable $e) {
            $error = 'Unable to connect to the external API.';
            Log::error('External API /users connection error', ['error' => $e->getMessage()]);
        }

        return Inertia::render('External/Users/Index', [
            'users' => $users,
            'pagination' => $pagination,
            'error' => $error,
        ]);
    }
}

<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Services\ExternalApiService;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ObjectController extends Controller
{
    public function __construct(private readonly ExternalApiService $externalApiService) {}

    public function index(): Response
    {
        $objects = [];
        $error = null;

        try {
            $response = $this->externalApiService->get('/objects');

            if ($response->successful()) {
                $data = $response->json();

                if (is_array($data)) {
                    $objects = array_map(function (array $item): array {
                        $identifier = $item['imei'] ?? $item['id'] ?? $item['object_id'] ?? $item['unique_id'] ?? null;
                        $deviceIdentifier = $identifier !== null && $identifier !== ''
                            ? (string) $identifier
                            : '';

                        return [
                            'name' => $item['name'] ?? '',
                            'icon' => $item['icon'] ?? '',
                            'object_expire_dt' => $item['object_expire_dt'] ?? null,
                            'trial' => $item['trial'] ?? 'false',
                            'device_identifier' => $deviceIdentifier,
                        ];
                    }, $data);
                } else {
                    $error = 'Format respons tidak valid dari sistem eksternal.';
                    Log::warning('External API /objects unexpected format', ['data' => $data]);
                }
            } else {
                $error = 'Gagal mengambil data objects dari sistem eksternal.';
                Log::warning('External API /objects non-200 response', ['status' => $response->status()]);
            }
        } catch (\Throwable $e) {
            $error = 'Tidak dapat terhubung ke sistem eksternal.';
            Log::error('External API /objects connection error', ['error' => $e->getMessage()]);
        }

        return Inertia::render('External/Objects/Index', [
            'objects' => $objects,
            'error' => $error,
            'externalAppUrl' => rtrim((string) config('services.external_api.app_url'), '/'),
        ]);
    }
}

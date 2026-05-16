<?php

namespace App\Http\Controllers\External;

use App\Http\Controllers\Controller;
use App\Services\ExternalApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ObjectController extends Controller
{
    public function __construct(private readonly ExternalApiService $externalApiService) {}

    public function index(Request $request): Response
    {
        $objects = [];
        $error = null;

        $user = $request->user();
        $managerId = $user?->external_id;

        if ($managerId === null || $managerId === '') {
            return Inertia::render('External/Objects/Index', [
                'objects' => [],
                'error' => 'External ID belum di-set untuk akun ini; tidak dapat memuat daftar objek.',
                'externalAppUrl' => rtrim((string) config('services.external_api.app_url'), '/'),
            ]);
        }

        try {
            $response = $this->externalApiService->listBillingObjects($managerId, 1, 100);

            if ($response->successful()) {
                $data = $response->json();
                $rawObjects = is_array($data) ? ($data['objects'] ?? null) : null;

                if (is_array($rawObjects)) {
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
                    }, $rawObjects);
                } else {
                    $error = 'Format respons tidak valid dari sistem eksternal.';
                    Log::warning('External API /billing/objects unexpected format', ['data' => $data]);
                }
            } else {
                $error = 'Gagal mengambil data objects dari sistem eksternal.';
                Log::warning('External API /billing/objects non-200 response', [
                    'status' => $response->status(),
                    'manager_id' => $managerId,
                ]);
            }
        } catch (\Throwable $e) {
            $error = 'Tidak dapat terhubung ke sistem eksternal.';
            Log::error('External API /billing/objects connection error', [
                'error' => $e->getMessage(),
                'manager_id' => $managerId,
            ]);
        }

        return Inertia::render('External/Objects/Index', [
            'objects' => $objects,
            'error' => $error,
            'externalAppUrl' => rtrim((string) config('services.external_api.app_url'), '/'),
        ]);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $routePrefix = $this->getRoutePrefix($request);

        // Eager load profile and roles with permissions to avoid N+1 query
        if ($user) {
            $user->load(['profile', 'roles.permissions']);
        }

        // Get public settings for logo and site name
        $settings = Setting::getPublic()
            ->mapWithKeys(fn (Setting $setting) => [$setting->key => $setting->value])
            ->toArray();

        return [
            ...parent::share($request),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'is_admin' => $user->isAdmin(),
                    'dashboard_path' => $user->getDashboardPath(),
                    'primary_role_slug' => $user->getPrimaryRole()?->slug,
                    'profile' => $user->profile ? [
                        'id' => $user->profile->id,
                        'first_name' => $user->profile->first_name,
                        'last_name' => $user->profile->last_name,
                        'phone_number' => $user->profile->phone_number,
                        'avatar_url' => $user->profile->avatar_url,
                    ] : null,
                    'permissions' => $this->getUserPermissions($user),
                ] : null,
            ],
            'route_prefix' => $routePrefix,
            'menus' => $user ? Menu::getMenusForUser($user, $routePrefix)->toArray() : [],
            'settings' => $settings,
        ];
    }

    /**
     * Get the current route prefix (admin, user, or module).
     */
    private function getRoutePrefix(Request $request): string
    {
        $routeName = $request->route()?->getName() ?? '';

        if (str_starts_with($routeName, 'admin.')) {
            return 'admin';
        }

        if (str_starts_with($routeName, 'user.')) {
            return 'user';
        }

        if (str_starts_with($routeName, 'module.')) {
            return 'module';
        }

        return 'module'; // Default fallback
    }

    /**
     * Get the user's permissions grouped by module.
     *
     * @return array<string, array<string>>
     */
    private function getUserPermissions(\App\Models\User $user): array
    {
        $permissions = $user->getAllPermissions();

        $grouped = [];
        foreach ($permissions as $permission) {
            if (! isset($grouped[$permission->module])) {
                $grouped[$permission->module] = [];
            }
            $grouped[$permission->module][] = $permission->action;
        }

        return $grouped;
    }
}

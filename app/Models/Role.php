<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    /**
     * Default dashboard paths for system roles.
     */
    public const DEFAULT_DASHBOARD_PATHS = [
        'admin' => '/module/dashboard',
        'user' => '/module/dashboard',
        'account_manager' => '/account-manager/dashboard',
    ];

    /**
     * Default dashboard path for custom roles.
     */
    public const DEFAULT_CUSTOM_DASHBOARD_PATH = '/module/dashboard';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'dashboard_path',
        'is_system',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    /**
     * The permissions that belong to the role.
     *
     * @return BelongsToMany<Permission, $this>
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class)->withTimestamps();
    }

    /**
     * The users that belong to the role.
     *
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * Check if the role has a specific permission.
     */
    public function hasPermission(string $permissionSlug): bool
    {
        return $this->permissions()->where('slug', $permissionSlug)->exists();
    }

    /**
     * Check if the role has permission for a specific module and action.
     */
    public function hasPermissionFor(string $module, string $action): bool
    {
        return $this->permissions()
            ->where('module', $module)
            ->where('action', $action)
            ->exists();
    }

    /**
     * Give a permission to the role.
     */
    public function givePermission(Permission $permission): void
    {
        $this->permissions()->syncWithoutDetaching([$permission->id]);
    }

    /**
     * Revoke a permission from the role.
     */
    public function revokePermission(Permission $permission): void
    {
        $this->permissions()->detach($permission->id);
    }

    /**
     * Sync permissions for the role.
     *
     * @param  array<int>  $permissionIds
     */
    public function syncPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Check if this is the admin role.
     */
    public function isAdmin(): bool
    {
        return $this->slug === 'admin';
    }

    /**
     * Check if this is a system role (cannot be deleted).
     */
    public function isSystemRole(): bool
    {
        return $this->is_system;
    }

    /**
     * Get the dashboard path for this role.
     * Returns the custom dashboard_path if set, otherwise returns the default path based on role type.
     */
    public function getDashboardPath(): string
    {
        // If a custom dashboard path is set, use it
        if ($this->dashboard_path) {
            return $this->dashboard_path;
        }

        // Return default path based on role slug
        return self::DEFAULT_DASHBOARD_PATHS[$this->slug] ?? self::DEFAULT_CUSTOM_DASHBOARD_PATH;
    }
}

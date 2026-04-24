<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'external_id',
        'status',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The roles that belong to the user.
     *
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Check if the user has admin role.
     */
    public function isAdmin(): bool
    {
        return $this->roles()->where('slug', 'admin')->exists();
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $roleSlug): bool
    {
        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    /**
     * Check if the user has any of the given roles.
     *
     * @param  array<string>  $roleSlugs
     */
    public function hasAnyRole(array $roleSlugs): bool
    {
        return $this->roles()->whereIn('slug', $roleSlugs)->exists();
    }

    /**
     * Check if the user has a specific permission.
     */
    public function hasPermission(string $permissionSlug): bool
    {
        // Admin has all permissions
        if ($this->isAdmin()) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissionSlug) {
                $query->where('slug', $permissionSlug);
            })
            ->exists();
    }

    /**
     * Check if the user has permission for a specific module and action.
     */
    public function hasPermissionFor(string $module, string $action): bool
    {
        // Admin has all permissions
        if ($this->isAdmin()) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($module, $action) {
                $query->where('module', $module)->where('action', $action);
            })
            ->exists();
    }

    /**
     * Check if the user can perform an action on a module.
     */
    public function can($ability, $arguments = []): bool
    {
        // Check if it's a module.action format
        if (is_string($ability) && str_contains($ability, '.')) {
            [$module, $action] = explode('.', $ability, 2);

            return $this->hasPermissionFor($module, $action);
        }

        return parent::can($ability, $arguments);
    }

    /**
     * Get all permissions for the user through their roles.
     *
     * @return \Illuminate\Support\Collection<int, Permission>
     */
    public function getAllPermissions(): \Illuminate\Support\Collection
    {
        if ($this->isAdmin()) {
            return Permission::all();
        }

        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(Role $role): void
    {
        $this->roles()->syncWithoutDetaching([$role->id]);
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(Role $role): void
    {
        $this->roles()->detach($role->id);
    }

    /**
     * Sync roles for the user.
     *
     * @param  array<int>  $roleIds
     */
    public function syncRoles(array $roleIds): void
    {
        $this->roles()->sync($roleIds);
    }

    /**
     * @return HasMany<Todo, $this>
     */
    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    /**
     * @return HasMany<Page, $this>
     */
    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    /**
     * @return HasMany<Carousel, $this>
     */
    public function carousels(): HasMany
    {
        return $this->hasMany(Carousel::class);
    }

    /**
     * @return HasMany<Media, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    /**
     * @return HasMany<Post, $this>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the profile associated with the user.
     *
     * @return HasOne<UserProfile, $this>
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * @return HasOne<AccountManager, $this>
     */
    public function accountManager(): HasOne
    {
        return $this->hasOne(AccountManager::class);
    }

    /**
     * @return HasOne<ReferralRelation, $this>
     */
    public function referralRelation(): HasOne
    {
        return $this->hasOne(ReferralRelation::class);
    }

    /**
     * Get the primary role for the user.
     * Priority: admin > user > first custom role
     */
    public function getPrimaryRole(): ?Role
    {
        $roles = $this->roles()->get();

        if ($roles->isEmpty()) {
            return null;
        }

        // Check for admin role first (highest priority)
        $adminRole = $roles->firstWhere('slug', 'admin');
        if ($adminRole) {
            return $adminRole;
        }

        // Check for user role second
        $userRole = $roles->firstWhere('slug', 'user');
        if ($userRole) {
            return $userRole;
        }

        // Return the first custom role
        return $roles->first();
    }

    /**
     * Get the dashboard path for the user based on their primary role.
     */
    public function getDashboardPath(): string
    {
        $primaryRole = $this->getPrimaryRole();

        if ($primaryRole) {
            return $primaryRole->getDashboardPath();
        }

        // Default fallback if user has no roles
        return Role::DEFAULT_DASHBOARD_PATHS['user'] ?? '/dashboard';
    }
}

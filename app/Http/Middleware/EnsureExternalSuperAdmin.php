<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureExternalSuperAdmin
{
    /**
     * Allow only users with the external_super_admin role to proceed.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->getPrimaryRole()?->slug !== 'external_super_admin') {
            abort(403);
        }

        return $next($request);
    }
}

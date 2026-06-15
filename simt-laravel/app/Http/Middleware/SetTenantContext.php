<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = null;

        if (auth()->check()) {
            $tenant = auth()->user()->tenant;

            if ($tenant) {
                session(['tenant_id' => $tenant->id]);
                TenantScope::setTenantId($tenant->id);
            }
        }

        if (!$tenant && session()->has('tenant_id')) {
            $tenant = Tenant::find(session('tenant_id'));
        }

        if ($tenant) {
            app()->instance('currentTenant', $tenant);

            View::share('currentTenant', $tenant);
            View::share('tenantName', $tenant->name);
            View::share('tenantLogo', $tenant->logo);
            View::share('tenantCode', $tenant->code);

            config([
                'app.name' => $tenant->name . ' - SIMT MTs',
                'simt.current_tenant_id' => $tenant->id,
            ]);

            if ($tenant->npsn) {
                config(['simt.dapodik.npsn' => $tenant->npsn]);
            }

            if ($tenant->nism) {
                config(['simt.emis.nism' => $tenant->nism]);
            }
        }

        $this->setAcademicYearContext();

        return $next($request);
    }

    protected function setAcademicYearContext(): void
    {
        if (session()->has('academic_year_id')) {
            $academicYear = \App\Models\AcademicYear::find(session('academic_year_id'));
            if ($academicYear) {
                app()->instance('currentAcademicYear', $academicYear);
                View::share('currentAcademicYear', $academicYear);
                return;
            }
        }

        if (auth()->check() && auth()->user()->tenant_id) {
            $activeYear = \App\Models\AcademicYear::where('tenant_id', auth()->user()->tenant_id)
                ->where('is_active', true)
                ->first();

            if ($activeYear) {
                session(['academic_year_id' => $activeYear->id]);
                app()->instance('currentAcademicYear', $activeYear);
                View::share('currentAcademicYear', $activeYear);
            }
        }
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantScope
{
    protected static ?int $tenantId = null;

    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->tenant_id) {
            static::$tenantId = auth()->user()->tenant_id;
        }

        if (session()->has('tenant_id')) {
            static::$tenantId = session('tenant_id');
        }

        if (static::$tenantId) {
            $this->applyGlobalScope();
        }

        return $next($request);
    }

    protected function applyGlobalScope(): void
    {
        $tenantId = static::$tenantId;

        foreach ($this->getTenantModels() as $modelClass) {
            if (!class_exists($modelClass)) {
                continue;
            }

            $model = new $modelClass;

            if (!in_array('tenant_id', $model->getFillable())) {
                continue;
            }

            $model::addGlobalScope('tenant', function (Builder $builder) use ($tenantId) {
                $builder->where($builder->getModel()->qualifyColumn('tenant_id'), $tenantId);
            });
        }
    }

    protected function getTenantModels(): array
    {
        return [
            \App\Models\User::class,
            \App\Models\AcademicYear::class,
            \App\Models\Classroom::class,
            \App\Models\Subject::class,
            \App\Models\Student::class,
            \App\Models\Attendance::class,
            \App\Models\Grade::class,
            \App\Models\Payment::class,
            \App\Models\Announcement::class,
            \App\Models\WhatsappConfig::class,
        ];
    }

    public static function getTenantId(): ?int
    {
        return static::$tenantId;
    }

    public static function setTenantId(int $tenantId): void
    {
        static::$tenantId = $tenantId;
    }

    public static function withoutTenantScope(callable $callback): mixed
    {
        $tenantId = static::$tenantId;
        static::$tenantId = null;

        try {
            return $callback();
        } finally {
            static::$tenantId = $tenantId;
        }
    }

    public static function withTenantId(int $tenantId, callable $callback): mixed
    {
        $previousTenantId = static::$tenantId;
        static::$tenantId = $tenantId;

        try {
            return $callback();
        } finally {
            static::$tenantId = $previousTenantId;
        }
    }
}

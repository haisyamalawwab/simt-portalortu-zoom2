<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleSubscription
{
    protected array $moduleAccessMap = [
        'pendaftaran' => 'module_pendaftaran',
        'akademik' => 'module_akademik',
        'presensi' => 'module_presensi',
        'keuangan' => 'module_keuangan',
        'nilai' => 'module_nilai',
        'pegawai' => 'module_pegawai',
        'persuratan' => 'module_persuratan',
        'perpustakaan' => 'module_perpustakaan',
        'dapur' => 'module_dapur',
        'kantin' => 'module_kantin',
        'alumni' => 'module_alumni',
        'ppdb' => 'module_ppdb',
        'berita' => 'module_berita',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $module = $request->route()?->parameter('module')
            ?? $request->segment(2)
            ?? null;

        if (!$module) {
            return $next($request);
        }

        $module = strtolower($module);

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        $tenant = $user->tenant;

        if (!$tenant) {
            abort(403, 'Tidak ada tenant yang terkait dengan akun Anda.');
        }

        if (!$tenant->isSubscriptionActive()) {
            abort(403, 'Langganan Anda telah berakhir. Silakan perpanjang langganan.');
        }

        $configKey = $this->moduleAccessMap[$module] ?? null;

        if (!$configKey) {
            return $next($request);
        }

        $hasAccess = $tenant->getAttribute($configKey)
            ?? config("simt.modules.{$module}.default_access", true);

        if (!$hasAccess) {
            abort(403, "Modul {$module} tidak tersedia dalam paket langganan Anda. Silakan upgrade paket.");
        }

        return $next($request);
    }
}

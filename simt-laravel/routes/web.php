<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\WhatsappController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'tenant.scope', 'set.tenant.context'])->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('students')->name('students.')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->name('index');
        Route::get('/create', [StudentController::class, 'create'])->name('create');
        Route::post('/', [StudentController::class, 'store'])->name('store');
        Route::post('/import', [StudentController::class, 'import'])->name('import');
        Route::get('/export', [StudentController::class, 'export'])->name('export');
        Route::post('/sync-dapodik', [StudentController::class, 'syncDapodik'])->name('sync-dapodik');
        Route::get('/{student}', [StudentController::class, 'show'])->name('show');
        Route::get('/{student}/edit', [StudentController::class, 'edit'])->name('edit');
        Route::put('/{student}', [StudentController::class, 'update'])->name('update');
        Route::delete('/{student}', [StudentController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('attendances')->name('attendances.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/create', [AttendanceController::class, 'create'])->name('create');
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::get('/daily-report', [AttendanceController::class, 'dailyReport'])->name('daily-report');
        Route::get('/monthly-report', [AttendanceController::class, 'monthlyReport'])->name('monthly-report');
        Route::get('/{attendance}', [AttendanceController::class, 'show'])->name('show');
        Route::put('/{attendance}', [AttendanceController::class, 'update'])->name('update');
    });

    Route::prefix('grades')->name('grades.')->group(function () {
        Route::get('/', [GradeController::class, 'index'])->name('index');
        Route::get('/create', [GradeController::class, 'create'])->name('create');
        Route::post('/', [GradeController::class, 'store'])->name('store');
        Route::get('/rapor', [GradeController::class, 'rapor'])->name('rapor');
        Route::get('/{grade}', [GradeController::class, 'show'])->name('show');
        Route::put('/{grade}', [GradeController::class, 'update'])->name('update');
    });

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('index');
        Route::get('/create', [PaymentController::class, 'create'])->name('create');
        Route::post('/', [PaymentController::class, 'store'])->name('store');
        Route::post('/generate-spp', [PaymentController::class, 'generateSpp'])->name('generate-spp');
        Route::get('/{payment}', [PaymentController::class, 'show'])->name('show');
        Route::get('/{payment}/edit', [PaymentController::class, 'edit'])->name('edit');
        Route::put('/{payment}', [PaymentController::class, 'update'])->name('update');
        Route::get('/{payment}/receipt', [PaymentController::class, 'printReceipt'])->name('receipt');
    });

    Route::prefix('announcements')->name('announcements.')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index'])->name('index');
        Route::get('/create', [AnnouncementController::class, 'create'])->name('create');
        Route::post('/', [AnnouncementController::class, 'store'])->name('store');
        Route::get('/{announcement}', [AnnouncementController::class, 'show'])->name('show');
        Route::get('/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('edit');
        Route::put('/{announcement}', [AnnouncementController::class, 'update'])->name('update');
        Route::delete('/{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy');
        Route::post('/{announcement}/toggle-pin', [AnnouncementController::class, 'togglePin'])->name('toggle-pin');
        Route::post('/{announcement}/publish', [AnnouncementController::class, 'publish'])->name('publish');
    });

    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/', [WhatsappController::class, 'index'])->name('index');
        Route::post('/connect', [WhatsappController::class, 'connect'])->name('connect');
        Route::get('/status', [WhatsappController::class, 'status'])->name('status');
        Route::post('/send', [WhatsappController::class, 'send'])->name('send');
        Route::post('/send-bulk', [WhatsappController::class, 'sendBulk'])->name('send-bulk');
        Route::post('/disconnect', [WhatsappController::class, 'disconnect'])->name('disconnect');
    });

    Route::prefix('module')->middleware('check.module.subscription')->group(function () {
        Route::prefix('pendaftaran')->name('module.pendaftaran.')->group(function () {
            Route::get('/', fn () => view('modules.pendaftaran.index'))->name('index');
        });
        Route::prefix('akademik')->name('module.akademik.')->group(function () {
            Route::get('/', fn () => view('modules.akademik.index'))->name('index');
        });
        Route::prefix('presensi')->name('module.presensi.')->group(function () {
            Route::get('/', fn () => view('modules.presensi.index'))->name('index');
        });
        Route::prefix('keuangan')->name('module.keuangan.')->group(function () {
            Route::get('/', fn () => view('modules.keuangan.index'))->name('index');
        });
        Route::prefix('nilai')->name('module.nilai.')->group(function () {
            Route::get('/', fn () => view('modules.nilai.index'))->name('index');
        });
        Route::prefix('pegawai')->name('module.pegawai.')->group(function () {
            Route::get('/', fn () => view('modules.pegawai.index'))->name('index');
        });
        Route::prefix('persuratan')->name('module.persuratan.')->group(function () {
            Route::get('/', fn () => view('modules.persuratan.index'))->name('index');
        });
        Route::prefix('perpustakaan')->name('module.perpustakaan.')->group(function () {
            Route::get('/', fn () => view('modules.perpustakaan.index'))->name('index');
        });
        Route::prefix('dapur')->name('module.dapur.')->group(function () {
            Route::get('/', fn () => view('modules.dapur.index'))->name('index');
        });
        Route::prefix('kantin')->name('module.kantin.')->group(function () {
            Route::get('/', fn () => view('modules.kantin.index'))->name('index');
        });
        Route::prefix('alumni')->name('module.alumni.')->group(function () {
            Route::get('/', fn () => view('modules.alumni.index'))->name('index');
        });
        Route::prefix('ppdb')->name('module.ppdb.')->group(function () {
            Route::get('/', fn () => view('modules.ppdb.index'))->name('index');
        });
        Route::prefix('berita')->name('module.berita.')->group(function () {
            Route::get('/', fn () => view('modules.berita.index'))->name('index');
        });
    });
});

require __DIR__ . '/auth.php';

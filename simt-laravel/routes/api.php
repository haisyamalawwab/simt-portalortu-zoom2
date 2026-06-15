<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\WhatsappController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(['auth:sanctum', 'tenant.scope', 'set.tenant.context'])->group(function () {

    Route::get('/me', function () {
        return response()->json([
            'user' => auth()->user()->load('tenant'),
            'tenant' => auth()->user()->tenant,
        ]);
    })->name('api.me');

    Route::prefix('students')->name('api.students.')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->name('index');
        Route::get('/{student}', [StudentController::class, 'show'])->name('show');
    });

    Route::prefix('attendances')->name('api.attendances.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/daily-report', [AttendanceController::class, 'dailyReport'])->name('daily-report');
        Route::get('/monthly-report', [AttendanceController::class, 'monthlyReport'])->name('monthly-report');
        Route::get('/{attendance}', [AttendanceController::class, 'show'])->name('show');
    });

    Route::prefix('grades')->name('api.grades.')->group(function () {
        Route::get('/', [GradeController::class, 'index'])->name('index');
        Route::get('/rapor', [GradeController::class, 'rapor'])->name('rapor');
        Route::get('/{grade}', [GradeController::class, 'show'])->name('show');
    });

    Route::prefix('payments')->name('api.payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('index');
        Route::get('/{payment}', [PaymentController::class, 'show'])->name('show');
    });

    Route::prefix('announcements')->name('api.announcements.')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index'])->name('index');
        Route::get('/{announcement}', [AnnouncementController::class, 'show'])->name('show');
    });
});

Route::prefix('v1/webhooks')->name('api.webhooks.')->group(function () {
    Route::post('/payment/callback', [PaymentController::class, 'paymentCallback'])
        ->name('payment-callback')
        ->withoutMiddleware(['auth:sanctum', 'tenant.scope', 'set.tenant.context']);

    Route::post('/whatsapp/callback', [WhatsappController::class, 'disconnect'])
        ->name('whatsapp-callback')
        ->withoutMiddleware(['auth:sanctum', 'tenant.scope', 'set.tenant.context']);
});

Route::prefix('v1/parent')->name('api.parent.')->middleware(['auth:sanctum', 'tenant.scope', 'set.tenant.context'])->group(function () {
    Route::get('/children', function () {
        $user = auth()->user();
        $children = \App\Models\Student::where('tenant_id', $user->tenant_id)
            ->where('parent_email', $user->email)
            ->orWhere('father_phone', $user->phone)
            ->orWhere('mother_phone', $user->phone)
            ->with(['classroom.waliKelas'])
            ->get();

        return response()->json(['children' => $children]);
    })->name('children');

    Route::get('/children/{student}/attendance', function (\App\Models\Student $student) {
        $month = request()->input('month', now()->month);
        $year = request()->input('year', now()->year);

        $attendances = \App\Models\Attendance::where('student_id', $student->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get();

        $summary = $student->getAttendanceSummary($month, $year);

        return response()->json([
            'attendances' => $attendances,
            'summary' => $summary,
        ]);
    })->name('children.attendance');

    Route::get('/children/{student}/grades', function (\App\Models\Student $student) {
        $grades = \App\Models\Grade::where('student_id', $student->id)
            ->with(['subject', 'teacher'])
            ->get()
            ->groupBy('subject.name');

        return response()->json(['grades' => $grades]);
    })->name('children.grades');

    Route::get('/children/{student}/payments', function (\App\Models\Student $student) {
        $payments = \App\Models\Payment::where('student_id', $student->id)
            ->orderBy('due_date', 'desc')
            ->get();

        $totalUnpaid = $student->getTotalUnpaidPayments();

        return response()->json([
            'payments' => $payments,
            'total_unpaid' => $totalUnpaid,
        ]);
    })->name('children.payments');

    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements');
});

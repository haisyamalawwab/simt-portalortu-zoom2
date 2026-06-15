<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        if ($user->isParent()) {
            return $this->parentDashboard($user, $tenantId);
        }

        if ($user->isWaliKelas()) {
            return $this->waliKelasDashboard($user, $tenantId);
        }

        return $this->adminDashboard($tenantId);
    }

    protected function adminDashboard(int $tenantId): View
    {
        $totalStudents = Student::where('tenant_id', $tenantId)->where('is_active', true)->count();
        $totalClassrooms = Classroom::where('tenant_id', $tenantId)->count();
        $totalTeachers = User::where('tenant_id', $tenantId)
            ->whereIn('role', ['guru', 'wali_kelas'])
            ->where('is_active', true)
            ->count();
        $totalSubjects = Subject::where('tenant_id', $tenantId)->count();

        $activeAcademicYear = AcademicYear::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->first();

        $todayAttendances = Attendance::where('tenant_id', $tenantId)
            ->where('date', now()->toDateString())
            ->get();
        $attendanceSummary = [
            'hadir' => $todayAttendances->where('status', 'HADIR')->count(),
            'sakit' => $todayAttendances->where('status', 'SAKIT')->count(),
            'izin' => $todayAttendances->where('status', 'IZIN')->count(),
            'alpha' => $todayAttendances->where('status', 'ALPHA')->count(),
        ];

        $unpaidPayments = Payment::where('tenant_id', $tenantId)
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->count();
        $totalUnpaidAmount = Payment::where('tenant_id', $tenantId)
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->sum('amount') - Payment::where('tenant_id', $tenantId)
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->sum('paid_amount');

        $monthlyPaymentStats = Payment::where('tenant_id', $tenantId)
            ->where('year', now()->year)
            ->selectRaw('month, status, sum(amount) as total_amount, sum(paid_amount) as total_paid')
            ->groupBy('month', 'status')
            ->get()
            ->groupBy('month');

        $recentAnnouncements = Announcement::where('tenant_id', $tenantId)
            ->published()
            ->notExpired()
            ->latest()
            ->take(5)
            ->get();

        $classroomDistribution = Classroom::where('tenant_id', $tenantId)
            ->withCount(['students' => function ($q) {
                $q->where('is_active', true);
            }])
            ->get();

        $genderDistribution = Student::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->selectRaw('gender, count(*) as count')
            ->groupBy('gender')
            ->pluck('count', 'gender')
            ->toArray();

        return view('dashboard.admin', compact(
            'totalStudents',
            'totalClassrooms',
            'totalTeachers',
            'totalSubjects',
            'activeAcademicYear',
            'attendanceSummary',
            'todayAttendances',
            'unpaidPayments',
            'totalUnpaidAmount',
            'monthlyPaymentStats',
            'recentAnnouncements',
            'classroomDistribution',
            'genderDistribution',
        ));
    }

    protected function waliKelasDashboard(User $user, int $tenantId): View
    {
        $classrooms = Classroom::where('tenant_id', $tenantId)
            ->where('wali_kelas_id', $user->id)
            ->with(['students' => function ($q) {
                $q->where('is_active', true);
            }])
            ->get();

        $classroomIds = $classrooms->pluck('id');

        $todayAttendances = Attendance::where('tenant_id', $tenantId)
            ->where('date', now()->toDateString())
            ->whereIn('student_id', function ($q) use ($classroomIds) {
                $q->select('id')->from('students')->whereIn('classroom_id', $classroomIds);
            })
            ->get();

        $attendanceSummary = [
            'hadir' => $todayAttendances->where('status', 'HADIR')->count(),
            'sakit' => $todayAttendances->where('status', 'SAKIT')->count(),
            'izin' => $todayAttendances->where('status', 'IZIN')->count(),
            'alpha' => $todayAttendances->where('status', 'ALPHA')->count(),
        ];

        $totalStudents = $classrooms->sum(fn ($c) => $c->students->count());

        $recentAnnouncements = Announcement::where('tenant_id', $tenantId)
            ->published()
            ->notExpired()
            ->latest()
            ->take(5)
            ->get();

        return view('dashboard.wali-kelas', compact(
            'classrooms',
            'todayAttendances',
            'attendanceSummary',
            'totalStudents',
            'recentAnnouncements',
        ));
    }

    protected function parentDashboard(User $user, int $tenantId): View
    {
        $children = Student::where('tenant_id', $tenantId)
            ->where('parent_email', $user->email)
            ->orWhere('father_phone', $user->phone)
            ->orWhere('mother_phone', $user->phone)
            ->with(['classroom', 'attendances' => function ($q) {
                $q->whereMonth('date', now()->month)->whereYear('date', now()->year);
            }])
            ->get();

        $childIds = $children->pluck('id');

        $unpaidPayments = Payment::where('tenant_id', $tenantId)
            ->whereIn('student_id', $childIds)
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->get();

        $recentAnnouncements = Announcement::where('tenant_id', $tenantId)
            ->published()
            ->notExpired()
            ->latest()
            ->take(5)
            ->get();

        return view('dashboard.parent', compact(
            'children',
            'unpaidPayments',
            'recentAnnouncements',
        ));
    }
}

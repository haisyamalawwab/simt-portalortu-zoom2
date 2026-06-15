<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AttendanceController extends Controller
{
    public function index(Request $request): View
    {
        $query = Attendance::with(['student.classroom', 'recorder']);

        if ($request->filled('date')) {
            $query->where('date', $request->input('date'));
        } else {
            $query->where('date', now()->toDateString());
        }

        if ($request->filled('classroom_id')) {
            $studentIds = Student::where('classroom_id', $request->input('classroom_id'))->pluck('id');
            $query->whereIn('student_id', $studentIds);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $attendances = $query->orderBy('created_at', 'desc')->paginate(50)->withQueryString();
        $classrooms = Classroom::orderBy('level')->orderBy('name')->get();

        return view('attendances.index', compact('attendances', 'classrooms'));
    }

    public function create(Request $request): View
    {
        $classroomId = $request->input('classroom_id');
        $date = $request->input('date', now()->toDateString());

        $classrooms = Classroom::with(['students' => function ($q) {
            $q->where('is_active', true)->orderBy('name');
        }])->orderBy('level')->orderBy('name')->get();

        $selectedClassroom = $classroomId ? Classroom::find($classroomId) : $classrooms->first();

        if ($selectedClassroom) {
            $existingAttendances = Attendance::where('date', $date)
                ->whereIn('student_id', $selectedClassroom->students->pluck('id'))
                ->get()
                ->keyBy('student_id');

            $students = $selectedClassroom->students->map(function ($student) use ($existingAttendances) {
                $student->todayAttendance = $existingAttendances->get($student->id);
                return $student;
            });
        } else {
            $students = collect();
        }

        return view('attendances.create', compact('classrooms', 'selectedClassroom', 'students', 'date'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:HADIR,SAKIT,IZIN,ALPHA',
            'attendances.*.time_in' => 'nullable|date_format:H:i',
            'attendances.*.time_out' => 'nullable|date_format:H:i',
            'attendances.*.note' => 'nullable|string|max:255',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $recordedBy = auth()->id();
        $created = 0;
        $updated = 0;

        foreach ($validated['attendances'] as $attendanceData) {
            $data = [
                'tenant_id' => $tenantId,
                'student_id' => $attendanceData['student_id'],
                'date' => $validated['date'],
                'status' => $attendanceData['status'],
                'time_in' => $attendanceData['time_in'] ?? null,
                'time_out' => $attendanceData['time_out'] ?? null,
                'note' => $attendanceData['note'] ?? null,
                'recorded_by' => $recordedBy,
            ];

            $existing = Attendance::where('tenant_id', $tenantId)
                ->where('student_id', $data['student_id'])
                ->where('date', $data['date'])
                ->first();

            if ($existing) {
                $existing->update($data);
                $updated++;
            } else {
                Attendance::create($data);
                $created++;
            }
        }

        return redirect()->route('attendances.index', ['date' => $validated['date']])
            ->with('success', "Presensi berhasil disimpan. {$created} baru, {$updated} diperbarui.");
    }

    public function show(Attendance $attendance): View
    {
        $attendance->load(['student.classroom', 'recorder']);

        return view('attendances.show', compact('attendance'));
    }

    public function update(Request $request, Attendance $attendance): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:HADIR,SAKIT,IZIN,ALPHA',
            'time_in' => 'nullable|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'note' => 'nullable|string|max:255',
        ]);

        $attendance->update($validated);

        return redirect()->back()
            ->with('success', 'Presensi berhasil diperbarui.');
    }

    public function dailyReport(Request $request): View
    {
        $date = $request->input('date', now()->toDateString());
        $tenantId = auth()->user()->tenant_id;

        $attendances = Attendance::where('tenant_id', $tenantId)
            ->where('date', $date)
            ->with(['student.classroom'])
            ->get();

        $summary = [
            'hadir' => $attendances->where('status', 'HADIR')->count(),
            'sakit' => $attendances->where('status', 'SAKIT')->count(),
            'izin' => $attendances->where('status', 'IZIN')->count(),
            'alpha' => $attendances->where('status', 'ALPHA')->count(),
            'total' => $attendances->count(),
        ];

        $byClassroom = $attendances->groupBy(fn ($a) => $a->student->classroom->name ?? 'Tanpa Kelas')
            ->map(function ($group) {
                return [
                    'hadir' => $group->where('status', 'HADIR')->count(),
                    'sakit' => $group->where('status', 'SAKIT')->count(),
                    'izin' => $group->where('status', 'IZIN')->count(),
                    'alpha' => $group->where('status', 'ALPHA')->count(),
                    'total' => $group->count(),
                ];
            });

        return view('attendances.daily-report', compact('date', 'attendances', 'summary', 'byClassroom'));
    }

    public function monthlyReport(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $classroomId = $request->input('classroom_id');
        $tenantId = auth()->user()->tenant_id;

        $studentQuery = Student::where('tenant_id', $tenantId)->where('is_active', true);

        if ($classroomId) {
            $studentQuery->where('classroom_id', $classroomId);
        }

        $students = $studentQuery->with(['classroom'])->orderBy('name')->get();
        $studentIds = $students->pluck('id');

        $attendances = Attendance::where('tenant_id', $tenantId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->groupBy('student_id');

        $reportData = $students->map(function ($student) use ($attendances) {
            $studentAttendances = $attendances->get($student->id, collect());

            return [
                'student' => $student,
                'hadir' => $studentAttendances->where('status', 'HADIR')->count(),
                'sakit' => $studentAttendances->where('status', 'SAKIT')->count(),
                'izin' => $studentAttendances->where('status', 'IZIN')->count(),
                'alpha' => $studentAttendances->where('status', 'ALPHA')->count(),
                'total' => $studentAttendances->count(),
                'percentage' => $studentAttendances->count() > 0
                    ? round(($studentAttendances->where('status', 'HADIR')->count() / $studentAttendances->count()) * 100, 1)
                    : 0,
            ];
        });

        $classrooms = Classroom::orderBy('level')->orderBy('name')->get();

        if ($request->input('export') === 'pdf') {
            $pdf = Pdf::loadView('attendances.monthly-report-pdf', compact('reportData', 'month', 'year'));
            return $pdf->stream("laporan-presensi-{$month}-{$year}.pdf");
        }

        return view('attendances.monthly-report', compact('reportData', 'month', 'year', 'classrooms', 'classroomId'));
    }
}

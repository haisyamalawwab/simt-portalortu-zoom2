<?php

namespace App\Http\Controllers;

use App\Exports\StudentsExport;
use App\Imports\StudentsImport;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    public function index(Request $request): View
    {
        $query = Student::with(['classroom', 'tenant']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->input('classroom_id'));
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->input('gender'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        } else {
            $query->where('is_active', true);
        }

        $students = $query->orderBy('name')->paginate(20)->withQueryString();
        $classrooms = Classroom::orderBy('level')->orderBy('name')->get();

        return view('students.index', compact('students', 'classrooms'));
    }

    public function create(): View
    {
        $classrooms = Classroom::orderBy('level')->orderBy('name')->get();

        return view('students.create', compact('classrooms'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nis' => 'required|string|max:20',
            'nisn' => 'nullable|string|max:20',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'father_name' => 'nullable|string|max:100',
            'father_phone' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:100',
            'mother_phone' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email|max:255',
            'nik' => 'nullable|string|max:20',
            'religion' => 'nullable|in:ISLAM,KRISTEN,KATOLIK,HINDU,BUDDHA,KONGHUCU',
            'enrollment_date' => 'nullable|date',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['is_active'] = true;

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('student-photos', 'public');
        }

        $student = Student::create($validated);

        $tenant = Tenant::find($validated['tenant_id']);
        if ($tenant) {
            $tenant->increment('current_students');
        }

        return redirect()->route('students.show', $student)
            ->with('success', 'Siswa berhasil ditambahkan.');
    }

    public function show(Student $student): View
    {
        $student->load([
            'classroom.waliKelas',
            'attendances' => fn ($q) => $q->latest()->take(30),
            'grades.subject',
            'payments' => fn ($q) => $q->latest()->take(20),
        ]);

        $attendanceSummary = $student->getAttendanceSummary(
            now()->month,
            now()->year
        );

        $totalUnpaid = $student->getTotalUnpaidPayments();

        return view('students.show', compact('student', 'attendanceSummary', 'totalUnpaid'));
    }

    public function edit(Student $student): View
    {
        $classrooms = Classroom::orderBy('level')->orderBy('name')->get();

        return view('students.edit', compact('student', 'classrooms'));
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'nis' => 'required|string|max:20',
            'nisn' => 'nullable|string|max:20',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'father_name' => 'nullable|string|max:100',
            'father_phone' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:100',
            'mother_phone' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email|max:255',
            'nik' => 'nullable|string|max:20',
            'religion' => 'nullable|in:ISLAM,KRISTEN,KATOLIK,HINDU,BUDDHA,KONGHUCU',
            'enrollment_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('student-photos', 'public');
        }

        $student->update($validated);

        return redirect()->route('students.show', $student)
            ->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $tenant = $student->tenant;

        $student->delete();

        if ($tenant && $student->is_active) {
            $tenant->decrement('current_students');
        }

        return redirect()->route('students.index')
            ->with('success', 'Siswa berhasil dihapus.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            $import = new StudentsImport(auth()->user()->tenant_id);
            Excel::import($import, $request->file('file'));

            return redirect()->route('students.index')
                ->with('success', "Berhasil mengimpor {$import->getRowCount()} siswa.");
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = collect($failures)->map(function ($failure) {
                return "Baris {$failure->row()}: " . implode(', ', $failure->errors());
            })->join('<br>');

            return redirect()->route('students.index')
                ->with('error', "Gagal mengimpor data:<br>{$errors}");
        }
    }

    public function export(Request $request)
    {
        $classroomId = $request->input('classroom_id');

        return Excel::download(new StudentsExport($classroomId), 'data-siswa-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function syncDapodik(Request $request): JsonResponse
    {
        $tenant = auth()->user()->tenant;

        if (!$tenant->npsn) {
            return response()->json([
                'success' => false,
                'message' => 'NPSN belum diatur. Silakan atur NPSN terlebih dahulu di pengaturan sekolah.',
            ], 422);
        }

        try {
            $dapodikUrl = config('simt.dapodik.api_url');
            $dapodikToken = config('simt.dapodik.api_token');

            $response = \Http::withHeaders([
                'Authorization' => "Bearer {$dapodikToken}",
                'Accept' => 'application/json',
            ])->get("{$dapodikUrl}/sekolah/{$tenant->npsn}/peserta_didik");

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal terhubung ke server DAPODIK. Kode: ' . $response->status(),
                ], 502);
            }

            $dapodikStudents = $response->json('data') ?? [];
            $synced = 0;
            $created = 0;

            foreach ($dapodikStudents as $dapodikStudent) {
                $existing = Student::where('nisn', $dapodikStudent['nisn'] ?? null)->first();

                $studentData = [
                    'tenant_id' => $tenant->id,
                    'nis' => $dapodikStudent['nis'] ?? $dapodikStudent['no_induk'] ?? null,
                    'nisn' => $dapodikStudent['nisn'] ?? null,
                    'name' => $dapodikStudent['nama'] ?? null,
                    'gender' => ($dapodikStudent['jenis_kelamin'] ?? 'L') === 'L' ? 'L' : 'P',
                    'birth_place' => $dapodikStudent['tempat_lahir'] ?? null,
                    'birth_date' => $dapodikStudent['tanggal_lahir'] ?? null,
                    'address' => $dapodikStudent['alamat'] ?? null,
                    'nik' => $dapodikStudent['nik'] ?? null,
                    'religion' => strtoupper($dapodikStudent['agama'] ?? 'ISLAM'),
                ];

                if ($existing) {
                    $existing->update($studentData);
                    $synced++;
                } else {
                    Student::create($studentData);
                    $created++;
                    $tenant->increment('current_students');
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Sinkronisasi DAPODIK berhasil. {$created} siswa baru, {$synced} siswa diperbarui.",
                'data' => [
                    'created' => $created,
                    'updated' => $synced,
                    'total' => count($dapodikStudents),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat sinkronisasi: ' . $e->getMessage(),
            ], 500);
        }
    }
}

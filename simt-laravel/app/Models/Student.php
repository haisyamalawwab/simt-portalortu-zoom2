<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'classroom_id',
        'nis',
        'nisn',
        'name',
        'gender',
        'birth_place',
        'birth_date',
        'address',
        'photo',
        'father_name',
        'father_phone',
        'mother_name',
        'mother_phone',
        'guardian_name',
        'guardian_phone',
        'parent_email',
        'nik',
        'religion',
        'enrollment_date',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'enrollment_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getGenderLabel(): string
    {
        return $this->gender === 'L' ? 'Laki-laki' : 'Perempuan';
    }

    public function getReligionLabel(): string
    {
        return match ($this->religion) {
            'ISLAM' => 'Islam',
            'KRISTEN' => 'Kristen Protestan',
            'KATOLIK' => 'Katolik',
            'HINDU' => 'Hindu',
            'BUDDHA' => 'Buddha',
            'KONGHUCU' => 'Konghucu',
            default => $this->religion,
        };
    }

    public function getParentPhone(): ?string
    {
        return $this->father_phone
            ?? $this->mother_phone
            ?? $this->guardian_phone;
    }

    public function getParentName(): ?string
    {
        return $this->father_name
            ?? $this->mother_name
            ?? $this->guardian_name;
    }

    public function getAttendanceSummary(string $month = null, string $year = null): array
    {
        $query = $this->attendances();

        if ($month && $year) {
            $query->whereMonth('date', $month)->whereYear('date', $year);
        }

        $attendances = $query->get();

        return [
            'hadir' => $attendances->where('status', 'HADIR')->count(),
            'sakit' => $attendances->where('status', 'SAKIT')->count(),
            'izin' => $attendances->where('status', 'IZIN')->count(),
            'alpha' => $attendances->where('status', 'ALPHA')->count(),
            'total' => $attendances->count(),
        ];
    }

    public function getTotalUnpaidPayments(): float
    {
        return $this->payments()
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->sum('amount') - $this->payments()
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->sum('paid_amount');
    }
}

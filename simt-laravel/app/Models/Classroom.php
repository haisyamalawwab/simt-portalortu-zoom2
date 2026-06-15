<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classroom extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'academic_year_id',
        'name',
        'level',
        'capacity',
        'wali_kelas_id',
    ];

    protected $casts = [
        'level' => 'integer',
        'capacity' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'wali_kelas_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function activeStudents()
    {
        return $this->hasMany(Student::class)->where('is_active', true);
    }

    public function getStudentCount(): int
    {
        return $this->students()->where('is_active', true)->count();
    }

    public function isAtCapacity(): bool
    {
        return $this->getStudentCount() >= $this->capacity;
    }

    public function getLevelLabel(): string
    {
        return match ((int) $this->level) {
            7 => 'Kelas VII',
            8 => 'Kelas VIII',
            9 => 'Kelas IX',
            default => 'Kelas ' . $this->level,
        };
    }
}

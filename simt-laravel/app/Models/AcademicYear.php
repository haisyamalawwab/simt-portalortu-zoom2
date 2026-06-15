<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'semester',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function classrooms()
    {
        return $this->hasMany(Classroom::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getSemesterLabel(): string
    {
        return $this->semester === 'GANJIL' ? 'Ganjil' : 'Genap';
    }

    public function getFullName(): string
    {
        return $this->name . ' - Semester ' . $this->getSemesterLabel();
    }
}

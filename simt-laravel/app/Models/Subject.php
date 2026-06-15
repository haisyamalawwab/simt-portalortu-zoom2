<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'classroom_id',
        'name',
        'code',
        'hours_per_week',
        'teacher_id',
        'category',
    ];

    protected $casts = [
        'hours_per_week' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function getCategoryLabel(): string
    {
        return match ($this->category) {
            'UMUM' => 'Mata Pelajaran Umum',
            'AGAMA_ISLAM' => 'Pendidikan Agama Islam',
            'MUATAN_LOKAL' => 'Muatan Lokal',
            'PENGEMBANGAN_DIRI' => 'Pengembangan Diri',
            'EKSTRAKURIKULER' => 'Ekstrakurikuler',
            default => $this->category,
        };
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'date',
        'status',
        'time_in',
        'time_out',
        'note',
        'recorded_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'HADIR' => 'Hadir',
            'SAKIT' => 'Sakit',
            'IZIN' => 'Izin',
            'ALPHA' => 'Alpha (Tanpa Keterangan)',
            default => $this->status,
        };

    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'HADIR' => 'green',
            'SAKIT' => 'yellow',
            'IZIN' => 'blue',
            'ALPHA' => 'red',
            default => 'gray',
        };
    }

    public function scopeByDate($query, string $date)
    {
        return $query->where('date', $date);
    }

    public function scopeByMonth($query, int $month, int $year)
    {
        return $query->whereMonth('date', $month)->whereYear('date', $year);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'address',
        'city',
        'province',
        'phone',
        'email',
        'logo',
        'npsn',
        'nism',
        'is_active',
        'subscription_end',
        'max_students',
        'current_students',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscription_end' => 'date',
        'current_students' => 'integer',
        'max_students' => 'integer',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function academicYears()
    {
        return $this->hasMany(AcademicYear::class);
    }

    public function classrooms()
    {
        return $this->hasMany(Classroom::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
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

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function whatsappConfigs()
    {
        return $this->hasMany(WhatsappConfig::class);
    }

    public function isSubscriptionActive(): bool
    {
        return $this->is_active
            && ($this->subscription_end === null || $this->subscription_end->isFuture());
    }

    public function hasCapacityForMoreStudents(): bool
    {
        return $this->current_students < $this->max_students;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

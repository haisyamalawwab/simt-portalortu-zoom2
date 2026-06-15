<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'nuptk',
        'nip',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function waliKelasClassrooms()
    {
        return $this->hasMany(Classroom::class, 'wali_kelas_id');
    }

    public function taughtSubjects()
    {
        return $this->hasMany(Subject::class, 'teacher_id');
    }

    public function recordedAttendances()
    {
        return $this->hasMany(Attendance::class, 'recorded_by');
    }

    public function givenGrades()
    {
        return $this->hasMany(Grade::class, 'teacher_id');
    }

    public function createdAnnouncements()
    {
        return $this->hasMany(Announcement::class, 'created_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['superadmin', 'admin']);
    }

    public function isGuru(): bool
    {
        return $this->role === 'guru' || $this->role === 'wali_kelas';
    }

    public function isWaliKelas(): bool
    {
        return $this->role === 'wali_kelas';
    }

    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'type',
        'amount',
        'month',
        'year',
        'status',
        'paid_amount',
        'paid_at',
        'payment_method',
        'transaction_ref',
        'note',
        'due_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'month' => 'integer',
        'year' => 'integer',
        'paid_at' => 'datetime',
        'due_date' => 'date',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'SPP' => 'SPP Bulanan',
            'DAFTAR_ULANG' => 'Daftar Ulang',
            'SERAGAM' => 'Seragam',
            'BUKU' => 'Buku Pelajaran',
            'KEGIATAN' => 'Kegiatan',
            'LAIN_LAIN' => 'Lain-lain',
            default => $this->type,
        };
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'BELUM_BAYAR' => 'Belum Bayar',
            'MENUNGGU' => 'Menunggu Konfirmasi',
            'LUNAS' => 'Lunas',
            'SEBAGIAN' => 'Sebagian',
            default => $this->status,
        };
    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'BELUM_BAYAR' => 'red',
            'MENUNGGU' => 'yellow',
            'LUNAS' => 'green',
            'SEBAGIAN' => 'orange',
            default => 'gray',
        };
    }

    public function getRemainingAmount(): float
    {
        return max(0, $this->amount - $this->paid_amount);
    }

    public function isPaid(): bool
    {
        return $this->status === 'LUNAS';
    }

    public function isOverdue(): bool
    {
        return $this->due_date
            && $this->status !== 'LUNAS'
            && $this->due_date->isPast();
    }

    public function getMonthLabel(): string
    {
        if (!$this->month) return '-';

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return ($months[$this->month] ?? 'Unknown') . ($this->year ? ' ' . $this->year : '');
    }

    public function scopeUnpaid($query)
    {
        return $query->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN']);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'LUNAS');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'LUNAS')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now());
    }

    public function scopeByMonthYear($query, int $month, int $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }
}

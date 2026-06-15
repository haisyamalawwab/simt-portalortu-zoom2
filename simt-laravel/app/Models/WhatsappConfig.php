<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'session_name',
        'session_id',
        'qr_code',
        'is_connected',
        'phone_number',
        'last_connected_at',
    ];

    protected $casts = [
        'is_connected' => 'boolean',
        'last_connected_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isConnected(): bool
    {
        return $this->is_connected;
    }

    public function markConnected(string $sessionId, string $phoneNumber): void
    {
        $this->update([
            'is_connected' => true,
            'session_id' => $sessionId,
            'phone_number' => $phoneNumber,
            'last_connected_at' => now(),
            'qr_code' => null,
        ]);
    }

    public function markDisconnected(): void
    {
        $this->update([
            'is_connected' => false,
            'session_id' => null,
            'qr_code' => null,
        ]);
    }

    public function updateQrCode(string $qrCode): void
    {
        $this->update([
            'qr_code' => $qrCode,
            'is_connected' => false,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\WhatsappConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsappController extends Controller
{
    public function index()
    {
        $tenantId = auth()->user()->tenant_id;

        $configs = WhatsappConfig::where('tenant_id', $tenantId)->get();

        return view('whatsapp.index', compact('configs'));
    }

    public function connect(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $sessionName = $request->input('session_name', 'simt_' . $tenantId);

        $config = WhatsappConfig::firstOrCreate(
            [
                'tenant_id' => $tenantId,
                'session_name' => $sessionName,
            ],
            [
                'is_connected' => false,
            ]
        );

        try {
            $baileysUrl = config('simt.whatsapp.baileys_url');
            $baileysApiKey = config('simt.whatsapp.baileys_api_key');

            $response = \Http::withHeaders([
                'Authorization' => "Bearer {$baileysApiKey}",
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post("{$baileysUrl}/sessions", [
                'sessionId' => $sessionName,
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat sesi WhatsApp: ' . $response->body(),
                ], 502);
            }

            $qrResponse = \Http::withHeaders([
                'Authorization' => "Bearer {$baileysApiKey}",
                'Accept' => 'application/json',
            ])->get("{$baileysUrl}/sessions/{$sessionName}/qr");

            if ($qrResponse->successful()) {
                $qrData = $qrResponse->json();
                $qrCode = $qrData['qr'] ?? $qrData['data'] ?? null;

                $config->updateQrCode($qrCode);

                return response()->json([
                    'success' => true,
                    'qr_code' => $qrCode,
                    'session_name' => $sessionName,
                    'message' => 'Scan QR code dengan WhatsApp Anda untuk menghubungkan.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan QR code. Pastikan Baileys service berjalan.',
            ], 502);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal terhubung ke Baileys service: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $sessionName = $request->input('session_name', 'simt_' . $tenantId);

        $config = WhatsappConfig::where('tenant_id', $tenantId)
            ->where('session_name', $sessionName)
            ->first();

        if (!$config) {
            return response()->json([
                'success' => true,
                'is_connected' => false,
                'message' => 'Belum ada sesi WhatsApp.',
            ]);
        }

        try {
            $baileysUrl = config('simt.whatsapp.baileys_url');
            $baileysApiKey = config('simt.whatsapp.baileys_api_key');

            $response = \Http::withHeaders([
                'Authorization' => "Bearer {$baileysApiKey}",
                'Accept' => 'application/json',
            ])->get("{$baileysUrl}/sessions/{$sessionName}");

            if ($response->successful()) {
                $data = $response->json();
                $isConnected = ($data['status'] ?? '') === 'CONNECTED';
                $phoneNumber = $data['phone'] ?? $data['jid'] ?? null;

                if ($isConnected && !$config->is_connected) {
                    $config->markConnected($sessionName, $phoneNumber);
                } elseif (!$isConnected && $config->is_connected) {
                    $config->markDisconnected();
                }

                return response()->json([
                    'success' => true,
                    'is_connected' => $isConnected,
                    'phone_number' => $phoneNumber,
                    'session_name' => $sessionName,
                    'last_connected_at' => $config->last_connected_at?->toIso8601String(),
                    'qr_code' => $config->qr_code,
                ]);
            }

            return response()->json([
                'success' => true,
                'is_connected' => $config->is_connected,
                'phone_number' => $config->phone_number,
                'session_name' => $sessionName,
                'last_connected_at' => $config->last_connected_at?->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'is_connected' => $config->is_connected,
                'phone_number' => $config->phone_number,
                'session_name' => $sessionName,
                'last_connected_at' => $config->last_connected_at?->toIso8601String(),
                'error' => 'Tidak dapat memeriksa status Baileys: ' . $e->getMessage(),
            ]);
        }
    }

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string|max:4096',
            'session_name' => 'nullable|string',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $sessionName = $validated['session_name'] ?? 'simt_' . $tenantId;

        $config = WhatsappConfig::where('tenant_id', $tenantId)
            ->where('session_name', $sessionName)
            ->first();

        if (!$config || !$config->is_connected) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp belum terhubung. Silakan hubungkan terlebih dahulu.',
            ], 422);
        }

        try {
            $baileysUrl = config('simt.whatsapp.baileys_url');
            $baileysApiKey = config('simt.whatsapp.baileys_api_key');

            $phone = $validated['phone'];
            if (!str_starts_with($phone, '+')) {
                $phone = '+62' . ltrim($phone, '0');
            }
            $jid = preg_replace('/[^0-9]/', '', $phone) . '@s.whatsapp.net';

            $response = \Http::withHeaders([
                'Authorization' => "Bearer {$baileysApiKey}",
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post("{$baileysUrl}/sessions/{$sessionName}/messages", [
                'jid' => $jid,
                'type' => 'text',
                'content' => [
                    'text' => $validated['message'],
                ],
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pesan berhasil dikirim.',
                    'data' => $response->json(),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pesan: ' . $response->body(),
            ], 502);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pesan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function disconnect(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $sessionName = $request->input('session_name', 'simt_' . $tenantId);

        $config = WhatsappConfig::where('tenant_id', $tenantId)
            ->where('session_name', $sessionName)
            ->first();

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi WhatsApp tidak ditemukan.',
            ], 404);
        }

        try {
            $baileysUrl = config('simt.whatsapp.baileys_url');
            $baileysApiKey = config('simt.whatsapp.baileys_api_key');

            \Http::withHeaders([
                'Authorization' => "Bearer {$baileysApiKey}",
            ])->delete("{$baileysUrl}/sessions/{$sessionName}");

            $config->markDisconnected();

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp berhasil diputuskan.',
            ]);
        } catch (\Exception $e) {
            $config->markDisconnected();

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp diputuskan (lokal). Baileys service tidak tersedia.',
            ]);
        }
    }

    public function sendBulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipients' => 'required|array|min:1',
            'recipients.*.phone' => 'required|string',
            'message' => 'required|string|max:4096',
            'session_name' => 'nullable|string',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $sessionName = $validated['session_name'] ?? 'simt_' . $tenantId;

        $config = WhatsappConfig::where('tenant_id', $tenantId)
            ->where('session_name', $sessionName)
            ->first();

        if (!$config || !$config->is_connected) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp belum terhubung.',
            ], 422);
        }

        $sent = 0;
        $failed = 0;
        $errors = [];

        foreach ($validated['recipients'] as $recipient) {
            $sendRequest = new Request([
                'phone' => $recipient['phone'],
                'message' => $validated['message'],
                'session_name' => $sessionName,
            ]);

            $result = $this->send($sendRequest);
            $responseData = $result->getData(true);

            if ($responseData['success'] ?? false) {
                $sent++;
            } else {
                $failed++;
                $errors[] = "Gagal kirim ke {$recipient['phone']}: " . ($responseData['message'] ?? 'Unknown error');
            }

            usleep(500000);
        }

        return response()->json([
            'success' => true,
            'message' => "Pesan massal selesai. {$sent} berhasil, {$failed} gagal.",
            'data' => [
                'sent' => $sent,
                'failed' => $failed,
                'errors' => $errors,
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function index(Request $request): View
    {
        $query = Payment::with(['student.classroom']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->input('student_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('month')) {
            $query->where('month', $request->input('month'));
        }

        if ($request->filled('year')) {
            $query->where('year', $request->input('year'));
        }

        if ($request->filled('classroom_id')) {
            $studentIds = Student::where('classroom_id', $request->input('classroom_id'))->pluck('id');
            $query->whereIn('student_id', $studentIds);
        }

        $payments = $query->orderBy('due_date', 'asc')->orderBy('created_at', 'desc')->paginate(30)->withQueryString();

        $totalAmount = Payment::where('tenant_id', auth()->user()->tenant_id)->sum('amount');
        $totalPaid = Payment::where('tenant_id', auth()->user()->tenant_id)->where('status', 'LUNAS')->sum('amount');
        $totalUnpaid = Payment::where('tenant_id', auth()->user()->tenant_id)
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->sum('amount') - Payment::where('tenant_id', auth()->user()->tenant_id)
            ->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])
            ->sum('paid_amount');

        $students = Student::where('is_active', true)->orderBy('name')->get();

        return view('payments.index', compact('payments', 'totalAmount', 'totalPaid', 'totalUnpaid', 'students'));
    }

    public function create(): View
    {
        $students = Student::where('is_active', true)->orderBy('name')->get();

        return view('payments.create', compact('students'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'type' => 'required|in:SPP,DAFTAR_ULANG,SERAGAM,BUKU,KEGIATAN,LAIN_LAIN',
            'amount' => 'required|numeric|min:0',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2020|max:2099',
            'due_date' => 'nullable|date',
            'note' => 'nullable|string|max:255',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['status'] = 'BELUM_BAYAR';
        $validated['paid_amount'] = 0;

        if ($validated['type'] === 'SPP' && (!$validated['month'] || !$validated['year'])) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Bulan dan tahun wajib diisi untuk pembayaran SPP.');
        }

        $payment = Payment::create($validated);

        return redirect()->route('payments.show', $payment)
            ->with('success', 'Tagihan pembayaran berhasil dibuat.');
    }

    public function show(Payment $payment): View
    {
        $payment->load('student.classroom');

        return view('payments.show', compact('payment'));
    }

    public function edit(Payment $payment): View
    {
        $payment->load('student');
        $students = Student::where('is_active', true)->orderBy('name')->get();

        return view('payments.edit', compact('payment', 'students'));
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:BELUM_BAYAR,MENUNGGU,LUNAS,SEBAGIAN',
            'paid_amount' => 'sometimes|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'transaction_ref' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:255',
            'due_date' => 'nullable|date',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'LUNAS') {
            $validated['paid_amount'] = $payment->amount;
            $validated['paid_at'] = now();
        } elseif (isset($validated['paid_amount']) && $validated['paid_amount'] >= $payment->amount) {
            $validated['status'] = 'LUNAS';
            $validated['paid_at'] = now();
        } elseif (isset($validated['paid_amount']) && $validated['paid_amount'] > 0) {
            $validated['status'] = 'SEBAGIAN';
        }

        $payment->update($validated);

        return redirect()->route('payments.show', $payment)
            ->with('success', 'Data pembayaran berhasil diperbarui.');
    }

    public function generateSpp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2099',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $tenantId = auth()->user()->tenant_id;

        $students = Student::where('tenant_id', $tenantId)->where('is_active', true)->get();

        $created = 0;
        $skipped = 0;

        foreach ($students as $student) {
            $existing = Payment::where('tenant_id', $tenantId)
                ->where('student_id', $student->id)
                ->where('type', 'SPP')
                ->where('month', $validated['month'])
                ->where('year', $validated['year'])
                ->exists();

            if ($existing) {
                $skipped++;
                continue;
            }

            Payment::create([
                'tenant_id' => $tenantId,
                'student_id' => $student->id,
                'type' => 'SPP',
                'amount' => $validated['amount'],
                'month' => $validated['month'],
                'year' => $validated['year'],
                'status' => 'BELUM_BAYAR',
                'paid_amount' => 0,
                'due_date' => $validated['due_date'],
            ]);

            $created++;
        }

        return redirect()->route('payments.index', [
            'type' => 'SPP',
            'month' => $validated['month'],
            'year' => $validated['year'],
        ])->with('success', "SPP berhasil digenerate. {$created} tagihan baru, {$skipped} dilewati (sudah ada).");
    }

    public function paymentCallback(Request $request): JsonResponse
    {
        $gateway = config('simt.payment.gateway', 'midtrans');

        if ($gateway === 'midtrans') {
            return $this->handleMidtransCallback($request);
        }

        return $this->handleXenditCallback($request);
    }

    protected function handleMidtransCallback(Request $request): JsonResponse
    {
        $serverKey = config('simt.payment.midtrans.server_key');
        $hashed = hash('sha512', $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashed !== $request->signature_key) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $payment = Payment::where('id', $request->order_id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $transactionStatus = $request->transaction_status;
        $paymentType = $request->payment_type;

        if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
            $payment->update([
                'status' => 'LUNAS',
                'paid_amount' => $payment->amount,
                'paid_at' => now(),
                'payment_method' => 'midtrans_' . $paymentType,
                'transaction_ref' => $request->transaction_id,
            ]);
        } elseif ($transactionStatus === 'pending') {
            $payment->update([
                'status' => 'MENUNGGU',
                'payment_method' => 'midtrans_' . $paymentType,
                'transaction_ref' => $request->transaction_id,
            ]);
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $payment->update([
                'status' => 'BELUM_BAYAR',
            ]);
        }

        return response()->json(['message' => 'OK']);
    }

    protected function handleXenditCallback(Request $request): JsonResponse
    {
        $callbackToken = $request->header('x-callback-token');
        $expectedToken = config('simt.payment.xendit.callback_token');

        if ($callbackToken !== $expectedToken) {
            return response()->json(['message' => 'Invalid callback token'], 403);
        }

        $externalId = $request->external_id;
        $paymentId = str_replace('SPP-', '', $externalId);

        $payment = Payment::find($paymentId);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $status = $request->status;

        if ($status === 'PAID') {
            $payment->update([
                'status' => 'LUNAS',
                'paid_amount' => $payment->amount,
                'paid_at' => now(),
                'payment_method' => 'xendit_' . ($request->payment_method ?? 'unknown'),
                'transaction_ref' => $request->id,
            ]);
        } elseif ($status === 'EXPIRED') {
            $payment->update([
                'status' => 'BELUM_BAYAR',
            ]);
        }

        return response()->json(['message' => 'OK']);
    }

    public function printReceipt(Payment $payment)
    {
        $payment->load('student.classroom', 'tenant');

        $pdf = Pdf::loadView('payments.receipt-pdf', compact('payment'));
        $pdf->setPaper('a5', 'portrait');

        return $pdf->stream("kwitansi-{$payment->id}.pdf");
    }
}

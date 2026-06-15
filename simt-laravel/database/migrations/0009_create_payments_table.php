<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('student_id');
            $table->enum('type', [
                'SPP',
                'DAFTAR_ULANG',
                'SERAGAM',
                'BUKU',
                'KEGIATAN',
                'LAIN_LAIN',
            ]);
            $table->decimal('amount', 12, 2)->default(0);
            $table->unsignedTinyInteger('month')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->enum('status', ['BELUM_BAYAR', 'MENUNGGU', 'LUNAS', 'SEBAGIAN'])->default('BELUM_BAYAR');
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->string('transaction_ref', 100)->nullable();
            $table->string('note', 255)->nullable();
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

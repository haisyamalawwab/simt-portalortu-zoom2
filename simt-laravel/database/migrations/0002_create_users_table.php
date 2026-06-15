<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->string('email');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone', 20)->nullable();
            $table->enum('role', ['superadmin', 'admin', 'kepala_sekolah', 'wali_kelas', 'guru', 'tata_usaha', 'parent'])->default('guru');
            $table->string('avatar')->nullable();
            $table->string('nuptk', 20)->nullable()->comment('Nomor Unik Pendidik dan Tenaga Kependidikan');
            $table->string('nip', 20)->nullable()->comment('Nomor Induk Pegawai untuk DAPODIK integrasi');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->unique(['tenant_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('classroom_id')->nullable();
            $table->string('nis', 20);
            $table->string('nisn', 20)->nullable()->comment('Nomor Induk Siswa Nasional');
            $table->string('name');
            $table->enum('gender', ['L', 'P']);
            $table->string('birth_place', 100)->nullable();
            $table->date('birth_date')->nullable();
            $table->text('address')->nullable();
            $table->string('photo')->nullable();
            $table->string('father_name', 100)->nullable();
            $table->string('father_phone', 20)->nullable();
            $table->string('mother_name', 100)->nullable();
            $table->string('mother_phone', 20)->nullable();
            $table->string('guardian_name', 100)->nullable();
            $table->string('guardian_phone', 20)->nullable();
            $table->string('parent_email')->nullable();
            $table->string('nik', 20)->nullable()->comment('Nomor Induk Kependudukan');
            $table->enum('religion', ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU'])->default('ISLAM');
            $table->date('enrollment_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('classroom_id')->references('id')->on('classrooms')->nullOnDelete();
            $table->unique(['tenant_id', 'nis']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

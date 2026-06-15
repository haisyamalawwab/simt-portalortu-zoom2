<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->string('name', 50);
            $table->enum('level', ['7', '8', '9']);
            $table->unsignedInteger('capacity')->default(30);
            $table->unsignedBigInteger('wali_kelas_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('academic_year_id')->references('id')->on('academic_years')->cascadeOnDelete();
            $table->foreign('wali_kelas_id')->references('id')->on('users')->nullOnDelete();
            $table->unique(['tenant_id', 'academic_year_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};

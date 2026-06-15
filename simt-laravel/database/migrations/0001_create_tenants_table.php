<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 10)->unique();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('logo')->nullable();
            $table->string('npsn', 20)->nullable()->comment('Nomor Pokok Sekolah Nasional dari DAPODIK');
            $table->string('nism', 20)->nullable()->comment('Nomor Induk Sekolah Madrasah dari EMIS');
            $table->boolean('is_active')->default(true);
            $table->date('subscription_end')->nullable();
            $table->unsignedInteger('max_students')->default(500);
            $table->unsignedInteger('current_students')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};

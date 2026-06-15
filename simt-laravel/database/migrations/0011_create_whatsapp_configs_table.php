<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('session_name');
            $table->string('session_id')->nullable();
            $table->text('qr_code')->nullable();
            $table->boolean('is_connected')->default(false);
            $table->string('phone_number', 20)->nullable();
            $table->timestamp('last_connected_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->unique(['tenant_id', 'session_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_configs');
    }
};

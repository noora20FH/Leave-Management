<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel users (pastikan tabel users sudah ada sebelumnya)
            // onDelete('cascade') berarti jika user dihapus, data cutinya ikut terhapus
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason');
            $table->string('attachment')->nullable(); // Boleh kosong

            // Enum status dengan default 'pending'
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            // Kolom untuk alasan penolakan (hanya diisi jika rejected)
            $table->string('rejection_reason')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};

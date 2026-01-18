<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasFactory;

    // Konstanta untuk status agar konsisten dan menghindari typo
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    /**
     * Field yang diizinkan untuk diisi (Mass Assignment)
     */
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'reason',
        'attachment',
        'status',
        'rejection_reason'
    ];

    /**
     * Casting otomatis kolom tanggal menjadi objek Carbon (Date)
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    /**
     * Relasi ke User (Employee)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor: Menghitung durasi cuti dalam hari
     * Cara pakai: $leaveRequest->duration_days
     */
    public function getDurationDaysAttribute(): int
    {
        // diffInDays menghitung selisih, ditambah 1 agar tanggal mulai juga terhitung
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}

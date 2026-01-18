<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class LeaveService
{
    /**
     * Membuat Pengajuan Cuti Baru (Untuk Employee)
     */
/**
     * Membuat Pengajuan Cuti Baru (Untuk Employee)
     */
    public function createRequest(User $user, array $data): LeaveRequest
    {
        return DB::transaction(function () use ($user, $data) {
            // 1. Hitung Durasi Cuti yang diajukan
            $startDate = Carbon::parse($data['start_date']);
            $endDate = Carbon::parse($data['end_date']);
            $requestedDays = $startDate->diffInDays($endDate) + 1;

            // 2. Cek Kuota Tahunan (Maksimal 12 Hari)
            $usedQuota = $user->leaveRequests()
                ->where('status', LeaveRequest::STATUS_APPROVED)
                ->whereYear('start_date', now()->year)
                ->get()
                ->sum(function ($leave) {
                    return $leave->duration_days;
                });

            if (($usedQuota + $requestedDays) > 12) {
                throw new Exception("Sisa kuota cuti tidak mencukupi. Anda telah menggunakan {$usedQuota} hari dari 12 hari.");
            }

            // 3. Handle Upload Attachment (PERBAIKAN DI SINI)
            $attachmentPath = null;

            // Kita cukup cek apakah key 'attachment' ada di array $data
            // Karena sudah divalidasi sebagai 'file' di Request, isinya pasti objek UploadedFile
            if (isset($data['attachment'])) {
                $attachmentPath = $data['attachment']->store('attachments', 'public');
            }

            // 4. Simpan ke Database
            return LeaveRequest::create([
                'user_id'    => $user->id,
                'start_date' => $data['start_date'],
                'end_date'   => $data['end_date'],
                'reason'     => $data['reason'],
                'attachment_path' => $attachmentPath,
                'status'     => LeaveRequest::STATUS_PENDING,
            ]);
        });
    }

    /**
     * Memproses Persetujuan Cuti (Untuk Admin)
     */
    public function processApproval(int $id, string $status): LeaveRequest
    {
        // 1. Cari Data Cuti
        $leaveRequest = LeaveRequest::findOrFail($id);

        // 2. Validasi: Jangan ubah jika status sudah final (Approved/Rejected)
        // Opsional: tergantung aturan bisnis, tapi biasanya status final tidak bisa diubah lagi
        if ($leaveRequest->status !== LeaveRequest::STATUS_PENDING) {
            throw new Exception("Pengajuan ini sudah diproses sebelumnya.");
        }

        // 3. Update Status [cite: 17, 25]
        $leaveRequest->status = $status;

        // Jika ada logika tambahan saat diapprove (misal kirim email), tambahkan di sini.

        $leaveRequest->save();

        return $leaveRequest;
    }
}

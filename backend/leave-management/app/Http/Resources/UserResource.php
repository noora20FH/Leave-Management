<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'email'              => $this->email,
            'role'               => $this->role,
            'annual_leave_quota' => $this->annual_leave_quota,
            // Status tambahan untuk info jika user sudah aktivasi Google atau belum
            'invite_status'      => $this->google_id ? 'Active' : 'Pending Invite',
            'created_at'         => $this->created_at->format('d-m-Y'),
            // Penting: Sertakan deleted_at untuk logika tombol Hapus/Restore di frontend
            'deleted_at'         => $this->deleted_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'quota' => $this->annual_leave_quota,
            'status' => $this->google_id ? 'Active' : 'Pending Invite',
            'created_at' => $this->created_at->format('d-m-Y'),
        ];
    }
}

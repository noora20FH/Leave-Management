<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Hitung durasi on-the-fly untuk frontend
        $start = Carbon::parse($this->start_date);
        $end = Carbon::parse($this->end_date);
        $days = $start->diffInDays($end) + 1;

        return [
            'id' => $this->id,
            // Nesting UserResource agar data user yang tampil juga rapi
            'user' => new UserResource($this->whenLoaded('user')),
            'dates' => [
                'start' => $this->start_date, // Format Y-m-d bawaan database
                'end' => $this->end_date,
                'days_count' => (int) $days,
                'human_readable' => $start->format('d M Y') . ' - ' . $end->format('d M Y'),
            ],
            'reason' => $this->reason,
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            // Generate full URL untuk attachment
            'attachment_path' => $this->attachment ? Storage::url($this->attachment) : null,
            'created_at' => $this->created_at->diffForHumans(),
        ];
    }
}

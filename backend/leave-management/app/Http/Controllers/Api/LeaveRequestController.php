<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaveRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use App\Services\LeaveService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LeaveRequestController extends Controller
{
    protected $service;

    public function __construct(LeaveService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $query = LeaveRequest::with('user')->orderBy('created_at', 'desc');

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        return LeaveRequestResource::collection($query->get());
    }

    public function store(StoreLeaveRequest $request)
    {
        try {
            $leave = $this->service->createRequest($request->user(), $request->validated());
            return new LeaveRequestResource($leave);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        // 1. Validasi Admin
        if ($request->user()->role !== 'admin') abort(403);

        $request->validate(['status' => 'required|in:approved,rejected']);

        // 2. Cari Request Cuti
        $leaveRequest = LeaveRequest::with('user')->findOrFail($id);

        try {
            // 3. Logika Pengurangan Kuota (Dipindah ke sini)
            if ($request->status === 'approved') {
                // Cek apakah sudah diapprove sebelumnya agar tidak double deduct
                if ($leaveRequest->status === 'approved') {
                    return response()->json(['message' => 'Pengajuan ini sudah disetujui sebelumnya.'], 400);
                }

                $startDate = Carbon::parse($leaveRequest->start_date);
                $endDate = Carbon::parse($leaveRequest->end_date);

                // Hitung durasi hari (+1 karena inclusive)
                $daysTaken = $startDate->diffInDays($endDate) + 1;
                $user = $leaveRequest->user;

                // Cek Kuota
                if ($user->annual_leave_quota < $daysTaken) {
                    return response()->json(['message' => 'Sisa kuota cuti user tidak mencukupi.'], 400);
                }

                // Kurangi Kuota User
                $user->annual_leave_quota -= $daysTaken;
                $user->save();
            }

            // 4. Update Status (Bisa manual atau pakai service jika service hanya update status)
            // Jika logic di service hanya update status, kita bisa panggil service atau update langsung:
            $leaveRequest->status = $request->status;
            $leaveRequest->save();

            return new LeaveRequestResource($leaveRequest);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}

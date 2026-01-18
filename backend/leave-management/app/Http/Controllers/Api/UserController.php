<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Tampilkan profil user yang sedang login
     */
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    /**
     * [ADMIN] Tampilkan semua daftar karyawan
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $users = User::orderBy('name', 'asc')->get();
        return UserResource::collection($users);
    }

    /**
     * [ADMIN] Daftarkan karyawan baru (Invite Logic)
     */
    public function store(StoreUserRequest $request)
    {
        // 1. Data sudah tervalidasi otomatis oleh StoreUserRequest

        // 2. Buat User dengan status 'Pending Google Login'
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'annual_leave_quota' => $request->annual_leave_quota,
            // Kita beri password acak karena login utama via Google
            'password' => bcrypt(Str::random(16)),
            'google_id' => null, // Akan terisi otomatis saat user login pertama kali
        ]);

        return response()->json([
            'message' => 'Karyawan berhasil diundang. Instruksikan karyawan untuk login menggunakan email tersebut via Google.',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * [ADMIN] Hapus karyawan
     */
    public function destroy(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Data karyawan berhasil dihapus']);
    }
}

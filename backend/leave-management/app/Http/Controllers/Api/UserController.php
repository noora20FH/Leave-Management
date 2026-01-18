<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail; // Import Facade Mail
use App\Mail\EmployeeWelcomeMail;      // Import Mailable Class
use Illuminate\Support\Facades\Hash;

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

        // Gunakan withTrashed() agar user yang di-soft delete tetap muncul di daftar admin
        $users = User::withTrashed()->orderBy('name', 'asc')->get();
        return UserResource::collection($users);
    }

    /**
     * [ADMIN] Daftarkan karyawan baru & Kirim Email
     */
    public function store(StoreUserRequest $request)
    {
        // 1. Logika Password: Ambil nama depan email + '1234'
        // Contoh: noora20fairy@gmail.com -> noora20fairy
        $emailPrefix = explode('@', $request->email)[0];
        $plainPassword = $emailPrefix . '1234';

        // 2. Buat User di Database
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role ?? 'employee',
            'annual_leave_quota' => $request->annual_leave_quota ?? 12,
            // Simpan password yang sudah di-HASH
            'password' => Hash::make($plainPassword),
            'google_id' => null,
        ]);

        // 3. Kirim Email ke Karyawan (Gunakan Try-Catch agar tidak error jika mail server down)
        try {
            Mail::to($user->email)->send(new EmployeeWelcomeMail($user, $plainPassword));
            $mailStatus = 'Email kredensial berhasil dikirim.';
        } catch (\Exception $e) {
            // [DEBUGGING] Tampilkan error asli ke frontend agar kita tahu penyebabnya
            // Kembalikan error 500 agar masuk ke catch di frontend
            return response()->json([
                'message' => 'Gagal kirim email: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => $mailStatus,
            'data' => new UserResource($user),
            // Opsional: Tetap kembalikan password di response untuk debug/admin
            'debug_password' => $plainPassword
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

        // Ini sekarang akan melakukan Soft Delete secara otomatis
        $user->delete();

        return response()->json(['message' => 'Data karyawan berhasil dinonaktifkan']);
    }
    public function restore($id)
    {
        // Cari user termasuk yang sudah di-soft delete
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['message' => 'Akun karyawan berhasil diaktifkan kembali.']);
    }
}

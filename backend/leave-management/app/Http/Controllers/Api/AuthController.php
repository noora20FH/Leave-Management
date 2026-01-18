<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{


    /**
     * 1. LOGIN KONVENSIONAL (Email & Password)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek User & Password
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Kredensial yang diberikan salah.'
            ], 401);
        }

        // Hapus token lama (opsional, agar 1 device 1 token)
        $user->tokens()->delete();

        // Buat Token Baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     *LOGOUT
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * 2. OAUTH: Redirect ke Google
     */
    public function redirectToProvider()
    {
        // Redirect ke Google untuk OAuth
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * OAUTH: Callback dari Google
     */
    public function handleProviderCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            // 1. CARI USER: Hanya cari berdasarkan email
            $user = User::where('email', $socialUser->getEmail())->first();

            // 2. LOGIKA "DENY BY DEFAULT"
            if (!$user) {
                // Jika email tidak ditemukan di DB (belum diinput Admin)
                // Redirect ke login dengan pesan error
                return redirect("{$frontendUrl}/login?error=unauthorized_email");
            }

            // 3. SINKRONISASI: Jika user ada, tautkan google_id-nya
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $socialUser->getId(),
                ]);
            }

            // 4. Buat Token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect("{$frontendUrl}/auth/callback?token={$token}");
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/login?error=auth_failed");
        }
    }
}

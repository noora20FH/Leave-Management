<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller{

    /**
     * REGISTER MANUAL
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'employee', // Default role
            'annual_leave_quota' => 12
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }
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
            // Ambil user dari Google
            $socialUser = Socialite::driver('google')->stateless()->user();

            // Logic: Cari user berdasarkan email atau google_id
            $user = User::where('email', $socialUser->getEmail())
                        ->orWhere('google_id', $socialUser->getId())
                        ->first();

            // Jika user tidak ada, buat baru (Auto Register)
            if (!$user) {
                $user = User::create([
                    'name'              => $socialUser->getName(),
                    'email'             => $socialUser->getEmail(),
                    'google_id'         => $socialUser->getId(),
                    'role'              => 'employee',
                    'annual_leave_quota'=> 12,
                    'password'          => null, // Password null karena login via Google
                ]);
            } else {
                // Jika user ada tapi belum punya google_id, update datanya
                if (!$user->google_id) {
                    $user->update(['google_id' => $socialUser->getId()]);
                }
            }

            // Buat Token
            $token = $user->createToken('auth_token')->plainTextToken;

            // PENTING: Karena ini API dan Frontend terpisah (Next.js),
            // Kita tidak return JSON, tapi REDIRECT ke URL Frontend dengan membawa token.

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            return redirect("{$frontendUrl}/auth/callback?token={$token}");

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Authentication failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

}

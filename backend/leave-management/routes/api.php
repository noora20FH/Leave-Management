<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LeaveRequestController; // Pastikan Import Controller Cuti

/*
|--------------------------------------------------------------------------
| Public Routes (Tanpa Login)
|--------------------------------------------------------------------------
*/
// Manual Auth Routes
Route::post('/register', [AuthController::class, 'register']); // Opsional (sebaiknya dimatikan utk prod)
Route::post('/login', [AuthController::class, 'login']);

// OAuth Routes
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToProvider']);
Route::get('/auth/google/callback', [AuthController::class, 'handleProviderCallback']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Butuh Token Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // --- AUTH & PROFILE ---
    Route::post('/logout', [AuthController::class, 'logout']);

    // Get Current User (Digunakan oleh Frontend untuk cek role/kuota)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/me', [UserController::class, 'me']); // Alternatif endpoint profile

    // --- LEAVE MANAGEMENT (EMPLOYEE & ADMIN) ---
    // Semua user login bisa melihat history cuti mereka sendiri & mengajukan cuti
    Route::get('/leaves', [LeaveRequestController::class, 'index']);
    Route::post('/leaves', [LeaveRequestController::class, 'store']);

    // --- ADMIN ONLY ROUTES (Middleware Alias: is_admin) ---
    Route::middleware('is_admin')->group(function () {

        // 1. Manajemen User (Hanya Admin yang boleh invite/hapus)
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']); // Invite User
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        // 2. Approval Cuti (Hanya Admin yang boleh Approve/Reject)
        Route::patch('/leaves/{id}/status', [LeaveRequestController::class, 'updateStatus']);
    });

});

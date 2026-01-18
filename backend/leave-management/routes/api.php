<?php
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UserController;
// Manual Auth Routes
Route::post('/register', [AuthController::class, 'register']); // Opsional
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
    Route::post('/logout', [AuthController::class, 'logout']);

    // Test endpoint untuk cek user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Info Profil Pribadi (Bisa diakses Employee & Admin)
    Route::get('/user/me', [UserController::class, 'me']);

    // Manajemen User (Hanya Admin)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    
});

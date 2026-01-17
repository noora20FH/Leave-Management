<?php
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
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
});

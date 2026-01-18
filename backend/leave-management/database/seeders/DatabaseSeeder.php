<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
$myGoogleEmail = 'nooraaulia20h@gmail.com';

        $admin = User::firstOrCreate(
            ['email' => $myGoogleEmail],
            [
                'name' => 'Super Admin',
                'role' => 'admin',
                'annual_leave_quota' => 0, // Admin bebas kuota (opsional)
                'password' => Hash::make('password_rahasia'), // Fallback password
                'google_id' => null, // Nanti otomatis terisi saat login pertama
            ]
        );

        // 2. CONTOH EMPLOYEE (Untuk testing tampilan User biasa)
        // User ini belum bisa login Google kecuali Anda punya akun Google dengan email ini.
        // Tapi user ini akan muncul di list karyawan dashboard Admin.
        User::firstOrCreate(
            ['email' => 'karyawan_contoh@gmail.com'],
            [
                'name' => 'Budi Karyawan',
                'role' => 'employee',
                'annual_leave_quota' => 12,
                'password' => Hash::make('password'),
                'google_id' => null,
            ]
        );

        $this->command->info("Seeding selesai! Admin dibuat dengan email: $myGoogleEmail");
    }
}

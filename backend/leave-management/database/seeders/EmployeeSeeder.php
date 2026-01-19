<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID'); // Menggunakan bahasa Indonesia

        for ($i = 1; $i <= 20; $i++) {
            $name = $faker->name;
            // Membuat email unik berdasarkan nama
            $email = Str::lower(Str::slug($name)) . $faker->numberBetween(10, 99) . '@example.com';

            // Logika password sesuai sistem Anda: prefix email + 1234
            $emailPrefix = explode('@', $email)[0];
            $plainPassword = $emailPrefix . '1234';

            User::create([
                'name'               => $name,
                'email'              => $email,
                'password'           => Hash::make($plainPassword),
                'role'               => 'employee',
                'annual_leave_quota' => 12, // Standar kuota awal
                'google_id'          => null,
                'email_verified_at'  => now(),
            ]);
        }

        $this->command->info('Berhasil membuat 20 data karyawan dummy.');
    }
}

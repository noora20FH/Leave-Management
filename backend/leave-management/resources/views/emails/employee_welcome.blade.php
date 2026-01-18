<!DOCTYPE html>
<html>
<head>
    <title>Selamat Datang di Leave Management System</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Halo, {{ $user->name }}!</h2>

    <p>Admin telah mendaftarkan akun Anda di sistem <strong>Leave Management</strong>.</p>

    <p>Berikut adalah kredensial login Anda:</p>

    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; display: inline-block;">
        <p style="margin: 0;"><strong>Email:</strong> {{ $user->email }}</p>
        <p style="margin: 0;"><strong>Password:</strong> {{ $plainPassword }}</p>
    </div>

    <p>Anda dapat login menggunakan password di atas, atau menggunakan tombol <strong>Google Workspace</strong>.</p>

    <p>
        <a href="{{ config('app.frontend_url') }}/login"
           style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Login Sekarang
        </a>
    </p>

    <p>Terima kasih,<br>Tim HR</p>
</body>
</html>

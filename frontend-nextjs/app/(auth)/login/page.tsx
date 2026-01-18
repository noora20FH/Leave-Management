"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// 1. Kita pisahkan konten utama ke komponen sendiri agar bisa di-Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  // [LOGIC SINKRONISASI] Cek error dari Backend Redirect (Google)
  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam === "unauthorized_email") {
      setError("Akses Ditolak: Email Google Anda belum terdaftar di sistem. Silakan hubungi Admin/HRD.");
    } else if (errorParam === "auth_failed") {
      setError("Gagal melakukan otentikasi dengan Google.");
    }
  }, [searchParams]);

  // Handle Login Manual
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error lama

    try {
      const data = await authService.login(formData.email, formData.password);

      // Simpan Token
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect ke Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Email atau Password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-sm text-gray-500">
          Silakan login untuk melanjutkan
        </p>
      </div>

      {/* [PERBAIKAN TAMPILAN ERROR] */}
      {/* Menampilkan error baik dari Google Redirect MAUPUN Login Manual */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Form Login Manual */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <Button type="submit" isLoading={loading}>
          Masuk
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Atau login dengan
          </span>
        </div>
      </div>

      {/* Tombol OAuth Google */}
      <a href={authService.getGoogleAuthUrl()} className="block w-full">
        <Button type="button" variant="outline" className="w-full">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Google Workspace
        </Button>
      </a>
    </Card>
  );
}

// 2. Export Default dengan Suspense agar aman saat Build Production
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Suspense fallback={<div>Loading Login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';

// Komponen Content dipisah agar bisa dibungkus Suspense (Wajib di Next.js App Router saat pakai useSearchParams)
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // 1. Simpan Token dari URL
      localStorage.setItem('token', token);

      // 2. (Opsional) Fetch user data sesaat setelah dapat token agar localStorage lengkap
      // Disini kita langsung redirect saja agar cepat
      
      // 3. Redirect ke Dashboard
      router.push('/');
    } else {
      // Jika tidak ada token, kembalikan ke login
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Memproses login Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card>
        <Suspense fallback={<div>Loading...</div>}>
          <CallbackContent />
        </Suspense>
      </Card>
    </div>
  );
}
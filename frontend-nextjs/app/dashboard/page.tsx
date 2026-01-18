'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Pastikan path import ini sesuai dengan lokasi file api.ts Anda
// Jika api.ts ada di folder root 'lib', gunakan '@/lib/api'
import { apiRequest } from '@/lib/api'; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 1. Cek Token: Jika tidak ada, tendang ke login
    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Ambil Data User dari Backend
    const fetchUser = async () => {
      try {
        // Panggil endpoint /user yang sudah kita buat di Laravel
        const userData = await apiRequest('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userData);
      } catch (err) {
        console.error("Gagal ambil user:", err);
        // Jika token expired/invalid, logout manual
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-lg font-semibold text-blue-800">Selamat Datang, {user?.name}!</p>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Role: <span className="font-bold uppercase">{user?.role}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50 text-center">
              <h3 className="text-gray-500 text-sm uppercase font-bold">Sisa Kuota Cuti</h3>
              <p className="text-4xl font-bold text-gray-800 mt-2">{user?.annual_leave_quota}</p>
              <p className="text-sm text-gray-500">Hari</p>
            </div>
            
            {/* Tempatkan Tabel History Cuti Disini Nanti */}
            <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              Area History Cuti
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
// Import View Components
import AdminView from '@/components/dashboard/AdminView';
import EmployeeView from '@/components/dashboard/EmployeeView';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    // Ambil User Data
    apiRequest('/user', { headers: { Authorization: `Bearer ${token}` } })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-10 text-center">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Sederhana */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center mb-8">
        <div>
            <h1 className="text-xl font-bold text-blue-600">LeaveSystem</h1>
            <p className="text-xs text-gray-500">Welcome, {user.name} ({user.role})</p>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="text-red-500 text-sm font-medium hover:underline">Logout</button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        {/* Render View Berdasarkan Role */}
        {user.role === 'admin' ? (
            <AdminView />
        ) : (
            <EmployeeView user={user} />
        )}
      </main>
    </div>
  );
}
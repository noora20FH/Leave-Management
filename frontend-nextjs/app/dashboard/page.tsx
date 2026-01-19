'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
// Import View Components
import AdminView from '@/components/dashboard/AdminView';
import EmployeeView from '@/components/dashboard/EmployeeView';
import Navbar from '@/components/Navbar';

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

      <main className="max-w-6xl mx-auto px-6 pb-10">
        {/* Render View Berdasarkan Role */}
        <Navbar user={user} />
        {user.role === 'admin' ? (
          
            <AdminView />
        ) : (
            <EmployeeView user={user} />
        )}
      </main>
    </div>
  );
}
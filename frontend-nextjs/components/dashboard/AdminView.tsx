'use client';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export default function AdminView() {
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'approvals'>('approvals');
  
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', annual_leave_quota: 12 });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
        const [usersRes, leavesRes] = await Promise.all([
            apiRequest('/users', { headers: { Authorization: `Bearer ${token}` } }),
            apiRequest('/leaves', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        // Pastikan mengambil .data karena Laravel API Resource membungkusnya
        setUsers(usersRes.data || []); 
        setLeaves(leavesRes.data || []);
    } catch (err) {
        console.error("Gagal memuat data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- FUNGSI ACTION USER ---

const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        // Simpan response ke variabel
        const response = await apiRequest('/users', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(newUser)
        });
        
        // Tampilkan pesan ASLI dari Backend (UserController)
        // Pesan bisa jadi: "Email kredensial berhasil dikirim" 
        // ATAU "User dibuat, namun gagal mengirim email..."
        alert(response.message || 'Karyawan berhasil didaftarkan.');
        
        fetchData();
        setNewUser({ name: '', email: '', role: 'employee', annual_leave_quota: 12 });
    } catch (err: any) {
        alert(err.message);
    }
  };

  // Perbaikan Error: Fungsi handleDeleteUser dideklarasikan di sini
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan karyawan ini?')) return;
    
    const token = localStorage.getItem('token');
    try {
        await apiRequest(`/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Karyawan dinonaktifkan.');
        fetchData();
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleRestoreUser = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
        await apiRequest(`/users/${id}/restore`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Karyawan berhasil diaktifkan kembali.');
        fetchData();
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleApproval = async (id: number, status: string) => {
      const token = localStorage.getItem('token');
      try {
          await apiRequest(`/leaves/${id}/status`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status })
          });
          fetchData();
      } catch (err: any) {
          alert(err.message);
      }
  };

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button onClick={() => setActiveTab('approvals')} className={`pb-2 ${activeTab === 'approvals' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}>Approvals</button>
        <button onClick={() => setActiveTab('users')} className={`pb-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}>Manajemen Karyawan</button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded shadow h-fit">
                <h3 className="font-bold mb-4">Daftarkan Karyawan Baru</h3>
                <form onSubmit={handleCreateUser} className="space-y-3">
                    <input type="text" placeholder="Nama Lengkap" className="w-full border p-2 rounded" required onChange={e => setNewUser({...newUser, name: e.target.value})} value={newUser.name} />
                    <input type="email" placeholder="Email Google" className="w-full border p-2 rounded" required onChange={e => setNewUser({...newUser, email: e.target.value})} value={newUser.email} />
                    <input type="number" placeholder="Kuota Cuti" className="w-full border p-2 rounded" value={newUser.annual_leave_quota} onChange={e => setNewUser({...newUser, annual_leave_quota: parseInt(e.target.value)})} />
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan & Invite</button>
                </form>
            </div>

            <div className="md:col-span-2 bg-white rounded shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Karyawan</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Kuota</th>
                            <th className="p-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Filter hanya Employee dan urutkan */}
                        {users?.filter((u: any) => u.role === 'employee').map((u: any) => (
                            <tr key={u.id} className={`border-b ${u.deleted_at ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                                <td className="p-3">
                                    <div className="font-medium text-gray-700">{u.name}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="p-3">
                                    {u.deleted_at ? 
                                        <span className="text-red-500 text-xs font-bold uppercase italic">Nonaktif</span> : 
                                        <span className="text-green-600 text-xs font-bold uppercase">Aktif</span>
                                    }
                                </td>
                                <td className="p-3">{u.annual_leave_quota} Hari</td>
                                <td className="p-3 text-center">
                                    {u.deleted_at ? (
                                        <button onClick={() => handleRestoreUser(u.id)} className="text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1 rounded bg-blue-50 border border-blue-200">
                                            Restore
                                        </button>
                                    ) : (
                                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1 rounded bg-red-50 border border-red-200">
                                            Hapus
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
<div className="bg-white rounded shadow overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3">Karyawan</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Alasan</th>
                        <th className="p-3">Lampiran</th> {/* 1. Tambah Header Kolom */}
                        <th className="p-3">Status</th>
                        <th className="p-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves?.map((l: any) => (
                        <tr key={l.id} className="border-b">
                            <td className="p-3 font-medium">{l.user?.name}</td>
                            <td className="p-3">{l.dates?.human_readable}</td>
                            <td className="p-3">{l.reason}</td>
                            
                            {/* 2. Tambah Logika Tampilan Lampiran */}
                            <td className="p-3">
                                {l.attachment_path ? (
                                    <a 
                                        // href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${l.attachment_path}`} 
                                        href={`http://localhost:8000${l.attachment_path}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-bold flex items-center gap-1"
                                    >
                                        📄 Lihat File
                                    </a>
                                ) : (
                                    <span className="text-gray-400 text-xs italic">- Tidak ada -</span>
                                )}
                            </td>

                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs status-${l.status}`}>
                                    {l.status}
                                </span>
                            </td>
                            <td className="p-3">
                                {l.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApproval(l.id, 'approved')} className="text-green-600 font-bold mr-3 text-xs border border-green-200 bg-green-50 px-2 py-1 rounded">Approve</button>
                                        <button onClick={() => handleApproval(l.id, 'rejected')} className="text-red-600 font-bold text-xs border border-red-200 bg-red-50 px-2 py-1 rounded">Reject</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
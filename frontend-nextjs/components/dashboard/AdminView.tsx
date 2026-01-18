'use client';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export default function AdminView() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState<'users' | 'approvals'>('approvals');
  
  // State Form Invite User
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', annual_leave_quota: 12 });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const [usersRes, leavesRes] = await Promise.all([
        apiRequest('/users', { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest('/leaves', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setUsers(usersRes);
    setLeaves(leavesRes.data); // Sesuaikan jika response dibungkus 'data'
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        await apiRequest('/users', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(newUser)
        });
        alert('Karyawan berhasil didaftarkan. Mereka sekarang bisa login via Google.');
        fetchData();
        setNewUser({ name: '', email: '', role: 'employee', annual_leave_quota: 12 }); // Reset form
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleApproval = async (id: number, status: string) => {
      const token = localStorage.getItem('token');
      await apiRequest(`/leaves/${id}/status`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status })
      });
      fetchData();
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button onClick={() => setActiveTab('approvals')} className={`pb-2 ${activeTab === 'approvals' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}>Approvals</button>
        <button onClick={() => setActiveTab('users')} className={`pb-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}>Manajemen Karyawan</button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Register */}
            <div className="md:col-span-1 bg-white p-6 rounded shadow h-fit">
                <h3 className="font-bold mb-4">Daftarkan Karyawan Baru</h3>
                <form onSubmit={handleCreateUser} className="space-y-3">
                    <input type="text" placeholder="Nama Lengkap" className="w-full border p-2 rounded" required onChange={e => setNewUser({...newUser, name: e.target.value})} value={newUser.name} />
                    <input type="email" placeholder="Email Google" className="w-full border p-2 rounded" required onChange={e => setNewUser({...newUser, email: e.target.value})} value={newUser.email} />
                    <select className="w-full border p-2 rounded" onChange={e => setNewUser({...newUser, role: e.target.value})} value={newUser.role}>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input type="number" placeholder="Kuota Cuti" className="w-full border p-2 rounded" value={newUser.annual_leave_quota} onChange={e => setNewUser({...newUser, annual_leave_quota: parseInt(e.target.value)})} />
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan & Invite</button>
                </form>
            </div>

            {/* List User */}
            <div className="md:col-span-2 bg-white rounded shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100"><tr><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Kuota</th></tr></thead>
                    <tbody>
                        {users.map((u: any) => (
                            <tr key={u.id} className="border-b">
                                <td className="p-3">{u.name}</td>
                                <td className="p-3">{u.email}</td>
                                <td className="p-3 uppercase text-xs font-bold">{u.role}</td>
                                <td className="p-3">{u.annual_leave_quota}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        // Tab Approvals
        <div className="bg-white rounded shadow overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-100"><tr><th className="p-3">Karyawan</th><th className="p-3">Tanggal</th><th className="p-3">Alasan</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr></thead>
                <tbody>
                    {leaves.map((l: any) => (
                        <tr key={l.id} className="border-b">
                            <td className="p-3 font-medium">{l.user.name}</td>
                            <td className="p-3">{l.dates.human_readable}</td>
                            <td className="p-3">{l.reason}</td>
                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${l.status}`}>{l.status}</span></td>
                            <td className="p-3">
                                {l.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApproval(l.id, 'approved')} className="text-green-600 font-bold mr-3">Approve</button>
                                        <button onClick={() => handleApproval(l.id, 'rejected')} className="text-red-600 font-bold">Reject</button>
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
'use client';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button'; // Pastikan path benar

export default function EmployeeView({ user }: { user: any }) {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({ start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    const token = localStorage.getItem('token');
    const res = await apiRequest('/leaves', { headers: { Authorization: `Bearer ${token}` } });
    setLeaves(res.data);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Gunakan FormData untuk upload file (opsional di MVP ini, tapi disiapkan)
    // Untuk JSON biasa:
    try {
        await apiRequest('/leaves', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        alert('Cuti berhasil diajukan!');
        fetchLeaves(); // Refresh tabel
    } catch (err: any) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Info */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
           <h3 className="text-gray-500 text-sm uppercase font-bold">Sisa Kuota Cuti</h3>
           <p className="text-4xl font-bold text-gray-800 mt-2">{user.annual_leave_quota} Hari</p>
        </div>

        {/* Form Pengajuan */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Ajukan Cuti Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="border p-2 rounded" required onChange={e => setFormData({...formData, start_date: e.target.value})} />
                    <input type="date" className="border p-2 rounded" required onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
                <textarea className="border p-2 rounded w-full" placeholder="Alasan Cuti" required onChange={e => setFormData({...formData, reason: e.target.value})} />
                <Button isLoading={loading}>Kirim Pengajuan</Button>
            </form>
        </div>
      </div>

      {/* Tabel History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-bold">Riwayat Pengajuan</div>
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Alasan</th>
                    <th className="p-3">Status</th>
                </tr>
            </thead>
            <tbody>
                {leaves.map((l: any) => (
                    <tr key={l.id} className="border-b">
                        <td className="p-3">{l.dates.human_readable}</td>
                        <td className="p-3">{l.reason}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${l.status === 'approved' ? 'bg-green-100 text-green-800' : l.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {l.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
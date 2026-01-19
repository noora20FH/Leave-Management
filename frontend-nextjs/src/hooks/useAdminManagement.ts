import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export const useAdminManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'approvals'>('approvals');
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [currentPageLeaves, setCurrentPageLeaves] = useState(1);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', annual_leave_quota: 12 });
  const [searchTerm, setSearchTerm] = useState('');
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [usersRes, leavesRes] = await Promise.all([
        apiRequest('/users', { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest('/leaves', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data || []);
      setLeaves(leavesRes.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await apiRequest('/users', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      alert(response.message || 'Berhasil!');
      fetchData();
      setNewUser({ name: '', email: '', role: 'employee', annual_leave_quota: 12 });
    } catch (err: any) { alert(err.message); }
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
    } catch (err: any) { alert(err.message); }
  };


  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan karyawan ini?')) return;
    const token = localStorage.getItem('token');
    try {
        await apiRequest(`/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        alert('Karyawan dinonaktifkan.');
        fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleRestoreUser = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
        await apiRequest(`/users/${id}/restore`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        alert('Karyawan berhasil diaktifkan kembali.');
        fetchData();
    } catch (err: any) { alert(err.message); }
  };

  // PASTIKAN SEMUA DIKEMBALIKAN DI SINI
  return {
    users, 
    leaves, 
    activeTab, 
    setActiveTab, 
    newUser, 
    setNewUser,
    currentPageUsers, 
    setCurrentPageUsers, 
    currentPageLeaves, 
    setCurrentPageLeaves,
    handleCreateUser, 
    handleApproval, 
    handleDeleteUser,  
    handleRestoreUser,  
    fetchData,
    searchTerm,      
    setSearchTerm,
  };
};
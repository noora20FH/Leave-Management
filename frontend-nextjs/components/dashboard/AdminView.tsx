"use client";
import { useAdminManagement } from "@/src/hooks/useAdminManagement";

export default function AdminView() {
  const {
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
    handleDeleteUser,    // Pastikan ini sudah ada di return useAdminManagement.ts
    handleRestoreUser,   // Pastikan ini sudah ada di return useAdminManagement.ts
    searchTerm,
    setSearchTerm,
  } = useAdminManagement();

  const itemsPerPage = 10;

  // --- LOGIKA FILTER & PAGINASI KARYAWAN ---
  const filteredEmployees = users?.filter((u: any) => {
    const isEmployee = u.role === "employee";
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return isEmployee && matchesSearch;
  }) || [];

  const totalPagesUsers = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentUsers = filteredEmployees.slice(
    (currentPageUsers - 1) * itemsPerPage,
    currentPageUsers * itemsPerPage
  );

  // --- LOGIKA PAGINASI APPROVALS (SOLUSI ERROR currentLeaves) ---
  const totalPagesLeaves = Math.ceil(leaves.length / itemsPerPage);
  const currentLeaves = leaves.slice(
    (currentPageLeaves - 1) * itemsPerPage,
    currentPageLeaves * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900">
      {/* Tab Navigation */}
      <div className="flex space-x-8 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`pb-4 text-sm font-bold transition-all ${
            activeTab === "approvals"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          PENDING APPROVALS ({leaves.filter((l: any) => l.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-sm font-bold transition-all ${
            activeTab === "users"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          MANAJEMEN KARYAWAN
        </button>
      </div>

      {activeTab === "users" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
              Daftarkan Karyawan
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  value={newUser.name}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Google</label>
                <input
                  type="email"
                  className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  value={newUser.email}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kuota Cuti Tahunan</label>
                <input
                  type="number"
                  className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                  value={newUser.annual_leave_quota}
                  onChange={(e) => setNewUser({ ...newUser, annual_leave_quota: parseInt(e.target.value) })}
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm mt-2">
                Simpan & Kirim Email
              </button>
            </form>
          </div>

          {/* User List & Search Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-sm">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Cari nama atau email karyawan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPageUsers(1);
                }}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest">Karyawan</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest">Status</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest">Kuota</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentUsers.map((u: any) => (
                    <tr key={u.id} className={`transition-colors ${u.deleted_at ? "bg-slate-50/50" : "hover:bg-slate-50/30"}`}>
                      <td className="p-4">
                        <div className={`font-bold ${u.deleted_at ? "text-slate-400" : "text-slate-700"}`}>{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                      </td>
                      <td className="p-4">
                        {u.deleted_at ? (
                          <span className="text-[10px] font-black px-2 py-1 rounded bg-rose-50 text-rose-500 uppercase italic">Nonaktif</span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-50 text-emerald-600 uppercase">Aktif</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-600">{u.annual_leave_quota} Hari</td>
                      <td className="p-4 text-center">
                        {u.deleted_at ? (
                          <button onClick={() => handleRestoreUser(u.id)} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            Restore
                          </button>
                        ) : (
                          <button onClick={() => handleDeleteUser(u.id)} className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 transition-all">
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPagesUsers > 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400">Hal {currentPageUsers} dari {totalPagesUsers}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPageUsers((p) => Math.max(1, p - 1))} className="px-3 py-1 text-[10px] font-bold bg-white border rounded hover:bg-slate-50" disabled={currentPageUsers === 1}>Prev</button>
                    <button onClick={() => setCurrentPageUsers((p) => Math.min(totalPagesUsers, p + 1))} className="px-3 py-1 text-[10px] font-bold bg-white border rounded hover:bg-slate-50" disabled={currentPageUsers === totalPagesUsers}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Tab Approvals - SEKARANG MENGGUNAKAN currentLeaves */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold text-slate-600 uppercase text-[10px]">Karyawan</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-[10px]">Tanggal</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-[10px]">Alasan</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-[10px]">Lampiran</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-[10px]">Status</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentLeaves.length > 0 ? (
                currentLeaves.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{l.user?.name}</td>
                    <td className="p-4 text-slate-500 font-medium">{l.dates?.human_readable}</td>
                    <td className="p-4 text-slate-600 text-xs italic">"{l.reason}"</td>
                    <td className="p-4">
                      {l.attachment_path ? (
                        <a href={`http://localhost:8000${l.attachment_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-1 rounded flex items-center gap-1 w-fit">📄 FILE</a>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                        l.status === "approved" ? "bg-emerald-100 text-emerald-700" : 
                        l.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}>{l.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      {l.status === "pending" && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleApproval(l.id, "approved")} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Approve</button>
                          <button onClick={() => handleApproval(l.id, "rejected")} className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 italic">Tidak ada pengajuan cuti.</td></tr>
              )}
            </tbody>
          </table>
          {totalPagesLeaves > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-400 italic">Hal {currentPageLeaves} dari {totalPagesLeaves}</span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPageLeaves((p) => Math.max(1, p - 1))} className="px-4 py-1.5 text-[10px] font-bold bg-white border rounded shadow-sm disabled:opacity-50" disabled={currentPageLeaves === 1}>Sebelumnya</button>
                <button onClick={() => setCurrentPageLeaves((p) => Math.min(totalPagesLeaves, p + 1))} className="px-4 py-1.5 text-[10px] font-bold bg-white border rounded shadow-sm disabled:opacity-50" disabled={currentPageLeaves === totalPagesLeaves}>Berikutnya</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
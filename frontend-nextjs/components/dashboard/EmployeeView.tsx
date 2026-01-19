"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function EmployeeView({ user }: { user: any }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State Navigasi Tab
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  // State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<{
    start_date: string;
    end_date: string;
    reason: string;
    attachment: File | null;
  }>({
    start_date: "",
    end_date: "",
    reason: "",
    attachment: null,
  });

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await apiRequest("/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data || []);
    } catch (e) {
      console.error("Gagal mengambil data cuti");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Logika Paginasi
  const totalPages = Math.ceil(leaves.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const payload = new FormData();
    payload.append("start_date", formData.start_date);
    payload.append("end_date", formData.end_date);
    payload.append("reason", formData.reason);
    if (formData.attachment) payload.append("attachment", formData.attachment);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${baseUrl}/leaves`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: payload,
      });

      if (!response.ok) throw new Error("Gagal mengajukan cuti");

      alert("Cuti berhasil diajukan!");
      setFormData({ start_date: "", end_date: "", reason: "", attachment: null });
      const fileInput = document.getElementById("file_input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      fetchLeaves();
      setActiveTab('history'); // Pindah ke tab riwayat otomatis setelah berhasil
      setCurrentPage(1);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Maksimal 2MB!");
      e.target.value = "";
      return;
    }
    setFormData({ ...formData, attachment: file });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900">
      
      {/* Tab Navigation */}
      <div className="flex space-x-8 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('submit')} 
          className={`pb-4 text-sm font-bold transition-all ${activeTab === 'submit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          FORM PENGAJUAN
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-4 text-sm font-bold transition-all ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          RIWAYAT CUTI ({leaves.length})
        </button>
      </div>

      {activeTab === 'submit' ? (
        /* Tab 1: Pengajuan (Grid Card & Form Bersebelahan) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Card Sisa Kuota */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold">Sisa Kuota Cuti</h3>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-7xl font-black text-blue-600">{user.annual_leave_quota}</span>
              <span className="text-2xl font-bold text-slate-300">Hari</span>
            </div>
            <p className="mt-6 text-sm text-slate-500 leading-relaxed italic">
              "Gunakan jatah cuti Anda untuk menjaga keseimbangan kesehatan mental dan produktivitas kerja."
            </p>
          </div>

          {/* Form Pengajuan */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Buat Pengajuan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mulai</label>
                  <input type="date" className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selesai</label>
                  <input type="date" className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alasan</label>
                <textarea className="w-full border-slate-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Contoh: Keperluan keluarga / Sakit" rows={2} required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attachment (Opsional)</label>
                <input id="file_input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-dashed border-slate-200 p-1.5 rounded-xl" onChange={handleFileChange} />
              </div>

              <Button isLoading={loading} className="w-full py-3.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
                Kirim Pengajuan
              </Button>
            </form>
          </div>
        </div>
      ) : (
        /* Tab 2: Riwayat (Tabel Full Width) */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest">Periode</th>
                  <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest">Alasan</th>
                  <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest text-center">Berkas</th> 
                  <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentLeaves.length > 0 ? (
                  currentLeaves.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-700 font-bold">{l.dates?.human_readable}</td>
                      <td className="p-4 text-slate-500 italic text-xs">"{l.reason}"</td>
                      <td className="p-4 text-center">
                        {l.attachment_path ? (
                          <a href={`http://localhost:8000${l.attachment_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-black hover:underline text-[10px] bg-blue-50 px-2 py-1 rounded">📄 FILE</a>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            l.status === "approved" ? "bg-emerald-100 text-emerald-700" : 
                            l.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Belum ada data riwayat.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] text-slate-400 font-bold italic">Menampilkan halaman {currentPage} dari {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-[10px] font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-all">Sebelumnya</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 text-[10px] font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-all">Berikutnya</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function EmployeeView({ user }: { user: any }) {
  const [leaves, setLeaves] = useState([]);
  // 1. Update State untuk menampung file (attachment)
  const [formData, setFormData] = useState<{
    start_date: string;
    end_date: string;
    reason: string;
    attachment: File | null; // Tambahan tipe data file
  }>({
    start_date: "",
    end_date: "",
    reason: "",
    attachment: null,
  });

  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");
    // Tambahkan error handling sederhana
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const payload = new FormData();
    payload.append("start_date", formData.start_date);
    payload.append("end_date", formData.end_date);
    payload.append("reason", formData.reason);

    if (formData.attachment) {
      payload.append("attachment", formData.attachment);
    }

    try {
      // PERUBAHAN DI SINI:
      // Gunakan fetch biasa, bukan apiRequest, agar header tidak otomatis di-set ke JSON
      // Pastikan URL API sesuai dengan environment Anda (misal: localhost:8000/api)
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      const response = await fetch(`${baseUrl}/leaves`, {
        method: "POST",
        headers: {
          // Kita HANYA mengirim token.
          // JANGAN kirim 'Content-Type'. Browser akan otomatis set ke 'multipart/form-data'
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika validasi Laravel gagal (misal: file terlalu besar), error akan muncul di sini
        throw new Error(data.message || "Gagal mengajukan cuti");
      }

      alert("Cuti berhasil diajukan!");
      setFormData({
        start_date: "",
        end_date: "",
        reason: "",
        attachment: null,
      });

      // Reset input file visual
      const fileInput = document.getElementById(
        "file_input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchLeaves();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan saat upload.");
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      // Validasi Ukuran: 2MB = 2 * 1024 * 1024 bytes
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");

        // Reset input file agar user harus pilih ulang
        e.target.value = "";
        setFormData({ ...formData, attachment: null });
        return;
      }

      // Validasi Tipe File (Double check selain accept attribute)
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Format file tidak didukung. Gunakan PDF, JPG, atau PNG.");
        e.target.value = "";
        setFormData({ ...formData, attachment: null });
        return;
      }

      // Jika lolos validasi, simpan ke state
      setFormData({ ...formData, attachment: file });
    }
  };

  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Info */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm uppercase font-bold">
            Sisa Kuota Cuti
          </h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">
            {user.annual_leave_quota} Hari
          </p>
        </div>

        {/* Form Pengajuan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">Ajukan Cuti Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Mulai
                </label>
                <input
                  type="date"
                  className="border p-2 rounded w-full"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Selesai
                </label>
                <input
                  type="date"
                  className="border p-2 rounded w-full"
                  required
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <textarea
              className="border p-2 rounded w-full"
              placeholder="Alasan Cuti"
              rows={3}
              required
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />

            {/* 3. Input File Attachment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Bukti Pendukung (Opsional)
              </label>
              <input
                id="file_input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={handleFileChange} // Gunakan handler baru ini
              />
              <p className="text-xs text-gray-400">
                Format: PDF, JPG, PNG (Max 2MB)
              </p>
            </div>

            <Button isLoading={loading} className="w-full">
              Kirim Pengajuan
            </Button>
          </form>
        </div>
      </div>

      {/* Tabel History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-bold">
          Riwayat Pengajuan
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Alasan</th>
              <th className="p-3">Lampiran</th> {/* Kolom Baru */}
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l: any) => (
              <tr key={l.id} className="border-b">
                <td className="p-3">{l.dates?.human_readable}</td>
                <td className="p-3">{l.reason}</td>
                <td className="p-3">
                  {/* Menampilkan link download jika attachment ada */}
                  {l.attachment_path ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${l.attachment_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                    >
                      📄 Lihat File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      l.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : l.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
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

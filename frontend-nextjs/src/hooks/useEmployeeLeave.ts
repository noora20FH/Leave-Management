import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

export const useEmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ start_date: "", end_date: "", reason: "", attachment: null as File | null });

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await apiRequest("/leaves", { headers: { Authorization: `Bearer ${token}` } });
      setLeaves(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchLeaves(); }, []);

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
      if (!response.ok) throw new Error("Gagal");
      alert("Cuti berhasil!");
      setFormData({ start_date: "", end_date: "", reason: "", attachment: null });
      fetchLeaves();
      setActiveTab('history');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return { leaves, loading, activeTab, setActiveTab, currentPage, setCurrentPage, formData, setFormData, handleSubmit };
};
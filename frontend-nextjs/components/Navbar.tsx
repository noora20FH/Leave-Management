"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = () => {
    if (!confirm("Keluar dari sistem?")) return;
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    // Wrapper luar: Full Width (w-full)
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/90">
      
      {/* Wrapper Dalam: Segaris dengan konten (max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Sisi Kiri: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black italic">L</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight italic">
              Leave<span className="text-blue-600">System</span>
            </span>
          </div>

          {/* Sisi Kanan: User & Action */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">{user?.name}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                    {user?.role === 'admin' ? '🛡️ Admin Panel' : '👤 Employee'}
                </p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
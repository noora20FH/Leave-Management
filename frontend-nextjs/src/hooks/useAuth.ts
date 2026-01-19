import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCallback = () => {
    useEffect(() => {
      const token = searchParams.get("token");
      if (token) {
        localStorage.setItem("token", token);
        router.push("/dashboard");
      } else {
        router.push("/login?error=auth_failed");
      }
    }, [searchParams, router]);
  };

  const logout = async (apiRequest: any) => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    const token = localStorage.getItem("token");
    try {
      await apiRequest("/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return { handleCallback, logout };
};
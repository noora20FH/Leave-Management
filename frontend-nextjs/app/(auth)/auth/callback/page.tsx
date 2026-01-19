"use client";
import { useAuth } from "@/src/hooks/useAuth";

export default function AuthCallbackPage() {
  const { handleCallback } = useAuth();
  handleCallback();
  return <div className="p-10 text-center">Memproses autentikasi...</div>;
}
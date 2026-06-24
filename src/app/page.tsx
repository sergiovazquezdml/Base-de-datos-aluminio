"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <div className="sidebar-logo-mark mx-auto mb-4" style={{ width: 48, height: 48, fontSize: '1.4rem' }}>IL</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando plataforma...</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth, useRole } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n-context";
import { LogOut, ChevronRight, Menu, Bell } from "lucide-react";



// ─── Nav section config ───────────────────────────────────────────────────────
interface NavItem {
  labelKey: string;
  href: string;
  iconSrc: string;
  roles?: string[];
}

const navSections = [
  {
    labelKey: "nav_principal",
    items: [
      { labelKey: "nav_dashboard",  href: "/dashboard",    iconSrc: "/assets/icon-extrusion.png" },
      { labelKey: "nav_plantas",    href: "/plantas",      iconSrc: "/assets/icon-contaminated.png" },
      { labelKey: "nav_prensas",    href: "/prensas",      iconSrc: "/assets/icon-bearings.png" },
    ] as NavItem[],
  },
  {
    labelKey: "nav_administracion",
    items: [
      { labelKey: "nav_usuarios",   href: "/usuarios",    iconSrc: "/assets/icon-eco.png",      roles: ["direccion"] },
      { labelKey: "nav_catalogos",  href: "/catalogos",   iconSrc: "/assets/icon-chemical.png", roles: ["direccion"] },
    ] as NavItem[],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const role = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <img
          src="/assets/RGB_simbolo_interlub.png"
          alt="Interlub"
          style={{ width: 48, height: 48, objectFit: "contain", animation: "pulse-red 1.5s infinite" }}
        />
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    direccion:   "Dirección",
    coordinador: "Coordinador",
    consultor:   "Consultor de Campo",
  };

  return (
    <div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0 }}>
            <img
              src="/assets/RGB_simbolo_interlub.png"
              alt="Interlub"
              style={{ width: 34, height: 34, objectFit: "contain" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <img
              src="/assets/RGB_interlub+descriptivo_mono_blanco.png"
              alt="Interlub"
              style={{ height: 14, width: "auto", objectFit: "contain", opacity: 0.9 }}
            />
            <p style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              Plataforma Extrusión
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(role ?? "")
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.labelKey} className="mb-2">
                <p className="sidebar-section-label">{t(section.labelKey as Parameters<typeof t>[0])}</p>
                {visibleItems.map((item, itemIdx) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sidebar-dot" style={{ animationDelay: `${itemIdx * 0.15}s` }} />
                      {t(item.labelKey as Parameters<typeof t>[0])}
                      {isActive && <ChevronRight size={12} style={{ marginLeft: "auto" }} />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "10px",
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {/* Avatar with Interlub accent */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--interlub-red), #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 800, color: "white", flexShrink: 0,
              boxShadow: "0 0 10px rgba(204,0,0,0.3)",
            }}>
              {user.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                {user.nombre}
              </p>
              <p style={{ fontSize: "0.67rem", color: "var(--text-muted)", margin: 0 }}>{roleLabel[user.rol]}</p>
            </div>
            <button
              onClick={logout}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", borderRadius: "6px", transition: "all 0.15s", display: "flex" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", padding: "4px" }}
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb with brand icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
              <img
                src="/assets/RGB_simbolo_interlub.png"
                alt=""
                style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.5 }}
              />
              <ChevronRight size={12} color="var(--text-muted)" />
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {t((navSections.flatMap(s => s.items).find(i => pathname.startsWith(i.href))?.labelKey || "nav_dashboard") as Parameters<typeof t>[0])}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
                padding: "0.3rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {language === "es" ? "ES ➔ EN" : "EN ➔ ES"}
            </button>
            {/* Notifications */}
            <button style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
              padding: "0.3rem 0.5rem", cursor: "pointer", color: "var(--text-secondary)",
              display: "flex", alignItems: "center", position: "relative",
            }}>
              <Bell size={16} />
              <span style={{
                position: "absolute", top: "-3px", right: "-3px", width: "10px", height: "10px",
                background: "var(--interlub-red)", borderRadius: "50%", border: "2px solid var(--bg-secondary)"
              }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { OEMS } from "@/lib/data";
import { statusColors, statusLabels, formatPercent } from "@/lib/utils";
import { Wrench, ChevronRight } from "lucide-react";

export default function PrensasPage() {
  const { prensas, plantas, empresas, isLoading } = useStore();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <p>Cargando prensas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Prensas de Extrusión</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {prensas.length} prensa{prensas.length !== 1 ? "s" : ""} registrada{prensas.length !== 1 ? "s" : ""} en la cartera
          </p>
        </div>
      </div>
      <div className="interlub-card" style={{ overflow: "hidden" }}>
        {prensas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <Wrench size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "0.875rem" }}>No se encontraron prensas registradas</p>
          </div>
        ) : (
          <table className="interlub-table">
            <thead>
              <tr>
                <th>Prensa</th>
                <th className="hide-on-tablet">OEM</th>
                <th className="hide-on-laptop">Capacidad</th>
                <th className="hide-on-laptop">Planta</th>
                <th className="hide-on-laptop-large">OEE</th>
                <th className="hide-on-desktop-small">Completitud</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prensas.map((pr, i) => {
                const planta = plantas.find(p => p.id === pr.plantaId);
                const empresa = empresas.find(e => e.id === planta?.empresaId);
                const oem = OEMS.find(o => o.id === pr.oemId);
                const fillClass = pr.pctCompletitud >= 80 ? "green" : pr.pctCompletitud >= 40 ? "amber" : "red";
                return (
                  <tr key={pr.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 30, height: 30, borderRadius: "7px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Wrench size={14} color="var(--interlub-red)" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{pr.nombreInterno}</p>
                          {pr.identificacionInterna && <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>ID: {pr.identificacionInterna}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="hide-on-tablet" style={{ fontSize: "0.825rem" }}>{oem?.nombre ?? pr.oemOtro ?? "—"}</td>
                    <td className="hide-on-laptop" style={{ fontSize: "0.825rem" }}>{pr.capacidadTons ? `${pr.capacidadTons} T` : "—"}</td>
                    <td className="hide-on-laptop">
                      <div>
                        <p style={{ fontSize: "0.8rem", fontWeight: 500 }}>{planta?.nombre ?? "—"}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{empresa?.nombreComercial}</p>
                      </div>
                    </td>
                    <td className="hide-on-laptop-large" style={{ fontSize: "0.825rem", color: (pr.oeePct ?? 0) >= 80 ? "var(--accent-green)" : "var(--accent-amber)" }}>
                      {pr.oeePct ? `${pr.oeePct}%` : "—"}
                    </td>
                    <td className="hide-on-desktop-small">
                      <div style={{ minWidth: 80 }}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{formatPercent(pr.pctCompletitud)}</span>
                        </div>
                        <div className="progress-bar-track" style={{ height: 4 }}>
                          <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${pr.pctCompletitud}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusColors[pr.estado as keyof typeof statusColors]}`}>
                        {statusLabels[pr.estado]}
                      </span>
                    </td>
                    <td>
                      {planta && (
                        <Link href={`/plantas/${planta.id}`}>
                          <button className="btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                            <ChevronRight size={14} />
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

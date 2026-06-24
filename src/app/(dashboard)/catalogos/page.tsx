"use client";

import { useState } from "react";
import { OEMS, PRODUCTOS_INTERLUB, PRODUCTOS_COMPETIDORES } from "@/lib/data";
import { statusColors } from "@/lib/utils";
import { BookOpen, Factory, Wrench, ShieldAlert, Award, FileText, Check } from "lucide-react";

export default function CatalogosPage() {
  const [activeTab, setActiveTab] = useState<"oem" | "interlub" | "competitor">("interlub");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Catálogos Estándar</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Consulta de base de datos de fabricantes, productos Interlub y equivalencias de la competencia</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--bg-border)", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("interlub")}
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none",
            color: activeTab === "interlub" ? "var(--interlub-red)" : "var(--text-secondary)",
            borderBottom: activeTab === "interlub" ? "2px solid var(--interlub-red)" : "2px solid transparent",
            fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
          }}
        >
          🥇 Catálogo Interlub
        </button>
        <button
          onClick={() => setActiveTab("oem")}
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none",
            color: activeTab === "oem" ? "var(--interlub-red)" : "var(--text-secondary)",
            borderBottom: activeTab === "oem" ? "2px solid var(--interlub-red)" : "2px solid transparent",
            fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
          }}
        >
          🏭 Fabricantes OEM
        </button>
        <button
          onClick={() => setActiveTab("competitor")}
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none",
            color: activeTab === "competitor" ? "var(--interlub-red)" : "var(--text-secondary)",
            borderBottom: activeTab === "competitor" ? "2px solid var(--interlub-red)" : "2px solid transparent",
            fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
          }}
        >
          ⚠️ Productos Competencia
        </button>
      </div>

      {/* INTERLUB TAB */}
      {activeTab === "interlub" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {PRODUCTOS_INTERLUB.map((prod) => (
            <div key={prod.id} className="interlub-card animate-fade-in" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>{prod.nombreComercial}</h3>
                  <span className="status-badge" style={{ background: "rgba(204,0,0,0.08)", color: "var(--interlub-red)", borderColor: "rgba(204,0,0,0.15)", marginTop: "3px" }}>
                    {prod.familia}
                  </span>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={16} color="var(--accent-green)" />
                </div>
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", flex: 1, marginBottom: "1rem", lineHeight: 1.4 }}>
                {prod.descripcionTecnica}
              </p>

              {/* Specs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", borderTop: "1px solid var(--bg-border)", paddingTop: "0.75rem", marginBottom: "0.875rem" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Base</p>
                  <p style={{ fontSize: "0.775rem", fontWeight: 600 }}>{prod.baseLubricante ?? "—"}</p>
                </div>
                {prod.viscosidad && (
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Viscosidad</p>
                    <p style={{ fontSize: "0.775rem", fontWeight: 600 }}>{prod.viscosidad}</p>
                  </div>
                )}
                {prod.puntoInflamacion && (
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Pto. Inflamación</p>
                    <p style={{ fontSize: "0.775rem", fontWeight: 600 }}>{prod.puntoInflamacion}</p>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Precio Ref.</p>
                  <p style={{ fontSize: "0.775rem", color: "var(--accent-green)", fontWeight: 700 }}>
                    ${prod.precioReferencia?.toFixed(2)} / {prod.unidad}
                  </p>
                </div>
              </div>

              {/* Technical links */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-ghost" style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.72rem", justifyContent: "center" }}>
                  <FileText size={12} /> TDS (Ficha)
                </button>
                <button className="btn-ghost" style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.72rem", justifyContent: "center" }}>
                  <FileText size={12} /> SDS (Seguridad)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OEM TAB */}
      {activeTab === "oem" && (
        <div className="interlub-card" style={{ overflow: "hidden" }}>
          <table className="interlub-table">
            <thead>
              <tr>
                <th>Fabricante</th>
                <th>País de Origen</th>
                <th className="hide-on-mobile">Sustento OEM</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {OEMS.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 28, height: 28, borderRadius: "6px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Factory size={13} color="var(--text-muted)" />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{o.nombre}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>{o.paisOrigen}</td>
                  <td className="hide-on-mobile">
                    <span style={{ fontSize: "0.72rem", background: "rgba(34,197,94,0.12)", color: "var(--accent-green)", borderRadius: "4px", padding: "0.15rem 0.5rem" }}>
                      Homologación Validada
                    </span>
                  </td>
                  <td>
                    <span className="status-badge bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COMPETITOR TAB */}
      {activeTab === "competitor" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {PRODUCTOS_COMPETIDORES.map((c) => {
            const equiv = PRODUCTOS_INTERLUB.find(p => p.id === c.productoInterlubEquivalenteId);
            return (
              <div key={c.id} className="interlub-card animate-fade-in" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>{c.nombreProducto}</h3>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>Marca: {c.marca}</p>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldAlert size={16} color="#EF4444" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Viscosidad</p>
                    <p style={{ fontSize: "0.75rem", fontWeight: 500 }}>{c.viscosidad ?? "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Base Lubricante</p>
                    <p style={{ fontSize: "0.75rem", fontWeight: 500 }}>{c.baseLubricante ?? "—"}</p>
                  </div>
                </div>

                {equiv && (
                  <div style={{ marginTop: "auto", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px", padding: "0.75rem" }}>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Equivalente Interlub</p>
                    <p style={{ fontSize: "0.825rem", color: "var(--accent-green)", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
                      <Check size={12} /> {equiv.nombreComercial}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px" }}>{equiv.familia}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

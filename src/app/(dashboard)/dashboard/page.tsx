"use client";

import React, { useState, useMemo } from "react";
import { useAuth, useRole } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { PRODUCTOS_COMPETIDORES } from "@/lib/data";
import { ChevronRight, Building2, AlertCircle, Clock, RotateCcw, CheckCircle2, Wrench, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from "recharts";
import PressGlobe, { COUNTRY_LATLONG, type GlobePoint } from "@/components/PressGlobe";

// ─── Brand icon helper ────────────────────────────────────────────────────────
function BIcon({ src, size = 18, color }: { src: string; size?: number; color: string }) {
  const tintMap: Record<string, string> = {
    "#3B82F6":            "invert(1) sepia(1) saturate(5) hue-rotate(190deg) brightness(0.9)",
    "var(--accent-amber)": "invert(1) sepia(1) saturate(5) hue-rotate(20deg) brightness(0.95)",
    "var(--accent-green)": "invert(1) sepia(1) saturate(5) hue-rotate(100deg) brightness(0.85)",
    "#8B5CF6":            "invert(1) sepia(1) saturate(5) hue-rotate(250deg) brightness(0.85)",
    "var(--interlub-red)": "invert(1) sepia(1) saturate(6) hue-rotate(320deg) brightness(0.9)",
    "#EF4444":            "invert(1) sepia(1) saturate(6) hue-rotate(320deg) brightness(0.85)",
    default:              "invert(1) brightness(0.7)",
  };
  return (
    <img src={src} alt="" aria-hidden width={size} height={size}
      style={{ objectFit: "contain", flexShrink: 0, filter: tintMap[color] ?? tintMap.default }}
    />
  );
}


// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, color = "var(--interlub-red)", delay = 0
}: {
  label: string; value: string; sub?: string;
  iconSrc?: string; color?: string; delay?: number;
}) {
  return (
    <div className="kpi-card animate-fade-in dim-idle" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3" style={{ minHeight: 20 }}>
        {sub && (
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "auto", textAlign: "right" }}>{sub}</span>
        )}
      </div>
      <p className="kpi-value">{value}</p>
      <p className="kpi-label">{label}</p>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 52, stroke = 5, color = "var(--interlub-red)" }: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--bg-border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Director Dashboard ───────────────────────────────────────────────────────
function DirectorDashboard() {
  const { empresas, plantas, prensas, usuarios } = useStore();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // ── 1. Consultant stats ───────────────────────────────────────────────────
  const consultores = usuarios.filter(u => u.rol === "consultor" && u.activo);

  const consultorStats = consultores.map(consultor => {
    const misEmpresas = empresas.filter(e => e.consultorId === consultor.id);
    const misPlantaIds = plantas
      .filter(p => misEmpresas.some(e => e.id === p.empresaId))
      .map(p => p.id);
    const misPrensas = prensas.filter(pr => misPlantaIds.includes(pr.plantaId));

    const totalPrensas = misPrensas.length;
    const avgPct = totalPrensas === 0
      ? 0
      : Math.round(misPrensas.reduce((s, pr) => s + pr.pctCompletitud, 0) / totalPrensas);

    return {
      id: consultor.id,
      nombre: consultor.nombre,
      empresas: misEmpresas.length,
      prensas: totalPrensas,
      avgPct,
      prensasCompletas: misPrensas.filter(pr => pr.pctCompletitud >= 80).length,
      prensasPendientes: misPrensas.filter(pr => pr.pctCompletitud < 30).length,
    };
  }).sort((a, b) => b.avgPct - a.avgPct);

  // ── 2. Globe data: group prensas by plant country ─────────────────────────
  const pressByCountry = useMemo(() => {
    const map: Record<string, {
      pais: string; count: number; interlubCount: number;
      empresasNombres: string[]; flag: string;
    }> = {};

    prensas.forEach(pr => {
      const planta = plantas.find(p => p.id === pr.plantaId);
      const empresa = empresas.find(e => e.id === planta?.empresaId);
      const pais = planta?.pais || empresa?.pais || "México";
      const coords = COUNTRY_LATLONG[pais];
      if (!coords) return;

      if (!map[pais]) {
        map[pais] = { pais, count: 0, interlubCount: 0, empresasNombres: [], flag: coords.flag };
      }
      map[pais].count += 1;

      const hasInterlub = pr.aplicaciones?.some(a => a.estado === "lubricada_interlub");
      if (hasInterlub) map[pais].interlubCount += 1;

      if (empresa && !map[pais].empresasNombres.includes(empresa.nombreComercial)) {
        map[pais].empresasNombres.push(empresa.nombreComercial);
      }
    });

    return map;
  }, [prensas, plantas, empresas]);

  const globePoints: GlobePoint[] = useMemo(() =>
    Object.values(pressByCountry).map(d => ({
      ...d,
      lat: COUNTRY_LATLONG[d.pais]?.lat ?? 0,
      lng: COUNTRY_LATLONG[d.pais]?.lng ?? 0,
    })),
    [pressByCountry]
  );

  const selectedData = selectedCountry ? pressByCountry[selectedCountry] : null;

  // ── 3. Global Interlub presence ───────────────────────────────────────────
  const totalApps = prensas.flatMap(pr => pr.aplicaciones || []).filter(a => a.estado !== "desconocido");
  const interlubApps = totalApps.filter(a => a.estado === "lubricada_interlub");
  const competidorApps = totalApps.filter(a => a.estado === "lubricada_competencia");
  const sinLubricarApps = totalApps.filter(a => a.estado === "sin_lubricar");

  const totalPrensas = prensas.length;
  const prensasConInterlub = prensas.filter(pr =>
    pr.aplicaciones?.some(a => a.estado === "lubricada_interlub")
  ).length;
  const interlubPresenciaPct = totalPrensas === 0 ? 0 : Math.round((prensasConInterlub / totalPrensas) * 100);
  const avgFillGlobal = totalPrensas === 0 ? 0
    : Math.round(prensas.reduce((s, pr) => s + pr.pctCompletitud, 0) / totalPrensas);

  // ── 4. Competitors ────────────────────────────────────────────────────────
  const competidoresPorPais: Record<string, Record<string, number>> = {};
  prensas.forEach(pr => {
    const planta = plantas.find(p => p.id === pr.plantaId);
    const empresa = empresas.find(e => e.id === planta?.empresaId);
    const pais = planta?.pais || empresa?.pais || "México";

    pr.aplicaciones?.forEach(app => {
      if (app.estado === "lubricada_competencia") {
        let brand = "Otros";
        if (app.productoCompetidorId) {
          const cp = PRODUCTOS_COMPETIDORES.find(p => p.id === app.productoCompetidorId);
          if (cp) brand = cp.marca;
        } else if ((app.camposEspeciales as Record<string, unknown>)?.proveedor_competencia) {
          brand = (app.camposEspeciales as Record<string, unknown>).proveedor_competencia as string;
        }
        if (!competidoresPorPais[pais]) competidoresPorPais[pais] = {};
        competidoresPorPais[pais][brand] = (competidoresPorPais[pais][brand] || 0) + 1;
      }
    });
  });

  const compGlobal: Record<string, number> = {};
  Object.values(competidoresPorPais).forEach(map => {
    Object.entries(map).forEach(([brand, cnt]) => {
      compGlobal[brand] = (compGlobal[brand] || 0) + cnt;
    });
  });
  const topCompetidores = Object.entries(compGlobal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([marca, aplicaciones]) => ({ marca, aplicaciones }));

  const selectedCompetitors = selectedCountry ? competidoresPorPais[selectedCountry] : null;

  const COMP_COLORS = ["#EF4444", "#F97316", "#EAB308", "#10B981", "#3B82F6", "#8B5CF6"];

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            Dashboard Comercial
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Vista operativa · Prensas registradas · Presencia Interlub
          </p>
        </div>
        <Link href="/empresas/nueva">
          <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
            <Building2 size={14} /> Nueva Empresa
          </button>
        </Link>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
        <KpiCard label="Prensas Registradas" value={`${totalPrensas}`} sub={`${empresas.length} empresas`}
          iconSrc="/assets/icon-extrusion.png" color="#3B82F6" delay={0} />
        <KpiCard label="Llenado Promedio Global" value={`${avgFillGlobal}%`} sub="de fichas de prensa"
          iconSrc="/assets/icon-longperiods.png" color="var(--accent-amber)" delay={100} />
        <KpiCard label="Presencia Interlub" value={`${interlubPresenciaPct}%`} sub={`${prensasConInterlub} de ${totalPrensas} prensas`}
          iconSrc="/assets/icon-chemical.png" color="var(--accent-green)" delay={200} />
        <KpiCard label="Consultores Activos" value={`${consultores.length}`} sub={`${empresas.length} empresas asignadas`}
          iconSrc="/assets/icon-eco.png" color="#8B5CF6" delay={300} />
      </div>

      {/* ── App Status Bar ─────────────────────────────────────────────────── */}
      {totalApps.length > 0 && (
        <div className="interlub-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
              Distribución de Aplicaciones ({totalApps.length} mapeadas)
            </span>
            <div className="flex items-center gap-3" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", marginRight: 4 }} />Interlub {interlubApps.length}</span>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--interlub-red)", marginRight: 4 }} />Competencia {competidorApps.length}</span>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6, marginRight: 4 }} />Sin lubricar {sinLubricarApps.length}</span>
            </div>
          </div>
          <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: "var(--bg-secondary)" }}>
            {interlubApps.length > 0 && (
              <div style={{ width: `${(interlubApps.length / totalApps.length) * 100}%`, background: "var(--accent-green)", transition: "width 0.6s ease" }} />
            )}
            {competidorApps.length > 0 && (
              <div style={{ width: `${(competidorApps.length / totalApps.length) * 100}%`, background: "var(--interlub-red)", transition: "width 0.6s ease" }} />
            )}
            {sinLubricarApps.length > 0 && (
              <div style={{ width: `${(sinLubricarApps.length / totalApps.length) * 100}%`, background: "var(--text-muted)", opacity: 0.4, transition: "width 0.6s ease" }} />
            )}
          </div>
        </div>
      )}

      {/* ── 3D Globe + Drill-down panel ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Globe card */}
        <div className="interlub-card dim-idle" style={{ padding: 0, height: 490, position: "relative", display: "flex", flexDirection: "column" }}>
          {/* Header overlay */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
            padding: "0.875rem 1.25rem",
            background: "linear-gradient(to bottom, rgba(22,22,30,0.95) 0%, rgba(22,22,30,0.6) 70%, transparent 100%)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderRadius: "12px 12px 0 0",
          }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BIcon src="/assets/icon-extrusion.png" size={16} color="var(--interlub-red)" />
              Mapa de Prensas Registradas
            </h3>
            <div className="flex items-center gap-2">
              {selectedCountry && (
                <button className="btn-ghost" onClick={() => setSelectedCountry(null)}
                  style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <RotateCcw size={11} /> Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Globe fills the card */}
          <div style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}>
            <PressGlobe
              points={globePoints}
              selectedCountry={selectedCountry}
              onCountryClick={(pais) => setSelectedCountry(prev => prev === pais ? null : pais)}
            />
          </div>

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
            padding: "0.6rem 1.25rem",
            background: "linear-gradient(to top, rgba(22,22,30,0.95) 0%, rgba(22,22,30,0.6) 70%, transparent 100%)",
            display: "flex", alignItems: "center", gap: "1rem",
            borderRadius: "0 0 12px 12px",
          }}>
            <span style={{ fontSize: "0.63rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#CC0000", display: "inline-block", boxShadow: "0 0 6px #CC0000" }} /> Prensas Registradas (Interlub)
            </span>
            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginLeft: "auto", opacity: 0.6 }}>
              Arrastra · Zoom · Clic para detalle
            </span>
          </div>
        </div>

        {/* Country Drill-down */}
        <div className="interlub-card dim-idle" style={{ padding: "1.25rem", height: 490, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {selectedData ? (
            <>
              {/* Country header */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "0.75rem", marginBottom: "0.875rem" }}>
                <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {selectedData.flag} {selectedCountry}
                </h4>
              </div>

              {/* Press count */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.875rem"
              }}>
                <div style={{ padding: "0.65rem", borderRadius: 8, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#60A5FA" }}>{selectedData.count}</p>
                  <p style={{ fontSize: "0.67rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>prensa{selectedData.count !== 1 ? "s" : ""} registrada{selectedData.count !== 1 ? "s" : ""}</p>
                </div>
                <div style={{
                  padding: "0.65rem", borderRadius: 8,
                  background: selectedData.count === 0 ? "rgba(255,255,255,0.03)"
                    : (selectedData.interlubCount / selectedData.count) >= 0.5 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                  border: `1px solid ${selectedData.count === 0 ? "rgba(255,255,255,0.06)" : (selectedData.interlubCount / selectedData.count) >= 0.5 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`
                }}>
                  <p style={{
                    fontSize: "1.5rem", fontWeight: 800, margin: 0,
                    color: selectedData.count === 0 ? "var(--text-muted)"
                      : (selectedData.interlubCount / selectedData.count) >= 0.5 ? "#10B981" : "#F59E0B"
                  }}>
                    {selectedData.count === 0 ? "—" : `${Math.round((selectedData.interlubCount / selectedData.count) * 100)}%`}
                  </p>
                  <p style={{ fontSize: "0.67rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>presencia Interlub</p>
                </div>
              </div>

              {/* Interlub presence bar */}
              <div style={{ marginBottom: "0.875rem" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Distribución de lubricantes</span>
                </div>
                {(() => {
                  // Breakdown: interlub / competitor / unlubbed among presses in country
                  const countryPresses = prensas.filter(pr => {
                    const pl = plantas.find(p => p.id === pr.plantaId);
                    const em = empresas.find(e => e.id === pl?.empresaId);
                    const pais = pl?.pais || em?.pais || "México";
                    return pais === selectedCountry;
                  });
                  const apps = countryPresses.flatMap(pr => pr.aplicaciones || []).filter(a => a.estado !== "desconocido");
                  const il = apps.filter(a => a.estado === "lubricada_interlub").length;
                  const cp = apps.filter(a => a.estado === "lubricada_competencia").length;
                  const sl = apps.filter(a => a.estado === "sin_lubricar").length;
                  const total = apps.length;
                  if (total === 0) return <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sin aplicaciones mapeadas</p>;
                  return (
                    <>
                      <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.05)", marginBottom: "0.35rem" }}>
                        {il > 0 && <div style={{ width: `${(il/total)*100}%`, background: "#10B981" }} />}
                        {cp > 0 && <div style={{ width: `${(cp/total)*100}%`, background: "var(--interlub-red)" }} />}
                        {sl > 0 && <div style={{ width: `${(sl/total)*100}%`, background: "rgba(255,255,255,0.15)" }} />}
                      </div>
                      <div className="flex" style={{ gap: "0.75rem", fontSize: "0.67rem", color: "var(--text-muted)" }}>
                        {il > 0 && <span><span style={{ color: "#10B981" }}>●</span> Interlub {Math.round((il/total)*100)}%</span>}
                        {cp > 0 && <span><span style={{ color: "var(--interlub-red)" }}>●</span> Competencia {Math.round((cp/total)*100)}%</span>}
                        {sl > 0 && <span><span style={{ color: "rgba(255,255,255,0.3)" }}>●</span> Sin lubricar {Math.round((sl/total)*100)}%</span>}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Competitors */}
              {selectedCompetitors && Object.keys(selectedCompetitors).length > 0 && (
                <div style={{ marginBottom: "0.875rem" }}>
                  <p style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
                    Competidores presentes
                  </p>
                  {Object.entries(selectedCompetitors)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([brand, cnt], i) => {
                      const total = Object.values(selectedCompetitors).reduce((s, v) => s + v, 0);
                      const pct = Math.round((cnt / total) * 100);
                      const barColors = ["#EF4444", "#F97316", "#EAB308", "#8B5CF6", "#3B82F6"];
                      return (
                        <div key={brand} style={{ marginBottom: "0.45rem" }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: "0.2rem" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>{brand}</span>
                            <span style={{ fontSize: "0.7rem", color: barColors[i] ?? "var(--text-muted)", fontWeight: 700 }}>{cnt} app{cnt !== 1 ? "s" : ""} · {pct}%</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: barColors[i] ?? "#666", borderRadius: 999 }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Companies */}
              <p style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "0.4rem" }}>
                Empresas en este país
              </p>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {selectedData.empresasNombres.map(nombre => (
                  <div key={nombre} style={{ padding: "0.35rem 0.6rem", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "0.3rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Building2 size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    {nombre}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.9rem", fontWeight: 800 }}>
                Resumen por País
              </h4>
              <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                Haz clic en un punto del globo para ver prensas, presencia Interlub y competidores de ese país.
              </p>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {globePoints.length === 0 && (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", padding: "2rem" }}>
                    Aún no hay prensas registradas
                  </p>
                )}
                {[...globePoints].sort((a, b) => b.count - a.count).map(d => {
                  const interlubPct = d.count === 0 ? 0 : Math.round((d.interlubCount / d.count) * 100);
                  const pctColor = interlubPct >= 50 ? "#10B981" : interlubPct > 0 ? "#F59E0B" : "var(--text-muted)";
                  const countryComps = competidoresPorPais[d.pais];
                  const topComp = countryComps
                    ? Object.entries(countryComps).sort((a, b) => b[1] - a[1])[0]?.[0]
                    : null;
                  return (
                    <div key={d.pais}
                      onClick={() => setSelectedCountry(d.pais)}
                      className="btn-interactive"
                      style={{
                        display: "flex", alignItems: "center", gap: "0.65rem",
                        padding: "0.55rem 0.7rem", borderRadius: 8,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        marginBottom: "0.35rem", cursor: "pointer"
                      }}>
                      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{d.flag}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center justify-between">
                          <p style={{ fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>{d.pais}</p>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: pctColor }}>{interlubPct}%</span>
                        </div>
                        <div className="flex items-center" style={{ gap: "0.5rem", marginTop: "0.15rem" }}>
                          <p style={{ fontSize: "0.67rem", margin: 0, color: "var(--text-muted)" }}>
                            {d.count} prensa{d.count !== 1 ? "s" : ""}
                          </p>
                          {topComp && (
                            <p style={{ fontSize: "0.67rem", margin: 0, color: "rgba(239,68,68,0.7)" }}>
                              · vs {topComp}
                            </p>
                          )}
                        </div>
                        <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.05)", marginTop: "0.3rem", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${interlubPct}%`, background: pctColor, borderRadius: 999 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Consultant Fill % + Competitors ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Consultant progress */}
        <div className="interlub-card dim-idle" style={{ padding: "1.25rem" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
            <BIcon src="/assets/icon-bearings.png" size={18} color="var(--interlub-red)" />
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
              % Llenado de Fichas por Consultor
            </h3>
          </div>

          {consultorStats.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", padding: "2rem" }}>
              No hay consultores activos registrados
            </p>
          )}

          {consultorStats.map((cs, i) => (
            <div key={cs.id} className="animate-fade-in" style={{
              animationDelay: `${i * 80}ms`,
              padding: "0.75rem",
              borderRadius: 10,
              background: "var(--bg-secondary)",
              marginBottom: "0.6rem",
              border: "1px solid var(--bg-border)"
            }}>
              <div className="flex items-center gap-3">
                <ProgressRing
                  pct={cs.avgPct}
                  color={cs.avgPct >= 70 ? "var(--accent-green)" : cs.avgPct >= 40 ? "var(--accent-amber)" : "var(--interlub-red)"}
                />
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, margin: 0 }}>{cs.nombre}</p>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 800,
                      color: cs.avgPct >= 70 ? "var(--accent-green)" : cs.avgPct >= 40 ? "var(--accent-amber)" : "var(--interlub-red)"
                    }}>
                      {cs.avgPct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3" style={{ marginTop: "0.35rem", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    <span><strong style={{ color: "var(--text-secondary)" }}>{cs.empresas}</strong> empresas</span>
                    <span><strong style={{ color: "var(--text-secondary)" }}>{cs.prensas}</strong> prensas</span>
                    <span style={{ color: "var(--accent-green)" }}>
                      <CheckCircle2 size={10} style={{ display: "inline", marginRight: 2 }} />{cs.prensasCompletas} completas
                    </span>
                    {cs.prensasPendientes > 0 && (
                      <span style={{ color: "var(--interlub-red)" }}>
                        <Clock size={10} style={{ display: "inline", marginRight: 2 }} />{cs.prensasPendientes} pendientes
                      </span>
                    )}
                  </div>
                  <div className="progress-bar-track" style={{ marginTop: "0.5rem" }}>
                    <div className="progress-bar-fill" style={{
                      width: `${cs.avgPct}%`,
                      background: cs.avgPct >= 70
                        ? "linear-gradient(90deg, #10B981, #34D399)"
                        : cs.avgPct >= 40
                          ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                          : "linear-gradient(90deg, var(--interlub-red), #FF6666)",
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Unassigned alert */}
          {(() => {
            const unassigned = prensas.filter(pr => {
              const planta = plantas.find(p => p.id === pr.plantaId);
              const empresa = empresas.find(e => e.id === planta?.empresaId);
              return !empresa?.consultorId;
            });
            if (unassigned.length === 0) return null;
            return (
              <div style={{ padding: "0.6rem 0.75rem", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px dashed var(--accent-amber)", marginTop: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--accent-amber)", margin: 0, fontWeight: 600 }}>
                  <AlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                  {unassigned.length} prensa{unassigned.length !== 1 ? "s" : ""} sin consultor asignado
                </p>
              </div>
            );
          })()}
        </div>

        {/* Competitor chart */}
        <div className="interlub-card dim-idle" style={{ padding: "1.25rem" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
            <BIcon src="/assets/icon-contaminated.png" size={18} color="var(--interlub-red)" />
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
              Principales Competidores
            </h3>
          </div>

          {topCompetidores.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", padding: "2rem" }}>
              No hay aplicaciones con competencia detectadas
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCompetidores} layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bg-border)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="marca" tick={{ fontSize: 11, fill: "var(--text-primary)" }} width={85} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: unknown) => [`${v} aplicaciones`, "Competencia"]}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="aplicaciones" radius={[0, 4, 4, 0]} barSize={14}>
                  {topCompetidores.map((_, i) => (
                    <Cell key={i} fill={COMP_COLORS[i % COMP_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Press table (lowest fill first) ────────────────────────────────── */}
      <div className="interlub-card" style={{ padding: "1.25rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
            Prensas con Mayor Oportunidad de Completar
          </h3>
          <Link href="/empresas" style={{ fontSize: "0.75rem", color: "var(--interlub-red)", textDecoration: "none" }}>
            Ver empresas →
          </Link>
        </div>

        {prensas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <Wrench size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
            <p style={{ fontSize: "0.875rem" }}>No hay prensas registradas</p>
          </div>
        ) : (
          <table className="interlub-table">
            <thead>
              <tr>
                <th>Prensa</th>
                <th>Empresa</th>
                <th>País</th>
                <th>Consultor</th>
                <th>Llenado</th>
                <th>Interlub</th>
              </tr>
            </thead>
            <tbody>
              {[...prensas]
                .sort((a, b) => a.pctCompletitud - b.pctCompletitud)
                .slice(0, 8)
                .map(pr => {
                  const planta = plantas.find(p => p.id === pr.plantaId);
                  const empresa = empresas.find(e => e.id === planta?.empresaId);
                  const consultor = usuarios.find(u => u.id === empresa?.consultorId);
                  const pais = planta?.pais || empresa?.pais || "—";
                  const flag = COUNTRY_LATLONG[pais]?.flag || "";

                  const totalAps = (pr.aplicaciones || []).filter(a => a.estado !== "desconocido").length;
                  const interlubAps = (pr.aplicaciones || []).filter(a => a.estado === "lubricada_interlub").length;
                  const interlubPct = totalAps === 0 ? null : Math.round((interlubAps / totalAps) * 100);
                  const fillColor = pr.pctCompletitud >= 70 ? "var(--accent-green)"
                    : pr.pctCompletitud >= 40 ? "var(--accent-amber)" : "var(--interlub-red)";

                  return (
                    <tr key={pr.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/empresas/${empresa?.id}`}
                          style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                          {pr.nombreInterno}
                        </Link>
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{empresa?.nombreComercial || "—"}</td>
                      <td style={{ fontSize: "0.8rem" }}>{flag} {pais}</td>
                      <td style={{ fontSize: "0.8rem", color: consultor ? "var(--text-secondary)" : "var(--accent-amber)" }}>
                        {consultor?.nombre || "Sin asignar"}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar-track" style={{ width: 60, flex: "none" }}>
                            <div className="progress-bar-fill" style={{ width: `${pr.pctCompletitud}%`, background: fillColor }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", color: fillColor, fontWeight: 700 }}>
                            {pr.pctCompletitud}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {interlubPct === null
                          ? <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Sin mapear</span>
                          : <span style={{
                            fontSize: "0.75rem", fontWeight: 700,
                            color: interlubPct >= 50 ? "var(--accent-green)" : interlubPct > 0 ? "var(--accent-amber)" : "var(--text-muted)"
                          }}>{interlubPct}%</span>
                        }
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

// ─── Consultor Dashboard ──────────────────────────────────────────────────────
function ConsultorDashboard() {
  const { user } = useAuth();
  const { empresas, plantas, prensas } = useStore();

  const misEmpresas = empresas.filter(e => e.consultorId === user?.id);
  const misPlantaIds = plantas
    .filter(p => misEmpresas.some(e => e.id === p.empresaId))
    .map(p => p.id);
  const misPrensas = prensas.filter(pr => misPlantaIds.includes(pr.plantaId));

  const totalPrensas = misPrensas.length;
  const avgFill = totalPrensas === 0
    ? 0
    : Math.round(misPrensas.reduce((s, pr) => s + pr.pctCompletitud, 0) / totalPrensas);
  const prensasCompletas = misPrensas.filter(pr => pr.pctCompletitud >= 80).length;
  const prensasPendientes = misPrensas.filter(pr => pr.pctCompletitud < 30).length;
  const prensasProgreso = totalPrensas - prensasCompletas - prensasPendientes;

  const interlubApps = misPrensas.flatMap(pr => pr.aplicaciones || []).filter(a => a.estado === "lubricada_interlub").length;
  const totalApps = misPrensas.flatMap(pr => pr.aplicaciones || []).filter(a => a.estado !== "desconocido").length;
  const interlubPct = totalApps === 0 ? 0 : Math.round((interlubApps / totalApps) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            Hola, {user?.nombre.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {misEmpresas.length} empresa{misEmpresas.length !== 1 ? "s" : ""} asignada{misEmpresas.length !== 1 ? "s" : ""}
            · {totalPrensas} prensa{totalPrensas !== 1 ? "s" : ""} registrada{totalPrensas !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/empresas/nueva">
          <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
            <Building2 size={14} /> Nueva Empresa
          </button>
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <KpiCard label="Mis Empresas" value={`${misEmpresas.length}`} iconSrc="/assets/icon-eco.png" color="var(--interlub-red)" delay={0} />
        <KpiCard label="Llenado Promedio" value={`${avgFill}%`} sub="de fichas de prensa" iconSrc="/assets/icon-longperiods.png" color="var(--accent-amber)" delay={100} />
        <KpiCard label="Presencia Interlub" value={`${interlubPct}%`} sub={`${interlubApps} de ${totalApps} apps`} iconSrc="/assets/icon-chemical.png" color="var(--accent-green)" delay={200} />
        <KpiCard label="Prensas Registradas" value={`${totalPrensas}`} sub={`${prensasCompletas} completas`} iconSrc="/assets/icon-extrusion.png" color="#3B82F6" delay={300} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Fichas completas (≥80%)", count: prensasCompletas, color: "var(--accent-green)", icon: CheckCircle2 },
          { label: "En progreso (30–79%)", count: prensasProgreso, color: "var(--accent-amber)", icon: TrendingUp },
          { label: "Pendientes (<30%)", count: prensasPendientes, color: "var(--interlub-red)", icon: Clock },
        ].map(item => (
          <div key={item.label} className="interlub-card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: item.color }}>{item.count}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="interlub-card">
        <div className="flex items-center justify-between" style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--bg-border)" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>Mis Empresas</h3>
          <Link href="/empresas" style={{ fontSize: "0.75rem", color: "var(--interlub-red)", textDecoration: "none" }}>Ver todas →</Link>
        </div>
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {misEmpresas.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              <Building2 size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
              <p style={{ fontSize: "0.875rem" }}>No tienes empresas asignadas aún</p>
            </div>
          )}
          {misEmpresas.map(empresa => {
            const empPlantas = plantas.filter(p => p.empresaId === empresa.id);
            const empPrensas = prensas.filter(pr => empPlantas.some(pl => pl.id === pr.plantaId));
            const empAvgFill = empPrensas.length === 0 ? 0
              : Math.round(empPrensas.reduce((s, pr) => s + pr.pctCompletitud, 0) / empPrensas.length);
            const empInterlub = empPrensas.flatMap(pr => pr.aplicaciones || []).filter(a => a.estado === "lubricada_interlub").length;
            const empTotalApps = empPrensas.flatMap(pr => pr.aplicaciones || []).filter(a => a.estado !== "desconocido").length;
            const empInterlubPct = empTotalApps === 0 ? null : Math.round((empInterlub / empTotalApps) * 100);
            const fillColor = empAvgFill >= 70 ? "var(--accent-green)" : empAvgFill >= 40 ? "var(--accent-amber)" : "var(--interlub-red)";

            return (
              <div key={empresa.id} className="animate-fade-in" style={{ padding: "0.875rem", borderRadius: 10, border: "1px solid var(--bg-border)", background: "var(--bg-secondary)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={15} color="var(--interlub-red)" />
                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{empresa.nombreComercial}</span>
                  </div>
                  <Link href={`/empresas/${empresa.id}`}>
                    <button className="btn-ghost" style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}>
                      Ver <ChevronRight size={12} />
                    </button>
                  </Link>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem" }}>
                  <div><span style={{ color: "var(--text-muted)" }}>Prensas: </span><strong>{empPrensas.length}</strong></div>
                  <div><span style={{ color: "var(--text-muted)" }}>Llenado: </span><strong style={{ color: fillColor }}>{empAvgFill}%</strong></div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Interlub: </span>
                    <strong style={{ color: empInterlubPct !== null && empInterlubPct >= 50 ? "var(--accent-green)" : "var(--text-muted)" }}>
                      {empInterlubPct !== null ? `${empInterlubPct}%` : "Sin mapear"}
                    </strong>
                  </div>
                </div>
                <div className="progress-bar-track" style={{ marginTop: "0.5rem" }}>
                  <div className="progress-bar-fill" style={{ width: `${empAvgFill}%`, background: fillColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const role = useRole();
  return (
    <div style={{ position: "relative" }}>
      {role === "direccion" || role === "coordinador"
        ? <DirectorDashboard />
        : <ConsultorDashboard />}
    </div>
  );
}

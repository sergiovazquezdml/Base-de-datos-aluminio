"use client";

import { useState } from "react";
import { formatCurrency, statusColors, statusLabels } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { CATALOGO_APLICACIONES, PRODUCTOS_INTERLUB, PRODUCTOS_COMPETIDORES } from "@/lib/data";
import {
  Lightbulb, TrendingUp, AlertTriangle, Zap, Filter,
  Building2, Factory, ChevronRight, ArrowUpRight, DollarSign,
  CheckCircle2, BarChart3, RefreshCw
} from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; bg: string }> = {
  sin_cubrir: { label: "Sin cubrir", color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: AlertTriangle },
  con_competencia: { label: "Con competencia", color: "#CC0000", bg: "rgba(204,0,0,0.1)", icon: TrendingUp },
  parcialmente_cubierta: { label: "Parcialmente cubierta", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: BarChart3 },
  equipo_ro3: { label: "Oportunidad RO3", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: Zap },
};

const PROB_CONFIG: Record<string, { label: string; color: string }> = {
  alta:     { label: "Alta", color: "var(--accent-green)" },
  media:    { label: "Media", color: "var(--accent-amber)" },
  baja:     { label: "Baja", color: "var(--text-muted)" },
  convertida: { label: "Convertida", color: "#8B5CF6" },
};

export default function OportunidadesPage() {
  const { oportunidades, syncOportunidadHubSpot, empresas } = useStore();
  const [tipoFilter, setTipoFilter] = useState("all");
  const [probFilter, setProbFilter] = useState("all");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const totalPotencialAnual = oportunidades.reduce((a, o) => a + (o.valorPotencialAnual || 0), 0);
  const altaPrioridad = oportunidades.filter(o => o.prioridad?.toLowerCase() === "alta").length;

  const filtered = oportunidades.filter(o => {
    return (tipoFilter === "all" || o.tipo === tipoFilter) &&
           (probFilter === "all" || (o.prioridad || "").toLowerCase() === probFilter);
  }).sort((a, b) => (b.valorPotencialAnual || 0) - (a.valorPotencialAnual || 0));

  const handleSync = (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    setSyncingId(oppId);
    setTimeout(() => {
      syncOportunidadHubSpot(oppId);
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Oportunidades Detectadas</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Ranking automático por potencial económico anual
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" style={{ fontSize: "0.8rem" }}><BarChart3 size={14} /> Exportar Excel</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Potencial Total Anual", value: formatCurrency(totalPotencialAnual), icon: DollarSign, color: "var(--accent-green)" },
          { label: "Oportunidades Totales", value: oportunidades.length.toString(), icon: Lightbulb, color: "var(--interlub-red)" },
          { label: "Alta Prioridad", value: altaPrioridad.toString(), icon: TrendingUp, color: "var(--accent-amber)" },
          { label: "Competencia Identificada", value: oportunidades.filter(o => o.tipo === "con_competencia").length.toString(), icon: AlertTriangle, color: "#3B82F6" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="kpi-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{ width: 36, height: 36, borderRadius: "9px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Icon size={17} color={color} />
            </div>
            <p className="kpi-value" style={{ fontSize: "1.4rem" }}>{value}</p>
            <p className="kpi-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="interlub-card" style={{ padding: "0.875rem 1rem", marginBottom: "1rem" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Filter size={13} /> Tipo:
          </span>
          {[{ v: "all", l: "Todos" }, { v: "con_competencia", l: "Con competencia" }, { v: "sin_cubrir", l: "Sin cubrir" }, { v: "equipo_ro3", l: "RO3" }].map(f => (
            <button key={f.v} onClick={() => setTipoFilter(f.v)} style={{
              padding: "0.3rem 0.625rem", borderRadius: "6px", fontSize: "0.775rem",
              fontWeight: 500, cursor: "pointer", border: "1px solid",
              background: tipoFilter === f.v ? "var(--interlub-red)" : "var(--bg-elevated)",
              color: tipoFilter === f.v ? "white" : "var(--text-secondary)",
              borderColor: tipoFilter === f.v ? "var(--interlub-red)" : "var(--bg-border)",
              transition: "all 0.15s",
            }}>{f.l}</button>
          ))}
          <div style={{ width: "1px", height: "16px", background: "var(--bg-border)", margin: "0 0.25rem" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Prioridad:</span>
          {[{ v: "all", l: "Todas" }, { v: "alta", l: "Alta" }, { v: "media", l: "Media" }, { v: "baja", l: "Baja" }].map(f => (
            <button key={f.v} onClick={() => setProbFilter(f.v)} style={{
              padding: "0.3rem 0.625rem", borderRadius: "6px", fontSize: "0.775rem",
              fontWeight: 500, cursor: "pointer", border: "1px solid",
              background: probFilter === f.v ? "var(--bg-elevated)" : "transparent",
              color: probFilter === f.v ? "var(--text-primary)" : "var(--text-muted)",
              borderColor: probFilter === f.v ? "var(--bg-border)" : "transparent",
              transition: "all 0.15s",
            }}>{f.l}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "0.775rem", color: "var(--text-muted)" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Opportunities list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.map((opp, i) => {
          const tc = TYPE_CONFIG[opp.tipo] || TYPE_CONFIG.sin_cubrir;
          const TIcon = tc.icon;
          const prioKey = (opp.prioridad || "media").toLowerCase();
          const pc = PROB_CONFIG[prioKey] || PROB_CONFIG.media;

          const parentEmpresa = empresas.find(e => e.id === opp.planta?.empresaId);

          // Resolve application names
          let appNombre = "";
          let compNombre = "";
          let recNombre = "";

          if (opp.aplicacionId) {
            // It maps to an application
            // Let's resolve what it is
            const appId = opp.aplicacionId;
            const appKey = appId.split("-").pop() || "";
            const cat = CATALOGO_APLICACIONES.find(c => c.id === appKey || c.id === appId);
            appNombre = cat?.nombre || "Aplicación de lubricación";
            
            const recom = PRODUCTOS_INTERLUB.find(p => p.id === appId.split("-").pop() || p.id === "pi-1"); // fallback
            recNombre = recom?.nombreComercial || "Interforge KI-C";
          } else {
            // RO3 opportunity
            appNombre = "Puller / Jalador (Lubricación Manual)";
            recNombre = "Equipo RO3 + Producto Interlub";
          }

          return (
            <div
              key={opp.id}
              className="interlub-card animate-fade-in"
              style={{ padding: "1.25rem", animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* Left: Info */}
                <div className="flex items-start gap-3" style={{ flex: 1, minWidth: "300px" }}>
                  {/* Rank badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
                    background: i === 0 ? "linear-gradient(135deg, #CC0000, #FF4444)" :
                                i === 1 ? "linear-gradient(135deg, #F59E0B, #FCD34D)" :
                                i === 2 ? "linear-gradient(135deg, #8B5CF6, #A78BFA)" : "var(--bg-elevated)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 800,
                    color: i < 3 ? "white" : "var(--text-muted)",
                  }}>
                    #{i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div style={{
                        display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.5rem",
                        borderRadius: "6px", border: "1px solid", background: tc.bg,
                        borderColor: `${tc.color}30`, color: tc.color, fontSize: "0.7rem", fontWeight: 700
                      }}>
                        <TIcon size={11} /> {tc.label}
                      </div>
                      <div style={{
                        padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid",
                        background: `${pc.color}10`, borderColor: `${pc.color}30`,
                        color: pc.color, fontSize: "0.7rem", fontWeight: 700
                      }}>
                        Prioridad: {pc.label}
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.25rem 1.5rem", marginBottom: "0.625rem" }}>
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Empresa</p>
                        <p style={{ fontSize: "0.825rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Building2 size={12} /> {parentEmpresa?.nombreComercial ?? opp.planta?.nombre ?? "Empresa"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Planta</p>
                        <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>{opp.planta?.nombre}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Aplicación</p>
                        <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>{appNombre}</p>
                      </div>
                    </div>

                    {/* Recomendación */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: "0.775rem", background: "rgba(34,197,94,0.1)", color: "var(--accent-green)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "6px", padding: "0.15rem 0.5rem" }}>
                        ✓ Recomendado: {recNombre}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Potential & HubSpot Sync */}
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>Potencial anual</p>
                    <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-green)", lineHeight: 1 }}>
                      {formatCurrency(opp.valorPotencialAnual || 0)}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleSync(e, opp.id)} 
                    className="btn-primary" 
                    style={{ fontSize: "0.72rem", padding: "0.35rem 0.65rem", background: "#FF7A59", borderColor: "#FF7A59", display: "flex", alignItems: "center", gap: "0.35rem" }}
                    disabled={syncingId === opp.id}
                  >
                    <RefreshCw size={12} className={syncingId === opp.id ? "animate-spin" : ""} />
                    {syncingId === opp.id ? "Sincronizando..." : "Sincronizar HubSpot"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="interlub-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Lightbulb size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "0.875rem" }}>No se detectaron oportunidades con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

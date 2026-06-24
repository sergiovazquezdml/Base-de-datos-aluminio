"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { useLanguage } from "@/lib/i18n-context";
import { AREAS, PRODUCTOS_INTERLUB, PRODUCTOS_COMPETIDORES } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  FileText, Download, BarChart3, PieChartIcon, CheckCircle2,
  TrendingUp, AlertCircle, Building2, UserCheck, ShieldAlert
} from "lucide-react";

export default function ReportesPage() {
  const { empresas, plantas, prensas, oportunidades, usuarios, isLoading } = useStore();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"downloads" | "analytics">("downloads");

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <p>Cargando reportes y análisis...</p>
      </div>
    );
  }

  // --- CALCULATE SUMMARY KPIS ---
  const totalPipeline = oportunidades.reduce((sum, o) => sum + (o.valorPotencialAnual || 0), 0);
  
  const companiesWithOpps = new Set(
    oportunidades
      .map(o => plantas.find(p => p.id === o.plantaId)?.empresaId)
      .filter(Boolean)
  ).size;

  // Wallet Capture average across all companies
  const walletCaptureStats = empresas.map(emp => {
    const pList = plantas.filter(p => p.empresaId === emp.id);
    const prList = prensas.filter(pr => pList.some(p => p.id === pr.plantaId));
    let captado = 0;
    let pendiente = 0;

    prList.forEach(prensa => {
      prensa.aplicaciones?.forEach(app => {
        const refPrice = app.productoInterlubActivoId
          ? (PRODUCTOS_INTERLUB.find(p => p.id === app.productoInterlubActivoId)?.precioReferencia ?? 8.5)
          : 8.5;
        const cons = app.consumoEstimado ?? 150;
        const val = cons * refPrice * 12;

        if (app.estado === "lubricada_interlub") {
          captado += val;
        } else if (app.estado === "lubricada_competencia" || app.estado === "sin_lubricar") {
          pendiente += val;
        }
      });

      prensa.pullers?.forEach(puller => {
        if (puller.mecanismo === "cadena" && puller.tipoLubricacion === "manual") {
          pendiente += 18000; // RO3 opportunity value
        }
      });
    });

    const total = captado + pendiente;
    return total > 0 ? (captado / total) : null;
  }).filter(v => v !== null) as number[];

  const avgWalletCapture = walletCaptureStats.length > 0
    ? walletCaptureStats.reduce((sum, v) => sum + v, 0) / walletCaptureStats.length
    : 0;

  const avgCompletitud = plantas.length > 0
    ? plantas.reduce((sum, p) => sum + p.pctCompletitud, 0) / plantas.length
    : 0;

  // --- REPORT EXPORTERS ---

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const escaped = String(val === undefined || val === null ? "" : val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Opportunity Pipeline Report
  const exportPipelineReport = () => {
    const headers = [
      "ID Oportunidad", "Empresa", "HubSpot ID Empresa", "Planta", "Prensa",
      "Área Técnica", "Tipo Oportunidad", "Valor Mensual (USD)", "Valor Anual (USD)",
      "Prioridad", "Fecha Detección"
    ];

    const rows = oportunidades.map(opp => {
      const planta = plantas.find(p => p.id === opp.plantaId);
      const empresa = empresas.find(e => e.id === planta?.empresaId);
      
      // Find press
      let prensa = prensas.find(pr => pr.aplicaciones?.some(a => a.id === opp.aplicacionId));
      if (!prensa) {
        prensa = prensas.find(pr => opp.id.includes(pr.id));
      }

      // Find area
      let areaNombre = "Área de Extrusión";
      if (opp.tipo !== "equipo_ro3") {
        const app = prensa?.aplicaciones?.find(a => a.id === opp.aplicacionId);
        const area = AREAS.find(ar => ar.id === app?.areaId);
        if (area) areaNombre = area.nombre;
      }

      const tipoLabel = opp.tipo === "equipo_ro3" ? "Automatización RO3 (Puller)" :
                        opp.tipo === "con_competencia" ? "Sustitución de Competencia" : "Aplicación sin Cubrir";

      return [
        opp.id,
        empresa?.nombreComercial || "—",
        empresa?.hubspotId || "—",
        planta?.nombre || "—",
        prensa?.nombreInterno || "—",
        areaNombre,
        tipoLabel,
        (opp.valorPotencialMensual || 0).toFixed(2),
        (opp.valorPotencialAnual || 0).toFixed(2),
        opp.prioridad || "media",
        opp.createdAt ? opp.createdAt.split("T")[0] : "—"
      ];
    });

    downloadCSV("Pipeline_Oportunidades_Extrusion.csv", headers, rows);
  };

  // 2. Client Coverage & Wallet Capture Report
  const exportWalletCaptureReport = () => {
    const headers = [
      "Empresa", "HubSpot ID", "País", "Ciudad/Estado", "Tipo Cuenta",
      "Plantas Registradas", "Prensas Registradas", "Potencial Captado Anual (USD)",
      "Potencial Pendiente Anual (USD)", "Potencial Total Anual (USD)", "Wallet Capture (%)"
    ];

    const rows = empresas.map(emp => {
      const pList = plantas.filter(p => p.empresaId === emp.id);
      const prList = prensas.filter(pr => pList.some(p => p.id === pr.plantaId));
      let captado = 0;
      let pendiente = 0;

      prList.forEach(prensa => {
        prensa.aplicaciones?.forEach(app => {
          const refPrice = app.productoInterlubActivoId
            ? (PRODUCTOS_INTERLUB.find(p => p.id === app.productoInterlubActivoId)?.precioReferencia ?? 8.5)
            : 8.5;
          const cons = app.consumoEstimado ?? 150;
          const val = cons * refPrice * 12;

          if (app.estado === "lubricada_interlub") {
            captado += val;
          } else if (app.estado === "lubricada_competencia" || app.estado === "sin_lubricar") {
            pendiente += val;
          }
        });

        prensa.pullers?.forEach(puller => {
          if (puller.mecanismo === "cadena" && puller.tipoLubricacion === "manual") {
            pendiente += 18000;
          }
        });
      });

      const total = captado + pendiente;
      const capturePct = total > 0 ? ((captado / total) * 100).toFixed(1) : "0.0";

      const tipoLabel = emp.tipo === "cliente_activo" ? "Cliente Activo" :
                        emp.tipo === "prospecto" ? "Prospecto" : "Ex-Cliente";

      return [
        emp.nombreComercial,
        emp.hubspotId || "—",
        emp.pais || "—",
        emp.ciudadEstado || "—",
        tipoLabel,
        pList.length.toString(),
        prList.length.toString(),
        captado.toFixed(2),
        pendiente.toFixed(2),
        total.toFixed(2),
        capturePct
      ];
    });

    downloadCSV("Wallet_Capture_Extrusion.csv", headers, rows);
  };

  // 3. Consultant Completeness Audit Report
  const exportAuditReport = () => {
    const headers = [
      "Consultor", "Email", "Empresas Asignadas", "Plantas Mapeadas",
      "Prensas Mapeadas", "Completitud Promedio (%)", "Oportunidades Detectadas", "Pipeline Anual (USD)"
    ];

    const consultants = usuarios.filter(u => u.rol === "consultor");

    const rows = consultants.map(consultor => {
      const compList = empresas.filter(e => e.consultorId === consultor.id);
      const pltList = plantas.filter(p => compList.some(c => c.id === p.empresaId));
      const prList = prensas.filter(pr => pltList.some(p => p.id === pr.plantaId));

      const completitudProm = pltList.length > 0
        ? (pltList.reduce((sum, p) => sum + p.pctCompletitud, 0) / pltList.length).toFixed(1)
        : "0.0";

      // Opportunities linked to this consultant's plants
      const consultorOpps = oportunidades.filter(o => pltList.some(p => p.id === o.plantaId));
      const pipelineAnual = consultorOpps.reduce((sum, o) => sum + (o.valorPotencialAnual || 0), 0);

      return [
        consultor.nombre,
        consultor.email,
        compList.length.toString(),
        pltList.length.toString(),
        prList.length.toString(),
        completitudProm,
        consultorOpps.length.toString(),
        pipelineAnual.toFixed(2)
      ];
    });

    downloadCSV("Auditoria_Completitud_Consultores.csv", headers, rows);
  };

  // --- ANALYTICS CHART DATA ---

  // Pipeline by Area
  const pipelineByAreaMap: Record<string, number> = {};
  oportunidades.forEach(opp => {
    let areaNombre = "Área de Extrusión";
    if (opp.tipo !== "equipo_ro3") {
      const pr = prensas.find(p => p.aplicaciones?.some(a => a.id === opp.aplicacionId) || p.id === opp.id.split('-')[1]);
      const app = pr?.aplicaciones?.find(a => a.id === opp.aplicacionId);
      const area = AREAS.find(ar => ar.id === app?.areaId);
      if (area) areaNombre = area.nombre;
    }
    pipelineByAreaMap[areaNombre] = (pipelineByAreaMap[areaNombre] || 0) + (opp.valorPotencialAnual || 0);
  });

  const areaChartData = Object.entries(pipelineByAreaMap).map(([name, value]) => ({
    name: name.replace("Área de ", ""),
    valor: value
  })).sort((a, b) => b.valor - a.valor);

  // Pipeline by Company
  const pipelineByCompanyMap: Record<string, number> = {};
  oportunidades.forEach(opp => {
    const plt = plantas.find(p => p.id === opp.plantaId);
    const emp = empresas.find(e => e.id === plt?.empresaId);
    const nombre = emp?.nombreComercial || "Otros";
    pipelineByCompanyMap[nombre] = (pipelineByCompanyMap[nombre] || 0) + (opp.valorPotencialAnual || 0);
  });

  const companyChartData = Object.entries(pipelineByCompanyMap).map(([name, value]) => ({
    name: name.length > 18 ? name.slice(0, 16) + "..." : name,
    valor: value
  })).sort((a, b) => b.valor - a.valor).slice(0, 5);

  const COLORS = ['#CC0000', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Reportes y Análisis</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Módulo de inteligencia de mercado, auditoría de captura y exportación de reportes ejecutivos
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="kpi-card animate-fade-in" style={{ animationDelay: "0ms" }}>
          <div style={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(204,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <TrendingUp size={17} color="var(--interlub-red)" />
          </div>
          <p className="kpi-value" style={{ fontSize: "1.35rem" }}>{formatCurrency(totalPipeline)}</p>
          <p className="kpi-label">Pipeline Anual Oportunidades</p>
        </div>
        <div className="kpi-card animate-fade-in" style={{ animationDelay: "60ms" }}>
          <div style={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <Building2 size={17} color="#3B82F6" />
          </div>
          <p className="kpi-value" style={{ fontSize: "1.35rem" }}>{companiesWithOpps}</p>
          <p className="kpi-label">Clientes con Brechas Activas</p>
        </div>
        <div className="kpi-card animate-fade-in" style={{ animationDelay: "120ms" }}>
          <div style={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <CheckCircle2 size={17} color="var(--accent-green)" />
          </div>
          <p className="kpi-value" style={{ fontSize: "1.35rem" }}>{formatPercent(avgWalletCapture)}</p>
          <p className="kpi-label">Wallet Capture Promedio</p>
        </div>
        <div className="kpi-card animate-fade-in" style={{ animationDelay: "180ms" }}>
          <div style={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <UserCheck size={17} color="var(--accent-amber)" />
          </div>
          <p className="kpi-value" style={{ fontSize: "1.35rem" }}>{formatPercent(avgCompletitud)}</p>
          <p className="kpi-label">Completitud Captura Promedio</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--bg-border)", paddingBottom: "1px", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("downloads")}
          className="flex items-center gap-1.5"
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none",
            borderBottom: activeTab === "downloads" ? "2px solid var(--interlub-red)" : "2px solid transparent",
            color: activeTab === "downloads" ? "var(--text-primary)" : "var(--text-muted)",
            fontWeight: activeTab === "downloads" ? 700 : 500, cursor: "pointer", transition: "all 0.15s", fontSize: "0.85rem"
          }}
        >
          <FileText size={15} /> Descarga de Reportes
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className="flex items-center gap-1.5"
          style={{
            padding: "0.75rem 1.25rem", background: "none", border: "none",
            borderBottom: activeTab === "analytics" ? "2px solid var(--interlub-red)" : "2px solid transparent",
            color: activeTab === "analytics" ? "var(--text-primary)" : "var(--text-muted)",
            fontWeight: activeTab === "analytics" ? 700 : 500, cursor: "pointer", transition: "all 0.15s", fontSize: "0.85rem"
          }}
        >
          <BarChart3 size={15} /> Análisis Gráfico
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "downloads" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {/* Card 1: Oportunidades */}
          <div className="interlub-card flex flex-col justify-between" style={{ padding: "1.5rem" }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(204,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <TrendingUp size={20} color="var(--interlub-red)" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem" }}>Pipeline de Oportunidades</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.775rem", lineHeight: 1.4, marginBottom: "1rem" }}>
                Listado exhaustivo de todas las brechas detectadas (lubricadas por competencia o sin lubricar) por planta, prensa y área, con sus respectivos potenciales en USD y prioridades.
              </p>
              <div style={{ background: "var(--bg-elevated)", padding: "0.625rem", borderRadius: "8px", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Columnas clave</span>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Empresa, HubSpot ID, Planta, Prensa, Área, Tipo, Potencial Anual, Prioridad
                </p>
              </div>
            </div>
            <button className="btn-primary w-full" onClick={exportPipelineReport} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem" }}>
              <Download size={14} /> Descargar CSV
            </button>
          </div>

          {/* Card 2: Wallet Capture */}
          <div className="interlub-card flex flex-col justify-between" style={{ padding: "1.5rem" }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <PieChartIcon size={20} color="var(--accent-green)" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem" }}>Wallet Capture por Cuenta</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.775rem", lineHeight: 1.4, marginBottom: "1rem" }}>
                Análisis por cliente que cruza el potencial captado por Interlub contra el potencial total anual detectado, calculando la penetración de cartera actual en porcentaje.
              </p>
              <div style={{ background: "var(--bg-elevated)", padding: "0.625rem", borderRadius: "8px", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Columnas clave</span>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Empresa, HubSpot ID, Tipo, Prensas, Captado (USD), Pendiente (USD), Wallet Capture %
                </p>
              </div>
            </div>
            <button className="btn-primary w-full" onClick={exportWalletCaptureReport} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem" }}>
              <Download size={14} /> Descargar CSV
            </button>
          </div>

          {/* Card 3: Auditoría de Captura */}
          <div className="interlub-card flex flex-col justify-between" style={{ padding: "1.5rem" }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <UserCheck size={20} color="var(--accent-amber)" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem" }}>Auditoría de Consultores</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.775rem", lineHeight: 1.4, marginBottom: "1rem" }}>
                Reporte de control interno para medir la completitud técnica de las plantas y prensas asignadas a cada consultor, indicando el número de brechas y pipeline anual detectado.
              </p>
              <div style={{ background: "var(--bg-elevated)", padding: "0.625rem", borderRadius: "8px", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Columnas clave</span>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Consultor, Email, Cuentas, Plantas Mapeadas, Completitud Promedio %, Pipeline Detectado
                </p>
              </div>
            </div>
            <button className="btn-primary w-full" onClick={exportAuditReport} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem" }}>
              <Download size={14} /> Descargar CSV
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Chart 1: Pipeline por Área Técnica */}
          <div className="interlub-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1.25rem" }}>Pipeline Anual por Área Técnica</h3>
            <div style={{ width: "100%", height: 300 }}>
              {areaChartData.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                  <AlertCircle size={24} style={{ marginBottom: "0.5rem" }} />
                  <p style={{ fontSize: "0.825rem" }}>No hay oportunidades registradas para graficar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areaChartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bg-border)" />
                    <XAxis type="number" stroke="var(--text-muted)" tickFormatter={(v) => `$${v/1000}k`} style={{ fontSize: "0.75rem" }} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" style={{ fontSize: "0.72rem" }} width={90} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), "Pipeline Anual"]}
                      contentStyle={{ background: "var(--bg-elevated)", borderColor: "var(--bg-border)", borderRadius: "8px", color: "var(--text-primary)" }}
                    />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                      {areaChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Top Cuentas por Pipeline */}
          <div className="interlub-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1.25rem" }}>Top 5 Cuentas por Pipeline Anual</h3>
            <div style={{ width: "100%", height: 300 }}>
              {companyChartData.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                  <AlertCircle size={24} style={{ marginBottom: "0.5rem" }} />
                  <p style={{ fontSize: "0.825rem" }}>No hay oportunidades registradas para graficar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-border)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: "0.75rem" }} angle={-15} textAnchor="end" />
                    <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `$${v/1000}k`} style={{ fontSize: "0.75rem" }} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), "Pipeline Anual"]}
                      contentStyle={{ background: "var(--bg-elevated)", borderColor: "var(--bg-border)", borderRadius: "8px", color: "var(--text-primary)" }}
                    />
                    <Bar dataKey="valor" fill="var(--interlub-red)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

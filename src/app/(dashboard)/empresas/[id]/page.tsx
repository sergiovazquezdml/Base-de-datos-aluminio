"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { useAuth, useRole } from "@/lib/auth-context";
import { AREAS } from "@/lib/data";
import { fetchHubSpotCompany } from "@/lib/hubspot-mock";
import { statusColors, statusLabels, formatCurrency, formatPercent } from "@/lib/utils";
import {
  Building2, ChevronRight, Factory, MapPin,
  Plus, Edit, Wrench, TrendingUp, Lightbulb, FileText, CheckCircle2,
  AlertTriangle, Clock, X, Save
} from "lucide-react";

export default function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { empresas, plantas, prensas, oportunidades, addPlanta, updateEmpresa, usuarios } = useStore();
  const { user } = useAuth();
  const role = useRole();
  const isSpecialAdmin = user?.email?.toLowerCase() === "sergio.vazquez@interlub.com" || role === "direccion";

  const empresa = empresas.find((e) => e.id === id);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [nombrePlanta, setNombrePlanta] = useState("");
  const [paisPlanta, setPaisPlanta] = useState("México");
  const [direccionPlanta, setDireccionPlanta] = useState("");
  const [notasPlanta, setNotasPlanta] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["area-1", "area-2", "area-3", "area-4", "area-5", "area-6"]);
  const [modalError, setModalError] = useState("");

  // Edit Empresa Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombreComercial, setEditNombreComercial] = useState("");
  const [editRazonSocial, setEditRazonSocial] = useState("");
  const [editPais, setEditPais] = useState("México");
  const [editCiudadEstado, setEditCiudadEstado] = useState("");
  const [editTipo, setEditTipo] = useState<"cliente_activo" | "prospecto" | "ex_cliente">("prospecto");
  const [editHubspotId, setEditHubspotId] = useState("");
  const [editConsultorId, setEditConsultorId] = useState("");
  const [editError, setEditError] = useState("");
  const [isFetchingHubSpot, setIsFetchingHubSpot] = useState(false);

  const handleImportHubSpot = async () => {
    if (!editHubspotId.trim()) return;
    setEditError("");
    setIsFetchingHubSpot(true);
    try {
      const data = await fetchHubSpotCompany(editHubspotId);
      if (data) {
        setEditNombreComercial(data.nombreComercial);
        setEditRazonSocial(data.razonSocial || "");
        setEditPais(data.pais);
        setEditCiudadEstado(data.ciudadEstado);
        setEditHubspotId(data.hubspotId);
      } else {
        setEditError("No se pudo obtener información de esa empresa de HubSpot. Verifique el enlace o ID.");
      }
    } catch (err: any) {
      setEditError(err.message || "Error al conectar con HubSpot.");
    } finally {
      setIsFetchingHubSpot(false);
    }
  };

  if (!empresa) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <Building2 size={48} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.4 }} />
        <h2 style={{ marginBottom: "0.5rem" }}>Empresa no encontrada</h2>
        <Link href="/empresas"><button className="btn-ghost">← Volver a Empresas</button></Link>
      </div>
    );
  }

  const empresaPlantas = plantas.filter((p) => p.empresaId === empresa.id);
  
  const prensasTotal = empresaPlantas.reduce((acc, p) => {
    return acc + prensas.filter(pr => pr.plantaId === p.id).length;
  }, 0);

  const completitudProm = empresaPlantas.length > 0
    ? Math.round(empresaPlantas.reduce((a, p) => a + p.pctCompletitud, 0) / empresaPlantas.length)
    : 0;

  // Filter opportunities related to this company's plants
  const empresaOpps = oportunidades.filter(o => {
    const p = plantas.find(plt => plt.id === o.plantaId);
    return p?.empresaId === empresa.id;
  });

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!nombrePlanta.trim()) {
      setModalError("El nombre de la planta es obligatorio.");
      return;
    }

    addPlanta({
      empresaId: empresa.id,
      nombre: nombrePlanta.trim(),
      pais: paisPlanta,
      ciudadDireccion: direccionPlanta.trim(),
      numPrensas: 0,
      areasPresentes: selectedAreas,
      notasGenerales: notasPlanta.trim(),
    });

    // Reset Form & Close Modal
    setNombrePlanta("");
    setDireccionPlanta("");
    setNotasPlanta("");
    setSelectedAreas(["area-1", "area-2", "area-3", "area-4", "area-5", "area-6"]);
    setShowModal(false);
  };

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const openEditModal = () => {
    if (!empresa) return;
    setEditNombreComercial(empresa.nombreComercial || "");
    setEditRazonSocial(empresa.razonSocial || "");
    setEditPais(empresa.pais || "México");
    setEditCiudadEstado(empresa.ciudadEstado || "");
    setEditTipo(empresa.tipo);
    setEditHubspotId(empresa.hubspotId || "");
    setEditConsultorId(empresa.consultorId || "");
    setEditError("");
    setShowEditModal(true);
  };

  const handleEditEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editNombreComercial.trim()) {
      setEditError("El nombre comercial es obligatorio.");
      return;
    }

    try {
      await updateEmpresa(empresa.id, {
        nombreComercial: editNombreComercial.trim(),
        razonSocial: editRazonSocial.trim() || undefined,
        pais: editPais,
        ciudadEstado: editCiudadEstado.trim(),
        tipo: editTipo,
        hubspotId: editHubspotId.trim() || undefined,
        consultorId: editConsultorId || undefined,
      });
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err.message || "Error al actualizar la empresa.");
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <Link href="/empresas" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Building2 size={13} /> Empresas
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--text-primary)" }}>{empresa.nombreComercial}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div style={{
            width: 56, height: 56, borderRadius: "14px",
            background: "linear-gradient(135deg, var(--interlub-red) 0%, #8B5CF6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem", fontWeight: 800, color: "white", flexShrink: 0
          }}>
            {empresa.nombreComercial.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{empresa.nombreComercial}</h1>
              <span className={`status-badge ${statusColors[empresa.tipo as keyof typeof statusColors]}`}>
                {statusLabels[empresa.tipo]}
              </span>
            </div>
            {empresa.razonSocial && empresa.razonSocial !== empresa.nombreComercial ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{empresa.razonSocial}</p>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontStyle: "italic" }}>
                {empresa.pais && empresa.pais !== "México" ? "Cliente Internacional / Sin Razón Social registrada" : "Sin Razón Social de México"}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {empresa.pais && (
                <span className="flex items-center gap-1" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <MapPin size={12} /> {empresa.pais}{empresa.ciudadEstado ? `, ${empresa.ciudadEstado}` : ""}
                </span>
              )}

            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role !== "consultor" && (
            <button className="btn-ghost" onClick={openEditModal} style={{ fontSize: "0.8rem", padding: "0.4rem 0.875rem" }}>
              <Edit size={14} /> Editar
            </button>
          )}
          <button className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.4rem 0.875rem" }}>
            <FileText size={14} /> Exportar PDF
          </button>
          {role !== "consultor" && (
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: "0.8rem", padding: "0.4rem 0.875rem" }}>
              <Plus size={14} /> Nueva Planta
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Plantas", value: empresaPlantas.length.toString(), icon: Factory, color: "#3B82F6" },
          { label: "Prensas", value: prensasTotal.toString(), icon: Wrench, color: "var(--accent-amber)" },
          { label: "Completitud", value: formatPercent(completitudProm), icon: TrendingUp, color: completitudProm >= 80 ? "var(--accent-green)" : "var(--accent-amber)" },
          { label: "Oportunidades", value: empresaOpps.length.toString(), icon: Lightbulb, color: "var(--accent-green)" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="kpi-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{
              width: 36, height: 36, borderRadius: "9px",
              background: `${color}18`, display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: "0.75rem"
            }}>
              <Icon size={17} color={color} />
            </div>
            <p className="kpi-value" style={{ fontSize: "1.5rem" }}>{value}</p>
            <p className="kpi-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1rem", alignItems: "start" }}>
        {/* Left: Plantas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Plantas ({empresaPlantas.length})
            </h2>
            {role !== "consultor" && (
              <button className="btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: "0.775rem", padding: "0.35rem 0.75rem" }}>
                <Plus size={13} /> Agregar Planta
              </button>
            )}
          </div>

          {empresaPlantas.length === 0 && (
            <div className="interlub-card" style={{ padding: "3rem", textAlign: "center" }}>
              <Factory size={40} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.3 }} />
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Esta empresa no tiene plantas registradas aún</p>
              {role !== "consultor" && (
                <button className="btn-primary" onClick={() => setShowModal(true)}>Registrar Primera Planta</button>
              )}
            </div>
          )}

          {empresaPlantas.map((planta, i) => {
            const plantPrensas = prensas.filter(pr => pr.plantaId === planta.id);
            const fillClass = planta.pctCompletitud >= 80 ? "green" : planta.pctCompletitud >= 40 ? "amber" : "red";
            const statusIcon = planta.estadoCaptura === "completa" ? CheckCircle2 :
                               planta.estadoCaptura === "en_progreso" ? Clock : AlertTriangle;
            const StatusIcon = statusIcon;
            const iconColor = planta.estadoCaptura === "completa" ? "var(--accent-green)" :
                              planta.estadoCaptura === "en_progreso" ? "var(--accent-amber)" : "var(--text-muted)";

            return (
              <div key={planta.id} className="interlub-card animate-fade-in" style={{ padding: "1.25rem", marginBottom: "0.875rem", animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2">
                    <StatusIcon size={16} color={iconColor} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{planta.nombre}</h3>
                      {planta.ciudadDireccion && (
                        <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          <MapPin size={11} style={{ display: "inline", marginRight: "3px" }} />
                          {planta.ciudadDireccion.length > 60 ? planta.ciudadDireccion.slice(0, 60) + "..." : planta.ciudadDireccion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${statusColors[planta.estadoCaptura as keyof typeof statusColors]}`}>
                      {statusLabels[planta.estadoCaptura]}
                    </span>
                    <Link href={`/plantas/${planta.id}`}>
                      <button className="btn-ghost" style={{ padding: "0.25rem 0.625rem", fontSize: "0.775rem" }}>
                        Ver detalle <ChevronRight size={12} />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: "0.875rem" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Completitud de captura
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{formatPercent(planta.pctCompletitud)}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${planta.pctCompletitud}%` }} />
                  </div>
                </div>

                {/* Prensas mini list */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                    <Wrench size={12} style={{ display: "inline", marginRight: "3px" }} />
                    {plantPrensas.length} prensa{plantPrensas.length !== 1 ? "s" : ""}
                  </span>
                  {plantPrensas.slice(0, 4).map(pr => (
                    <span key={pr.id} style={{
                      background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
                      borderRadius: "5px", padding: "0.15rem 0.5rem",
                      fontSize: "0.72rem", color: "var(--text-secondary)"
                    }}>
                      {pr.nombreInterno.split("—")[0].trim()}
                    </span>
                  ))}
                  {plantPrensas.length > 4 && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{plantPrensas.length - 4} más</span>
                  )}
                </div>

                {planta.notasGenerales && (
                  <p style={{ marginTop: "0.75rem", fontSize: "0.775rem", color: "var(--text-secondary)", fontStyle: "italic", borderTop: "1px solid var(--bg-border)", paddingTop: "0.625rem" }}>
                    {planta.notasGenerales}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Info + Oportunidades */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* HubSpot Integration */}
          {empresa.hubspotId && (
            <div className="interlub-card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.825rem", fontWeight: 700, marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Integración CRM
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div style={{ padding: "0.5rem", background: "var(--bg-elevated)", borderRadius: "7px" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>HubSpot ID</p>
                  <p style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>{empresa.hubspotId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Oportunidades */}
          <div className="interlub-card" style={{ padding: "1.25rem" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: "0.825rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Oportunidades
              </h3>
              <span style={{
                background: "rgba(204,0,0,0.12)", color: "var(--interlub-red)",
                border: "1px solid rgba(204,0,0,0.2)", borderRadius: "5px",
                fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem"
              }}>
                {empresaOpps.length}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {empresaOpps.length === 0 ? (
                <p style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>No se han detectado oportunidades en esta cuenta.</p>
              ) : (
                empresaOpps.map((opp) => (
                  <div key={opp.id} className="opp-card" style={{ background: "var(--bg-secondary)", border: "1px solid var(--bg-border)", borderRadius: "8px", padding: "0.75rem" }}>
                    <div className="flex items-start gap-2">
                      <Lightbulb size={13} color="var(--accent-amber)" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span className={`status-badge ${statusColors[opp.tipo as keyof typeof statusColors]}`} style={{ marginBottom: "0.25rem" }}>
                          {statusLabels[opp.tipo]}
                        </span>
                        <p style={{ fontSize: "0.775rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "0.25rem" }}>
                          {opp.tipo === "equipo_ro3" ? "Oportunidad de automatización RO3" : "Oportunidad de producto"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          Planta: {opp.planta?.nombre}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: 600, marginTop: "0.25rem" }}>
                          +{formatCurrency(opp.valorPotencialMensual || 0)}/mes
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD PLANT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="interlub-card animate-fade-in" style={{ width: "90%", maxWidth: 600, padding: "1.5rem", position: "relative", zIndex: 60 }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Agregar Nueva Planta</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "0.5rem 0.75rem", color: "#EF4444", fontSize: "0.75rem", marginBottom: "1rem" }}>
                {modalError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleAddPlant} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Nombre de la Planta <span style={{ color: "var(--interlub-red)" }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="Ej: Planta Monterrey Norte"
                  value={nombrePlanta}
                  onChange={e => setNombrePlanta(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">País</label>
                  <select className="form-input" value={paisPlanta} onChange={e => setPaisPlanta(e.target.value)}>
                    <option value="México">México</option>
                    <option value="India">India</option>
                    <option value="Emiratos Árabes">Emiratos Árabes</option>
                    <option value="Australia">Australia</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Dirección / Ubicación</label>
                  <input
                    className="form-input"
                    placeholder="Calle, Parque Industrial, Ciudad"
                    value={direccionPlanta}
                    onChange={e => setDireccionPlanta(e.target.value)}
                  />
                </div>
              </div>

              {/* Areas checklist */}
              <div>
                <label className="form-label" style={{ marginBottom: "0.5rem" }}>Áreas Presentes en Planta</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--bg-border)" }}>
                  {AREAS.map(area => (
                    <label key={area.id} className="flex items-center gap-2" style={{ cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area.id)}
                        onChange={() => toggleArea(area.id)}
                        style={{ accentColor: "var(--interlub-red)", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.775rem", color: selectedAreas.includes(area.id) ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {area.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Notas Generales / Comentarios</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Información relevante sobre turnos, logística o planes futuros..."
                  value={notasPlanta}
                  onChange={e => setNotasPlanta(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)} style={{ padding: "0.5rem 1rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                  <Save size={14} /> Registrar Planta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT EMPRESA MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="interlub-card animate-fade-in" style={{ width: "90%", maxWidth: 600, padding: "1.5rem", position: "relative", zIndex: 60 }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Editar Datos de Empresa</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "0.5rem 0.75rem", color: "#EF4444", fontSize: "0.75rem", marginBottom: "1rem" }}>
                {editError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleEditEmpresa} className="flex flex-col gap-4">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Nombre Comercial <span style={{ color: "var(--interlub-red)" }}>*</span></label>
                  <input
                    className="form-input"
                    placeholder="Ej: Aluminios Monterrey"
                    value={editNombreComercial}
                    onChange={e => setEditNombreComercial(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Razón Social <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 400 }}>(Opcional)</span></label>
                  <input
                    className="form-input"
                    placeholder="Ej: Aluminios Monterrey SA de CV"
                    value={editRazonSocial}
                    onChange={e => setEditRazonSocial(e.target.value)}
                  />
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Dejar vacío si es cliente internacional o sin razón social.
                  </p>
                </div>
                <div>
                  <label className="form-label">Tipo de Cuenta</label>
                  <select className="form-input" value={editTipo} onChange={e => setEditTipo(e.target.value as any)}>
                    <option value="prospecto">Prospecto</option>
                    <option value="cliente_activo">Cliente Activo</option>
                    <option value="ex_cliente">Ex-cliente</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">País</label>
                  <select className="form-input" value={editPais} onChange={e => setEditPais(e.target.value)}>
                    <option value="México">México</option>
                    <option value="India">India</option>
                    <option value="Emiratos Árabes">Emiratos Árabes</option>
                    <option value="Australia">Australia</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Alemania">Alemania</option>
                    <option value="España">España</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Ciudad / Estado</label>
                  <input
                    className="form-input"
                    placeholder="Ej: Monterrey, NL"
                    value={editCiudadEstado}
                    onChange={e => setEditCiudadEstado(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Consultor Asignado</label>
                  {isSpecialAdmin ? (
                    <select className="form-input" value={editConsultorId} onChange={e => setEditConsultorId(e.target.value)}>
                      <option value="">— Seleccionar Consultor —</option>
                      {usuarios.filter(u => 
                        (u.rol === "consultor" || 
                         u.email?.toLowerCase() === "mrodino@interlub.com" || 
                         u.email?.toLowerCase() === "sergio.vazquez@interlub.com") && 
                        u.activo
                      ).map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type="text"
                      disabled
                      value={usuarios.find(u => u.id === editConsultorId)?.nombre || "— Sin Asignar —"}
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", cursor: "not-allowed" }}
                    />
                  )}
                </div>
                <div>
                  <label className="form-label">Integración con HubSpot (ID o Enlace de Empresa)</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="form-input"
                      placeholder="Ej: 938202 o enlace completo"
                      value={editHubspotId}
                      onChange={e => setEditHubspotId(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleImportHubSpot}
                      className="btn-ghost"
                      style={{
                        padding: "0.5rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        border: "1px solid var(--bg-border)",
                        whiteSpace: "nowrap",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                      disabled={isFetchingHubSpot || !editHubspotId.trim()}
                    >
                      {isFetchingHubSpot ? "Obteniendo..." : "🔌 Importar"}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Puedes pegar el ID de HubSpot o la URL completa de la empresa para auto-completar el formulario. Try <b>938202</b> for a demo.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowEditModal(false)} style={{ padding: "0.5rem 1rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                  <Save size={14} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

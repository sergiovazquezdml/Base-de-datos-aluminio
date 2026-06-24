"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { useAuth, useRole } from "@/lib/auth-context";
import { fetchHubSpotCompany } from "@/lib/hubspot-mock";

import { ArrowLeft, Building2, Save, MapPin, User, Mail, Phone, Globe } from "lucide-react";

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const { addEmpresa, usuarios } = useStore();
  const { user } = useAuth();
  const role = useRole();
  const isSpecialAdmin = user?.email?.toLowerCase() === "sergio.vazquez@interlub.com" || role === "direccion";

  if (role === "consultor") {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <Building2 size={48} style={{ margin: "0 auto 1rem", color: "var(--interlub-red)", opacity: 0.8 }} />
        <h2 style={{ marginBottom: "0.5rem" }}>Acceso Denegado</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Únicamente los administradores pueden registrar nuevas empresas.</p>
        <Link href="/empresas"><button className="btn-ghost">← Volver a Empresas</button></Link>
      </div>
    );
  }

  const [nombreComercial, setNombreComercial] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [pais, setPais] = useState("México");
  const [ciudadEstado, setCiudadEstado] = useState("");
  const [tipo, setTipo] = useState<"cliente_activo" | "prospecto" | "ex_cliente">("prospecto");

  const [hubspotId, setHubspotId] = useState("");
  const [consultorId, setConsultorId] = useState("");
  const [error, setError] = useState("");
  const [isFetchingHubSpot, setIsFetchingHubSpot] = useState(false);

  const consultants = usuarios.filter(u => 
    (u.rol === "consultor" || 
     u.email?.toLowerCase() === "mrodino@interlub.com" || 
     u.email?.toLowerCase() === "sergio.vazquez@interlub.com") && 
    u.activo
  );

  const handleImportHubSpot = async () => {
    if (!hubspotId.trim()) return;
    setError("");
    setIsFetchingHubSpot(true);
    try {
      const data = await fetchHubSpotCompany(hubspotId);
      if (data) {
        setNombreComercial(data.nombreComercial);
        setRazonSocial(data.razonSocial || "");
        setPais(data.pais);
        setCiudadEstado(data.ciudadEstado);
        setHubspotId(data.hubspotId);
      } else {
        setError("No se pudo obtener información de esa empresa de HubSpot. Verifique el enlace o ID.");
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con HubSpot.");
    } finally {
      setIsFetchingHubSpot(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombreComercial.trim()) {
      setError("El nombre comercial es obligatorio.");
      return;
    }

    addEmpresa({
      nombreComercial: nombreComercial.trim(),
      razonSocial: razonSocial.trim() || undefined,
      pais,
      ciudadEstado: ciudadEstado.trim(),
      tipo,
      segmento: "Extrusión de aluminio",

      hubspotId: hubspotId.trim() || undefined,
      consultorId: consultorId || undefined,
    });

    router.push("/empresas");
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/empresas">
          <button className="btn-ghost" style={{ padding: "0.4rem 0.625rem" }}>
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Registrar Nueva Empresa</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.825rem" }}>Agregar un nuevo cliente o prospecto a la cartera de extrusión</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Error message */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#EF4444", fontSize: "0.825rem" }}>
            {error}
          </div>
        )}

        {/* Section 1: General Info */}
        <div className="interlub-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={16} color="var(--interlub-red)" /> Datos Comerciales
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Nombre Comercial <span style={{ color: "var(--interlub-red)" }}>*</span></label>
              <input
                className="form-input"
                placeholder="Ej: Aluminios Monterrey"
                value={nombreComercial}
                onChange={e => setNombreComercial(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Razón Social <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 400 }}>(Opcional)</span></label>
              <input
                className="form-input"
                placeholder="Ej: Aluminios Monterrey SA de CV"
                value={razonSocial}
                onChange={e => setRazonSocial(e.target.value)}
              />
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Dejar vacío si es un cliente internacional o no cuenta con razón social registrada en México.
              </p>
            </div>
            <div>
              <label className="form-label">Tipo de Cuenta</label>
              <select className="form-input" value={tipo} onChange={e => setTipo(e.target.value as any)}>
                <option value="prospecto">Prospecto</option>
                <option value="cliente_activo">Cliente Activo</option>
                <option value="ex_cliente">Ex-cliente</option>
              </select>
            </div>
            <div>
              <label className="form-label">País</label>
              <select className="form-input" value={pais} onChange={e => setPais(e.target.value)}>
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
                value={ciudadEstado}
                onChange={e => setCiudadEstado(e.target.value)}
              />
            </div>
          </div>
        </div>



        {/* Section 3: Admin / CRM Info */}
        <div className="interlub-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Globe size={16} color="var(--interlub-red)" /> Asignación e Integración
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Consultor Asignado</label>
              <select 
                className="form-input" 
                value={consultorId} 
                onChange={e => setConsultorId(e.target.value)}
                disabled={!isSpecialAdmin}
                style={!isSpecialAdmin ? { background: "var(--bg-elevated)", color: "var(--text-secondary)", cursor: "not-allowed" } : undefined}
              >
                <option value="">— Sin Asignar (Solo Admin) —</option>
                {consultants.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Integración con HubSpot (ID o Enlace de Empresa)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="form-input"
                  placeholder="Ej: 938202 o enlace completo"
                  value={hubspotId}
                  onChange={e => setHubspotId(e.target.value)}
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
                  disabled={isFetchingHubSpot || !hubspotId.trim()}
                >
                  {isFetchingHubSpot ? "Obteniendo..." : "🔌 Importar"}
                </button>
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Puedes pegar el ID de HubSpot o la URL completa de la empresa para auto-completar el formulario. Try <b>938202</b> for a demo.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 justify-end mt-2">
          <Link href="/empresas">
            <button type="button" className="btn-ghost" style={{ padding: "0.6rem 1.25rem" }}>
              Cancelar
            </button>
          </Link>
          <button type="submit" className="btn-primary" style={{ padding: "0.6rem 1.25rem" }}>
            <Save size={16} /> Registrar Empresa
          </button>
        </div>
      </form>
    </div>
  );
}

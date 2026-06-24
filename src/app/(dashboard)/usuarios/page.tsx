"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { statusColors, statusLabels } from "@/lib/utils";
import { Users, Plus, Edit, Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function UsuariosPage() {
  const { usuarios } = useStore();
  const [showModal, setShowModal] = useState(false);

  const roleColors: Record<string, string> = {
    direccion: "bg-red-500/15 text-red-400 border-red-500/30",
    coordinador: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    consultor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Gestión de Usuarios</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{usuarios.length} usuarios en la plataforma</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Nuevo Usuario
        </button>
      </div>

      {/* Permission matrix */}
      <div className="interlub-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} color="var(--interlub-red)" />
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700 }}>Matriz de Permisos por Rol</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="interlub-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Permiso</th>
                <th style={{ color: "#CC0000", textAlign: "center" }}>Dirección</th>
                <th style={{ color: "#8B5CF6", textAlign: "center" }}>Coordinador</th>
                <th style={{ color: "#3B82F6", textAlign: "center" }}>Consultor</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Ver todas las empresas", true, "solo región", false],
                ["Crear empresa", true, true, true],
                ["Editar empresa", true, true, "solo asignadas"],
                ["Eliminar empresa", true, false, false],
                ["Gestionar usuarios", true, false, false],
                ["Configurar reglas de negocio", true, false, false],
                ["Exportar reportes globales", true, true, false],
                ["Ver dashboards globales", true, false, false],
                ["Ver auditoría", true, false, false],
              ].map(([perm, dir, coord, consul]) => (
                <tr key={String(perm)}>
                  <td style={{ fontWeight: 500, fontSize: "0.8rem" }}>{String(perm)}</td>
                  {[dir, coord, consul].map((v, i) => (
                    <td key={i} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {v === true
                          ? <CheckCircle2 size={15} color="var(--accent-green)" />
                          : v === false
                          ? <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>—</span>
                          : <span style={{ fontSize: "0.72rem", color: "var(--accent-amber)", background: "rgba(245,158,11,0.1)", borderRadius: "4px", padding: "0.1rem 0.375rem" }}>{String(v)}</span>
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users table */}
      <div className="interlub-card" style={{ overflow: "hidden" }}>
        <table className="interlub-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th className="hide-on-laptop">Correo</th>
              <th className="hide-on-tablet">Rol</th>
              <th>Estado</th>
              <th className="hide-on-laptop-large">Último acceso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <td>
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${u.rol === "direccion" ? "var(--interlub-red)" : u.rol === "coordinador" ? "#8B5CF6" : "#3B82F6"}, #1A1A2E)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", fontWeight: 700, color: "white", flexShrink: 0
                    }}>
                      {u.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{u.nombre}</span>
                  </div>
                </td>
                <td className="hide-on-laptop" style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>{u.email}</td>
                <td className="hide-on-tablet">
                  <span className={`status-badge ${roleColors[u.rol]}`}>
                    <Shield size={10} /> {statusLabels[u.rol]}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${u.activo ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="hide-on-laptop-large" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("es-MX") : "—"}
                </td>
                <td>
                  <button className="btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                    <Edit size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

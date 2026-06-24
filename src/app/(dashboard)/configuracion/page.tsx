"use client";

import { useStore } from "@/lib/store-context";
import { useRole } from "@/lib/auth-context";
import { Terminal, Shield } from "lucide-react";

export default function ConfiguracionPage() {
  const { logs } = useStore();
  const role = useRole();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Configuración del Sistema</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Log de auditoría y transacciones históricas</p>
        </div>
      </div>

      {/* AUDIT LOGS VIEW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Log de Transacciones de Auditoría</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rol actual: {role}</span>
        </div>

        <div className="interlub-card" style={{ overflow: "hidden" }}>
          <table className="interlub-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Operación</th>
                <th className="hide-on-tablet">Módulo</th>
                <th className="hide-on-laptop">Detalles</th>
                <th className="hide-on-laptop-large">Dirección IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(log.fecha).toLocaleString("es-MX")}
                  </td>
                  <td>
                    <div>
                      <p style={{ fontSize: "0.825rem", fontWeight: 600 }}>{log.usuario}</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{log.rol}</p>
                    </div>
                  </td>
                  <td style={{ fontSize: "0.8rem", fontWeight: 500 }}>{log.accion}</td>
                  <td className="hide-on-tablet" style={{ fontSize: "0.8rem" }}>
                    <span className="status-badge" style={{ background: "rgba(59,130,246,0.08)", color: "#3B82F6", borderColor: "rgba(59,130,246,0.15)" }}>
                      {log.entidad}
                    </span>
                  </td>
                  <td className="hide-on-laptop" style={{ fontSize: "0.775rem", color: "var(--text-secondary)", maxWidth: "350px", wordBreak: "break-all" }}>
                    {log.detalles}
                  </td>
                  <td className="hide-on-laptop-large" style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <Terminal size={36} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
              <p>No hay registros de auditoría aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


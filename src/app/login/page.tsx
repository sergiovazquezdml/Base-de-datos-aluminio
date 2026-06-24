"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }
    setIsLoading(true);
    setError("");
    const ok = await login(email, password);
    if (ok) {
      router.push("/dashboard");
    } else {
      setError("Correo o contraseña incorrectos.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="sidebar-logo-mark" style={{ width: 44, height: 44, background: "none", boxShadow: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/assets/RGB_simbolo_interlub.png" alt="Interlub" style={{ width: 40, height: 40, objectFit: "contain" }} />
          </div>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
              Interlub Group
            </p>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Plataforma de Extrusión
            </h1>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Bienvenido</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Ingresa con tu cuenta corporativa
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="usuario@interlub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label">Contraseña</label>
              <button
                type="button"
                style={{ fontSize: '0.75rem', color: 'var(--interlub-red)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '0.625rem 0.875rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
            }}>
              <AlertCircle size={15} color="#EF4444" style={{ marginTop: '1px', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8rem', color: '#EF4444', lineHeight: 1.4 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.9rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ opacity: 0.8 }}>Iniciando sesión...</span>
            ) : (
              <>
                <LogIn size={16} />
                Iniciar sesión
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}

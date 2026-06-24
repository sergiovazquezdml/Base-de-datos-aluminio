"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import {
  OEMS, PRODUCTOS_INTERLUB, PRODUCTOS_COMPETIDORES,
  CAPACIDADES_PRENSA, DIAMETROS_BILLET
} from "@/lib/data";
import { statusColors, formatPercent } from "@/lib/utils";
import {
  Factory, ChevronRight, ChevronDown,
  CheckCircle2, Clock, AlertCircle, Save, Plus,
  Wrench, Info, X, MapPin, Trash2, Edit
} from "lucide-react";

type SectionStatus = "completed" | "in_progress" | "pending";

const ALLOY_OPTIONS = ["6063", "6061", "6005", "6082", "6105", "6463", "3003", "1050", "1350", "7075"];

function SectionHeader({
  num, title, status, isOpen, onToggle
}: {
  num: number; title: string; status: SectionStatus; isOpen: boolean; onToggle: () => void;
}) {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: "var(--accent-green)", label: "Completa" },
    in_progress: { icon: Clock, color: "var(--accent-amber)", label: "En progreso" },
    pending: { icon: AlertCircle, color: "var(--text-muted)", label: "Pendiente" },
  };
  const { icon: StatusIcon, label } = statusConfig[status];

  return (
    <div className="form-section-header btn-interactive" onClick={onToggle} style={{ userSelect: "none" }}>
      <div className="form-section-title">
        <div style={{
          width: 24, height: 24, borderRadius: "6px",
          background: status === "completed" ? "rgba(34, 197, 94, 0.08)" :
                      status === "in_progress" ? "rgba(204, 0, 0, 0.08)" : "var(--bg-border)",
          border: "1px solid",
          borderColor: status === "completed" ? "var(--accent-green)" :
                       status === "in_progress" ? "var(--interlub-red)" : "var(--bg-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 700, color: status === "completed" ? "var(--accent-green)" :
                                                      status === "in_progress" ? "var(--interlub-red)" : "var(--text-muted)",
          flexShrink: 0
        }}>
          {status === "completed" ? "✓" : num}
        </div>
        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`status-badge ${statusColors[
          status === "completed" ? "completa" : status === "in_progress" ? "en_progreso" : "pendiente"
        ] as string}`}>
          <StatusIcon size={11} /> {label}
        </span>
        <ChevronDown
          size={16}
          color="var(--text-muted)"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </div>
    </div>
  );
}

function FormField({
  label, required, children, hint, tooltip
}: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string; tooltip?: React.ReactNode;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: "relative", zIndex: showTooltip ? 100 : 1 }}>
      <div className="flex items-center gap-1.5 mb-1.5" style={{ position: "relative" }}>
        <label className="form-label" style={{ marginBottom: 0, flex: 1, minWidth: 0, lineHeight: 1.4 }}>
          {label} {required && <span style={{ color: "var(--interlub-red)" }}>*</span>}
        </label>
        {tooltip && (
          <div 
            style={{ display: "inline-block" }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              background: "var(--bg-elevated)", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: 700, color: "var(--text-muted)",
              border: "1px solid var(--bg-border)", cursor: "help"
            }}>
              ?
            </span>
            {showTooltip && (
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: 0,
                width: "350px",
                maxWidth: "calc(100vw - 32px)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
                padding: "0.85rem",
                borderRadius: "8px",
                boxShadow: "var(--shadow-elevated)",
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                lineHeight: "1.45",
                zIndex: 99999,
                pointerEvents: "none",
                whiteSpace: "normal"
              }}>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      {children}
      {hint && <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{hint}</p>}
    </div>
  );
}

function RadioGroup({
  options, value, onChange, disabledOptions = []
}: {
  options: { label: React.ReactNode; value: string }[]; value: string; onChange: (v: string) => void; name: string; disabledOptions?: string[];
}) {
  return (
    <div className="segment-container">
      {options.map((opt) => {
        const isDisabled = disabledOptions.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            className={`segment-option btn-interactive ${value === opt.value ? "active" : ""}`}
            onClick={() => !isDisabled && onChange(opt.value)}
            disabled={isDisabled}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const getFrecuenciaOptions = (num: string) => {
  if (num === "4.1") {
    return [
      "Cada corte",
      "Cada 2 cortes",
      "Cada 3 cortes",
      "Cada 4 cortes",
      "Cada 5 cortes",
      "Cada 6 cortes",
      "Cada 7 cortes",
      "Cada 8 cortes",
      "Cada 9 cortes",
      "Cada 10 cortes"
    ];
  }
  return [
    "Cada ciclo",
    "Cada 2 ciclos",
    "Cada 3 ciclos",
    "Cada 4 ciclos",
    "Cada 5 ciclos",
    "Cada 6 ciclos",
    "Cada 7 ciclos",
    "Cada 8 ciclos",
    "Cada 9 ciclos",
    "Cada 10 ciclos"
  ];
};

const COMPETIDOR_OPTIONS = ["Motul Baraldi (Presezzi)", "Amcol", "Brugarolas", "Castool"];
const DILUCION_OPTIONS = ["Puro", "1:5", "1:10", "1:15", "1:20", "1:30", "1:50", "1:80", "1:100"];

function AplicacionBlock({
  num, titulo, sinonimos, catalogoId, areaId, prensa, onSave,
  productoCompetidorOptions, productoInterlubOptions
}: {
  num: string; titulo: string; sinonimos?: string[]; catalogoId: string; areaId: string; prensa: any;
  onSave: (data: any) => void;
  productoCompetidorOptions: { label: string; value: string }[];
  productoInterlubOptions: { label: string; value: string }[];
}) {
  const existingApp = prensa?.aplicaciones?.find((a: any) => a.catalogoAplicacionId === catalogoId);

  const [estado, setEstado] = useState(existingApp?.estado || "desconocido");
  const [prodComp, setProdComp] = useState(existingApp?.productoCompetidorId || "");
  const [prodInt, setProdInt] = useState(existingApp?.productoInterlubActivoId || "");
  const [metodo, setMetodo] = useState(existingApp?.metodoAplicacion || "manual");
  const [consumo, setConsumo] = useState(existingApp?.consumoEstimado?.toString() || "");
  const [unidad, setUnidad] = useState("ml");
  const [frecuencia, setFrecuencia] = useState(existingApp?.frecuenciaAplicacion || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Frecuencia scale options
  const FRECUENCIA_OPTIONS = getFrecuenciaOptions(num);
  const [freqSelect, setFreqSelect] = useState("");
  const [freqInput, setFreqInput] = useState("");

  // Sync frecuencia state when freqSelect or freqInput changes
  useEffect(() => {
    if (freqSelect === "Otro") {
      setFrecuencia(freqInput);
    } else {
      setFrecuencia(freqSelect);
    }
  }, [freqSelect, freqInput]);

  // Custom states for Section 2 & 3.2
  const [nombreProductoCompManual, setNombreProductoCompManual] = useState(existingApp?.camposEspeciales?.nombre_producto_competencia || "");
  const [proveedorCompManual, setProveedorCompManual] = useState(existingApp?.camposEspeciales?.proveedor_competencia || "");
  const [tipoSistemaAuto, setTipoSistemaAuto] = useState(existingApp?.camposEspeciales?.tipo_sistema_automatico || "");
  const [detalleSistemaAuto, setDetalleSistemaAuto] = useState(existingApp?.camposEspeciales?.detalle_sistema_automatico || "");
  const [cantidadCnc, setCantidadCnc] = useState(existingApp?.camposEspeciales?.cantidad_maquinas_cnc?.toString() || "");

  // Custom states for Dilution
  const [seDiluye, setSeDiluye] = useState<string>(
    existingApp?.camposEspeciales?.se_diluye === true ? "si" :
    existingApp?.camposEspeciales?.se_diluye === false ? "no" : "sin_info"
  );
  const [relacionDilucion, setRelacionDilucion] = useState<string>(existingApp?.camposEspeciales?.relacion_dilucion || "");
  const [validationError, setValidationError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Dropdown states for Competidor and Dilucion
  const [selectedCompetidorDropdown, setSelectedCompetidorDropdown] = useState("");
  const [customCompetidorInput, setCustomCompetidorInput] = useState("");
  const [selectedDilucionDropdown, setSelectedDilucionDropdown] = useState("");
  const [customDilucionInput, setCustomDilucionInput] = useState("");

  const existingAppRef = useRef(existingApp);
  useEffect(() => {
    existingAppRef.current = existingApp;
  }, [existingApp]);

  // Sync competitor states
  useEffect(() => {
    if (selectedCompetidorDropdown === "Otro competidor") {
      setProveedorCompManual(customCompetidorInput);
    } else {
      setProveedorCompManual(selectedCompetidorDropdown);
    }
  }, [selectedCompetidorDropdown, customCompetidorInput]);

  // Sync dilution states
  useEffect(() => {
    if (selectedDilucionDropdown === "Otro") {
      setRelacionDilucion(customDilucionInput);
    } else {
      setRelacionDilucion(selectedDilucionDropdown);
    }
  }, [selectedDilucionDropdown, customDilucionInput]);

  // Reset load flag when press or app changes
  useEffect(() => {
    setHasLoadedData(false);
  }, [prensa?.id, catalogoId]);

  useEffect(() => {
    if (hasLoadedData) return;

    setIsLoaded(false);
    setEstado(existingApp?.estado || "desconocido");
    setProdComp(existingApp?.productoCompetidorId || "");
    setProdInt(existingApp?.productoInterlubActivoId || "");
    setMetodo(existingApp?.metodoAplicacion || "manual");
    setConsumo(existingApp?.consumoEstimado?.toString() || "");
    setUnidad("ml");
    
    // Load frequency
    const freq = existingApp?.frecuenciaAplicacion || "";
    setFrecuencia(freq);
    if (freq === "") {
      setFreqSelect("");
      setFreqInput("");
    } else if (FRECUENCIA_OPTIONS.includes(freq)) {
      setFreqSelect(freq);
      setFreqInput("");
    } else {
      setFreqSelect("Otro");
      setFreqInput(freq);
    }

    setNombreProductoCompManual(existingApp?.camposEspeciales?.nombre_producto_competencia || "");
    
    // Load competitor
    const prov = existingApp?.camposEspeciales?.proveedor_competencia || "";
    setProveedorCompManual(prov);
    if (prov === "") {
      setSelectedCompetidorDropdown("");
      setCustomCompetidorInput("");
    } else if (COMPETIDOR_OPTIONS.includes(prov)) {
      setSelectedCompetidorDropdown(prov);
      setCustomCompetidorInput("");
    } else {
      setSelectedCompetidorDropdown("Otro competidor");
      setCustomCompetidorInput(prov);
    }

    setTipoSistemaAuto(existingApp?.camposEspeciales?.tipo_sistema_automatico || "");
    setDetalleSistemaAuto(existingApp?.camposEspeciales?.detalle_sistema_automatico || "");
    setCantidadCnc(existingApp?.camposEspeciales?.cantidad_maquinas_cnc?.toString() || "");

    setSeDiluye(
      existingApp?.camposEspeciales?.se_diluye === true ? "si" :
      existingApp?.camposEspeciales?.se_diluye === false ? "no" : "sin_info"
    );
    
    // Load dilution
    const dil = existingApp?.camposEspeciales?.relacion_dilucion || "";
    setRelacionDilucion(dil);
    if (dil === "") {
      setSelectedDilucionDropdown("");
      setCustomDilucionInput("");
    } else if (DILUCION_OPTIONS.includes(dil)) {
      setSelectedDilucionDropdown(dil);
      setCustomDilucionInput("");
    } else {
      setSelectedDilucionDropdown("Otro");
      setCustomDilucionInput(dil);
    }

    setValidationError("");

    if (prensa) {
      setHasLoadedData(true);
    }

    const t = setTimeout(() => setIsLoaded(true), 250);
    return () => clearTimeout(t);
  }, [existingApp, prensa?.id, catalogoId, hasLoadedData]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      if ((estado === "lubricada_competencia" || estado === "lubricada_interlub") && seDiluye === "si" && !relacionDilucion.trim()) {
        return;
      }

      const camposEspeciales: Record<string, any> = {
        ...existingAppRef.current?.camposEspeciales
      };

      const hasAutoSystem = num.startsWith("2.") || num === "3.2" || num === "3.3";

      if (num === "6.1") {
        if (cantidadCnc) {
          camposEspeciales.cantidad_maquinas_cnc = Number(cantidadCnc);
        } else {
          delete camposEspeciales.cantidad_maquinas_cnc;
        }
      }

      if (estado === "lubricada_competencia") {
        camposEspeciales.nombre_producto_competencia = nombreProductoCompManual;
        camposEspeciales.proveedor_competencia = proveedorCompManual;
      } else {
        delete camposEspeciales.nombre_producto_competencia;
        delete camposEspeciales.proveedor_competencia;
      }

      if (hasAutoSystem) {
        if (metodo === "automatico") {
          camposEspeciales.tipo_sistema_automatico = tipoSistemaAuto;
          camposEspeciales.detalle_sistema_automatico = detalleSistemaAuto;
        } else {
          delete camposEspeciales.tipo_sistema_automatico;
          delete camposEspeciales.detalle_sistema_automatico;
        }
      }

      if (estado === "lubricada_competencia" || estado === "lubricada_interlub") {
        if (seDiluye === "si") {
          camposEspeciales.se_diluye = true;
          camposEspeciales.relacion_dilucion = relacionDilucion;
        } else if (seDiluye === "no") {
          camposEspeciales.se_diluye = false;
          delete camposEspeciales.relacion_dilucion;
        } else if (seDiluye === "sin_info") {
          camposEspeciales.se_diluye = null;
          delete camposEspeciales.relacion_dilucion;
        } else {
          delete camposEspeciales.se_diluye;
          delete camposEspeciales.relacion_dilucion;
        }
      } else {
        delete camposEspeciales.se_diluye;
        delete camposEspeciales.relacion_dilucion;
      }

      onSave({
        appNum: num,
        catalogoId,
        areaId,
        estado,
        productoCompetidorId: (estado === "lubricada_competencia") ? null : (prodComp || null),
        productoInterlubActivoId: prodInt || null,
        formaAplicacion: '',
        metodoAplicacion: metodo || null,
        consumoEstimado: consumo ? Number(consumo) : undefined,
        consumoUnidad: unidad,
        frecuenciaAplicacion: frecuencia,
        camposEspeciales: Object.keys(camposEspeciales).length > 0 ? camposEspeciales : null
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isLoaded, estado, prodComp, prodInt, metodo, consumo, unidad, frecuencia,
    nombreProductoCompManual, proveedorCompManual, tipoSistemaAuto, detalleSistemaAuto,
    seDiluye, relacionDilucion, cantidadCnc
  ]);

  const handleSave = () => {
    const hasAutoSystem = num.startsWith("2.") || num === "3.2" || num === "3.3";

    if ((estado === "lubricada_competencia" || estado === "lubricada_interlub") && seDiluye === "si" && !relacionDilucion.trim()) {
      setValidationError("La relación de dilución es requerida si se diluye el producto.");
      return;
    }
    setValidationError("");
    
    const camposEspeciales: Record<string, any> = {
      ...existingApp?.camposEspeciales
    };

    if (estado === "lubricada_competencia") {
      camposEspeciales.nombre_producto_competencia = nombreProductoCompManual;
      camposEspeciales.proveedor_competencia = proveedorCompManual;
    } else {
      delete camposEspeciales.nombre_producto_competencia;
      delete camposEspeciales.proveedor_competencia;
    }

    if (hasAutoSystem) {
      if (metodo === "automatico") {
        camposEspeciales.tipo_sistema_automatico = tipoSistemaAuto;
        camposEspeciales.detalle_sistema_automatico = detalleSistemaAuto;
      } else {
        delete camposEspeciales.tipo_sistema_automatico;
        delete camposEspeciales.detalle_sistema_automatico;
      }
    }

    if (num === "6.1") {
      if (cantidadCnc) {
        camposEspeciales.cantidad_maquinas_cnc = Number(cantidadCnc);
      } else {
        delete camposEspeciales.cantidad_maquinas_cnc;
      }
    }

    if (estado === "lubricada_competencia" || estado === "lubricada_interlub") {
      if (seDiluye === "si") {
        camposEspeciales.se_diluye = true;
        camposEspeciales.relacion_dilucion = relacionDilucion;
      } else if (seDiluye === "no") {
        camposEspeciales.se_diluye = false;
        delete camposEspeciales.relacion_dilucion;
      } else if (seDiluye === "sin_info") {
        camposEspeciales.se_diluye = null;
        delete camposEspeciales.relacion_dilucion;
      } else {
        delete camposEspeciales.se_diluye;
        delete camposEspeciales.relacion_dilucion;
      }
    } else {
      delete camposEspeciales.se_diluye;
      delete camposEspeciales.relacion_dilucion;
    }

    onSave({
      appNum: num,
      catalogoId,
      areaId,
      estado,
      productoCompetidorId: (estado === "lubricada_competencia") ? null : (prodComp || null),
      productoInterlubActivoId: prodInt || null,
      formaAplicacion: '',
      metodoAplicacion: metodo || null,
      consumoEstimado: consumo ? Number(consumo) : undefined,
      consumoUnidad: unidad,
      frecuenciaAplicacion: frecuencia,
      camposEspeciales: Object.keys(camposEspeciales).length > 0 ? camposEspeciales : null
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const statusBorders = {
    lubricada_interlub: "border-l-4 border-l-[#CC0000]",
    lubricada_competencia: "border-l-4 border-l-[#F59E0B]",
    sin_lubricar: "border-l-4 border-l-[#666680]",
    desconocido: "border-l-4 border-l-[#252535]",
  };
  const statusBorderClass = statusBorders[estado as keyof typeof statusBorders] || "";
  const isSection2 = num.startsWith("2.");
  const isCorteOSierra = num === "2.1" || num === "2.2" || num === "4.1" || num === "6.1";
  const hasAutoSystem = num.startsWith("2.") || num === "3.2" || num === "3.3";

  return (
    <div 
      className={`interlub-card ${statusBorderClass}`}
      style={{
        background: "var(--bg-secondary)", border: "1px solid var(--bg-border)",
        borderRadius: "10px", padding: "1.25rem", marginBottom: "0.875rem",
        transition: "all 0.2s ease",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div style={{
          background: "rgba(204,0,0,0.08)", border: "1px solid rgba(204,0,0,0.15)",
          borderRadius: "6px", padding: "0.15rem 0.5rem",
          fontSize: "0.7rem", fontWeight: 700, color: "var(--interlub-red)"
        }}>
          {num}
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{titulo}</span>
        {sinonimos && sinonimos.length > 0 && (
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            ({sinonimos.join(" / ")})
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Estado de la Aplicación</label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="segment-container">
              {[
                { label: "Lubricada por Interlub", value: "lubricada_interlub" },
                { label: "Lubricada por Competencia", value: "lubricada_competencia" },
                { label: "Sin lubricar", value: "sin_lubricar" },
                { label: "Desconocido", value: "desconocido" },
              ].map(o => {
                const isSelected = estado !== "desconocido" && estado !== "";
                const isDisabled = isSelected && estado !== o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={`segment-option btn-interactive ${estado === o.value ? "active" : ""}`}
                    onClick={() => !isDisabled && setEstado(o.value)}
                    disabled={isDisabled}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: o.value === "lubricada_interlub" ? "var(--interlub-red)" :
                                  o.value === "lubricada_competencia" ? "var(--accent-amber)" :
                                  o.value === "sin_lubricar" ? "var(--text-secondary)" : "var(--bg-border)"
                    }} />
                    {o.label}
                  </button>
                );
              })}
            </div>
            {estado !== "desconocido" && estado !== "" && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEstado("desconocido")}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}
              >
                Reestablecer
              </button>
            )}
          </div>
        </div>

        {estado === "lubricada_competencia" && (
          <>
            <FormField label="Nombre del producto de la competencia">
              <input 
                className="form-input" 
                value={nombreProductoCompManual} 
                onChange={e => setNombreProductoCompManual(e.target.value)} 
                placeholder="Ej: Lotemp 149..." 
              />
            </FormField>
            <FormField label="Nombre del competidor">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <select
                  className="form-input"
                  value={selectedCompetidorDropdown}
                  onChange={e => setSelectedCompetidorDropdown(e.target.value)}
                >
                  <option value="">— Seleccionar competidor —</option>
                  {COMPETIDOR_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Otro competidor">Otro competidor (especificar)</option>
                </select>
                {selectedCompetidorDropdown === "Otro competidor" && (
                  <input
                    className="form-input"
                    value={customCompetidorInput}
                    onChange={e => setCustomCompetidorInput(e.target.value)}
                    placeholder="Escriba el nombre del competidor..."
                    required
                  />
                )}
              </div>
            </FormField>
          </>
        )}

        {estado === "lubricada_interlub" && (
          <FormField label="Producto de Interlub activo">
            {num.startsWith("3.") ? (
              <select className="form-input" value={prodInt} onChange={e => setProdInt(e.target.value)}>
                <option value="">— Seleccionar producto Interlub —</option>
                <option value="pi-1">Interforge KI-C</option>
                <option value="pi-8">Interforge KI</option>
              </select>
            ) : isCorteOSierra ? (
              <select className="form-input" value={prodInt} onChange={e => setProdInt(e.target.value)}>
                <option value="">— Seleccionar producto Interlub —</option>
                <option value="pi-12">Interoil Cut HT LV</option>
                <option value="pi-13">Interoil Cut HT MV</option>
                <option value="pi-7">Interoil Cut HTV</option>
                <option value="pi-14">Interoil Cut Al</option>
                <option value="pi-15">Interoil Cut HTE</option>
              </select>
            ) : (
              <select className="form-input" value={prodInt} onChange={e => setProdInt(e.target.value)}>
                <option value="">— Seleccionar producto Interlub —</option>
                {productoInterlubOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </FormField>
        )}

        <FormField label="Método de aplicación">
          <RadioGroup
            name={`metodo-${num}`}
            value={metodo}
            onChange={setMetodo}
            options={[
              { label: "Manual", value: "manual" },
              { label: "Automático", value: "automatico" },
              { label: "Semi-automático", value: "semiautomatico" },
            ]}
          />
        </FormField>

        {(estado === "lubricada_competencia" || estado === "lubricada_interlub") && (
          <>
            <FormField label="¿Se diluye el producto?">
              <RadioGroup
                name={`seDiluye-${num}`}
                value={seDiluye}
                onChange={setSeDiluye}
                options={[
                  { label: "Sí", value: "si" },
                  { label: "No", value: "no" },
                  { label: "Sin información", value: "sin_info" },
                ]}
              />
            </FormField>

            {seDiluye === "si" && (
              <FormField label="Relación de dilución">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <select
                    className="form-input"
                    value={selectedDilucionDropdown}
                    onChange={e => setSelectedDilucionDropdown(e.target.value)}
                  >
                    <option value="">— Seleccionar dilución —</option>
                    {DILUCION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="Otro">Otro (especificar)</option>
                  </select>
                  {selectedDilucionDropdown === "Otro" && (
                    <input
                      className="form-input"
                      value={customDilucionInput}
                      onChange={e => setCustomDilucionInput(e.target.value)}
                      placeholder="Ingrese la relación de dilución (Ej: 1:40, 5%...)"
                      required
                    />
                  )}
                </div>
              </FormField>
            )}
          </>
        )}

        {hasAutoSystem && metodo === "automatico" && (
          <>
            <FormField label="Sistema de dosificación automática">
              <select className="form-input" value={tipoSistemaAuto} onChange={e => setTipoSistemaAuto(e.target.value)}>
                <option value="">— Seleccionar sistema —</option>
                <option value="ro3">RO3 (Interlub)</option>
                <option value="otro">Otro sistema</option>
              </select>
            </FormField>
            <FormField label="Detalle del sistema (Fabricación/Origen)">
              <input 
                className="form-input" 
                value={detalleSistemaAuto} 
                onChange={e => setDetalleSistemaAuto(e.target.value)} 
                placeholder={tipoSistemaAuto === "ro3" ? "Ej: Sistema RO3 estándar..." : "Ej: Diseñado por ingenieros internos de la planta..."} 
              />
            </FormField>
          </>
        )}

        <FormField label="Consumo estimado por ciclo (ml únicamente)" hint="Los consumos por aplicación no superan 1L por ciclo de lubricación">
          <div className="flex items-center gap-2">
            <input className="form-input" type="number" placeholder="0.00" value={consumo} onChange={e => setConsumo(e.target.value)} style={{ flex: 1 }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minWidth: "30px", textAlign: "right" }}>ml</span>
          </div>
        </FormField>

        <FormField label="Frecuencia de aplicación">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <select
              className="form-input"
              value={freqSelect}
              onChange={e => setFreqSelect(e.target.value)}
            >
              <option value="">— Seleccionar frecuencia —</option>
              {FRECUENCIA_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="Otro">Otro (especificar)</option>
            </select>
            {freqSelect === "Otro" && (
              <input
                className="form-input"
                placeholder="Ej: Por turno, diario, etc..."
                value={freqInput}
                onChange={e => setFreqInput(e.target.value)}
              />
            )}
          </div>
        </FormField>

        {num === "6.1" && (
          <FormField label="Cantidad de máquinas CNC de corte en la planta" hint="Este proceso es independiente de las prensas de extrusión">
            <input 
              type="number"
              className="form-input" 
              value={cantidadCnc} 
              onChange={e => setCantidadCnc(e.target.value)} 
              placeholder="Ej: 5" 
              min={1}
            />
          </FormField>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleSave} className="btn-primary btn-interactive" style={{ fontSize: "0.775rem", padding: "0.35rem 0.75rem" }}>
          <Save size={12} /> Guardar Aplicación
        </button>
        {savedSuccess && <span style={{ fontSize: "0.775rem", color: "var(--accent-green)" }}>✓ Cambios guardados</span>}
        {validationError && <span style={{ fontSize: "0.775rem", color: "var(--interlub-red)" }}>{validationError}</span>}
      </div>
    </div>
  );
}

const PrensaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M8 6v12M16 6v12M3 12h5M16 12h5" />
  </svg>
);

const ShearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16M7 14h6M12 4v6M17 10h-5" />
    <circle cx="12" cy="10" r="1.5" />
    <path d="M18 6l-4 4" />
  </svg>
);

const ExtrusionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="8" width="8" height="8" rx="1" />
    <path d="M10 12h12M16 9l3 3-3 3" />
  </svg>
);

const PullerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h14M21 10v8M17 10l4 4-4 4" />
    <path d="M7 6v8" />
  </svg>
);

const StretcherIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20M5 8l-3 4 3 4M19 8l3 4-3 4" />
  </svg>
);

const ColdSawIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="M8 8l2.5 2.5M13.5 13.5L16 16" />
  </svg>
);

const OvenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 10h16M9 14v4M15 14v4" />
  </svg>
);

const ReportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const stepperSteps = [
  { num: 1, label: "Prensa", detail: "Datos Generales", id: "sec-1" },
  { num: 2, label: "Corte Barra", detail: "Hot Shear/Saw", id: "sec-2" },
  { num: 3, label: "Extrusión", detail: "Dummy/Billet", id: "sec-3" },
  { num: 4, label: "Salida / Puller", detail: "Hot Sierra/Puller", id: "sec-4" },
  { num: 5, label: "Tensado", detail: "Stretcher", id: "sec-5" },
  { num: 6, label: "Corte Frío", detail: "Sierra Frío", id: "sec-6" },
  { num: 7, label: "Tratamiento", detail: "Envejecimiento", id: "sec-7" }
];

export default function PlantaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    plantas, prensas,
    savePrensaSeccion1, saveAplicacion, savePuller,
    saveHornoMovimiento, saveObservaciones, addPrensa, updatePlanta,
    deletePrensa, updatePrensa
  } = useStore();

  const planta = plantas.find(p => p.id === id);

  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 1: true });
  const [activePrensa, setActivePrensa] = useState<string | null>(null);

  // Modal states for Location Edit
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editPais, setEditPais] = useState("");
  const [editCiudadDireccion, setEditCiudadDireccion] = useState("");
  const [locationError, setLocationError] = useState("");

  // Modal states for delete press
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync location form fields with planta data
  useEffect(() => {
    if (planta) {
      setEditNombre(planta.nombre || "");
      setEditPais(planta.pais || "");
      setEditCiudadDireccion(planta.ciudadDireccion || "");
    }
  }, [planta?.id, planta?.nombre, planta?.pais, planta?.ciudadDireccion]);
  
  // Modal states for New Prensa
  const [showPressModal, setShowPressModal] = useState(false);
  const [nombrePrensa, setNombrePrensa] = useState("");
  const [idInternoPrensa, setIdInternoPrensa] = useState("");
  const [oemIdPrensa, setOemIdPrensa] = useState("");
  const [capacidadPrensa, setCapacidadPrensa] = useState("");
  const [diametroPrensa, setDiametroPrensa] = useState("");
  const [selectedAlloys, setSelectedAlloys] = useState<string[]>([]);
  const [notasPrensa, setNotasPrensa] = useState("");
  const [pressModalError, setPressModalError] = useState("");
  const [customAlloysList, setCustomAlloysList] = useState<string[]>([]);
  const [customAlloyInput, setCustomAlloyInput] = useState("");

  // Section 1 states
  const [s1IdInterno, setS1IdInterno] = useState("");
  const [s1OemId, setS1OemId] = useState("");
  const [s1Modelo, setS1Modelo] = useState("");
  const [s1Anio, setS1Anio] = useState("");
  const [s1Capacidad, setS1Capacidad] = useState("");
  const [s1Diametro, setS1Diametro] = useState("");
  const [s1LongCorte, setS1LongCorte] = useState("");
  const [s1LongCorteUnidad, setS1LongCorteUnidad] = useState("mm");
  const [s1Aleaciones, setS1Aleaciones] = useState("");
  const [s1SelectedAlloys, setS1SelectedAlloys] = useState<string[]>([]);
  const [s1Efectividad, setS1Efectividad] = useState("");
  const [s1Oee, setS1Oee] = useState("");
  const [s1CicloMin, setS1CicloMin] = useState("");
  const [s1CicloMinutos, setS1CicloMinutos] = useState(0);
  const [s1CicloSegundos, setS1CicloSegundos] = useState(0);
  const [s1CicloMax, setS1CicloMax] = useState("");
  const [s1ProdMensual, setS1ProdMensual] = useState("");
  const [s1Saved, setS1Saved] = useState(false);

  // Section 2 cut type state
  const [tipoCorteBarra, setTipoCorteBarra] = useState<"shear" | "saw" | "ninguno" | "">("");

  // Section 3 lubrication type state
  const [tipoLubricacionSec3, setTipoLubricacionSec3] = useState<"dummy" | "billet" | "ninguno" | "">("");

  // Section 4 Puller states
  const [pullerTipo, setPullerTipo] = useState("");
  const [pullerCantidad, setPullerCantidad] = useState("1");
  const [pullerMecanismo, setPullerMecanismo] = useState("");
  const [pullerLub, setPullerLub] = useState("");
  const [pullerForma, setPullerForma] = useState("");
  const [pullerProdComp, setPullerProdComp] = useState("");
  const [pullerSaved, setPullerSaved] = useState(false);

  // Section 7 Oven states
  const [hornoMov, setHornoMov] = useState("");
  const [hornoSaved, setHornoSaved] = useState(false);

  const plantPrensas = planta ? prensas.filter(pr => pr.plantaId === planta.id) : [];

  // Auto-generate identificacionInterna based on existing active presses under same plant
  const autoIdInterno = (() => {
    let maxNum = 0;
    plantPrensas.forEach(p => {
      const match = p.identificacionInterna?.match(/P-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    if (maxNum === 0 && plantPrensas.length > 0) {
      maxNum = plantPrensas.length;
    }
    return `P-${String(maxNum + 1).padStart(2, '0')}`;
  })();
  const selectedPrensa = plantPrensas.find(p => p.id === activePrensa) ?? plantPrensas[0] ?? null;

  // Initialize form fields when selected prensa changes
  useEffect(() => {
    if (selectedPrensa) {
      const idMatch = selectedPrensa.identificacionInterna?.match(/P-(\d+)/i);
      if (idMatch) {
        setS1IdInterno(parseInt(idMatch[1], 10).toString());
      } else {
        setS1IdInterno(selectedPrensa.identificacionInterna || "");
      }
      setS1OemId(selectedPrensa.oemId || "");
      setS1Modelo(selectedPrensa.modelo || "");
      setS1Anio(selectedPrensa.anioFabricacion?.toString() || "");
      setS1Capacidad(selectedPrensa.capacidadTons?.toString() || "");
      setS1Diametro(selectedPrensa.diametroBillet || "");
      setS1LongCorte(selectedPrensa.longitudMaxCorte?.toString() || "");
      setS1LongCorteUnidad(selectedPrensa.longitudMaxCorteUnidad || "mm");
      setS1Aleaciones(selectedPrensa.aleaciones?.join(", ") || "");
      setS1SelectedAlloys(selectedPrensa.aleaciones || []);
      setS1Efectividad(selectedPrensa.efectividadPct?.toString() || "");
      setS1Oee(selectedPrensa.oeePct?.toString() || "");
      setS1CicloMin(selectedPrensa.tiempoCicloMin || "");
      const cicloStr = selectedPrensa.tiempoCicloMin || "00:00";
      const [minStr, secStr] = cicloStr.split(":");
      const rawMin = parseInt(minStr, 10);
      const rawSec = parseInt(secStr, 10);
      setS1CicloMinutos(isNaN(rawMin) ? 0 : Math.min(5, Math.max(0, rawMin)));
      setS1CicloSegundos(isNaN(rawSec) ? 0 : Math.min(60, Math.max(0, rawSec)));
      setS1CicloMax(selectedPrensa.tiempoCicloMax || "");
      setS1ProdMensual(selectedPrensa.produccionMensual?.toString() || "");

      const pull = selectedPrensa.pullers && selectedPrensa.pullers.length > 0 ? selectedPrensa.pullers[0] : null;
      setPullerTipo(pull?.tipo || "");
      setPullerCantidad(pull?.cantidad?.toString() || "1");
      setPullerMecanismo(pull?.mecanismo || "");
      setPullerLub(pull?.tipoLubricacion || "manual");
      setPullerForma(pull?.formaAplicacion || "");
      setPullerProdComp(pull?.productoCompetidorId || "");

      const ovenApp = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-10");
      setHornoMov((ovenApp?.camposEspeciales?.sistema_movimiento as string) || "");

      // Initialize Section 2 cut type state
      const app1 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-1");
      const app2 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-2");
      const hasShear = app1 && app1.estado !== "desconocido";
      const hasSaw = app2 && app2.estado !== "desconocido";

      if (hasShear) {
        setTipoCorteBarra("shear");
      } else if (hasSaw) {
        setTipoCorteBarra("saw");
      } else if (app1?.camposEspeciales?.corte_seleccionado) {
        setTipoCorteBarra(app1.camposEspeciales.corte_seleccionado as any);
      } else if (app2?.camposEspeciales?.corte_seleccionado) {
        setTipoCorteBarra(app2.camposEspeciales.corte_seleccionado as any);
      } else {
        setTipoCorteBarra("");
      }

      // Initialize Section 3 lubrication type state
      const app3 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-3");
      const app4 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-4");
      const hasDummy = app3 && app3.estado !== "desconocido";
      const hasBillet = app4 && app4.estado !== "desconocido";

      if (hasDummy) {
        setTipoLubricacionSec3("dummy");
      } else if (hasBillet) {
        setTipoLubricacionSec3("billet");
      } else if (app3?.camposEspeciales?.lubricacion_seleccionada) {
        setTipoLubricacionSec3(app3.camposEspeciales.lubricacion_seleccionada as any);
      } else if (app4?.camposEspeciales?.lubricacion_seleccionada) {
        setTipoLubricacionSec3(app4.camposEspeciales.lubricacion_seleccionada as any);
      } else {
        setTipoLubricacionSec3("");
      }
    }
  }, [selectedPrensa?.id]);

  // Combine minutes and seconds into s1CicloMin
  useEffect(() => {
    setS1CicloMin(`${String(s1CicloMinutos).padStart(2, '0')}:${String(s1CicloSegundos).padStart(2, '0')}`);
  }, [s1CicloMinutos, s1CicloSegundos]);

  // Autocalculate s1ProdMensual based on diameter, cycle time and productivity percentage
  useEffect(() => {
    const dNum = parseFloat(s1Diametro) || 8;
    const weightKg = 0.15 * Math.pow(dNum, 3);
    const cycleSec = (s1CicloMinutos * 60) + s1CicloSegundos;
    const efectividadNum = parseFloat(s1Efectividad) || 0;

    if (cycleSec > 0 && efectividadNum > 0) {
      const billetsPerHour = 3600 / cycleSec;
      const tonsPerHour = (billetsPerHour * weightKg) / 1000;
      const monthlyHours = 320; // realistic working hours/month
      const calculatedProd = Math.round(tonsPerHour * (efectividadNum / 100) * monthlyHours);
      setS1ProdMensual(calculatedProd.toString());
    } else {
      setS1ProdMensual("0");
    }
  }, [s1Diametro, s1CicloMinutos, s1CicloSegundos, s1Efectividad]);

  if (!planta) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <Factory size={48} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.4 }} />
        <h2>Planta no encontrada</h2>
        <Link href="/plantas"><button className="btn-ghost">← Volver</button></Link>
      </div>
    );
  }

  const toggleSection = (n: number) => setOpenSections(prev => ({ ...prev, [n]: !prev[n] }));

  // Dynamically compute status for each section
  const getSectionStatus = (num: number): SectionStatus => {
    if (!selectedPrensa) return "pending";

    switch (num) {
      case 1:
        if (selectedPrensa.oemId && selectedPrensa.capacidadTons) return "completed";
        if (selectedPrensa.identificacionInterna || selectedPrensa.modelo) return "in_progress";
        return "pending";
      case 2:
        const app1 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-1");
        const app2 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-2");
        const corteSeleccionado = app1?.camposEspeciales?.corte_seleccionado || app2?.camposEspeciales?.corte_seleccionado || "";
        if (corteSeleccionado === "ninguno") return "completed";
        if (corteSeleccionado === "shear") {
          return app1 && app1.estado !== "desconocido" ? "completed" : "pending";
        }
        if (corteSeleccionado === "saw") {
          return app2 && app2.estado !== "desconocido" ? "completed" : "pending";
        }
        return "pending";
      case 3:
        const app3 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-3");
        const app4 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-4");
        const app5 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-5");

        const hasApp5Completed = app5 && app5.estado !== "desconocido";
        const lubricacionSeleccionada = (app3?.camposEspeciales?.lubricacion_seleccionada as string) || (app4?.camposEspeciales?.lubricacion_seleccionada as string) || "";

        if (lubricacionSeleccionada === "ninguno") {
          return hasApp5Completed ? "completed" : "in_progress";
        } else if (lubricacionSeleccionada === "dummy") {
          const hasApp3Completed = app3 && app3.estado !== "desconocido";
          if (hasApp3Completed && hasApp5Completed) return "completed";
          if (hasApp3Completed || hasApp5Completed) return "in_progress";
          return "pending";
        } else if (lubricacionSeleccionada === "billet") {
          const hasApp4Completed = app4 && app4.estado !== "desconocido";
          if (hasApp4Completed && hasApp5Completed) return "completed";
          if (hasApp4Completed || hasApp5Completed) return "in_progress";
          return "pending";
        } else {
          if (hasApp5Completed) return "in_progress";
          return "pending";
        }
      case 4:
        const hasPuller = selectedPrensa.pullers && selectedPrensa.pullers.length > 0 && selectedPrensa.pullers[0].mecanismo;
        const s4App = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-7");
        if (hasPuller && s4App && s4App.estado !== "desconocido") return "completed";
        if (hasPuller || s4App) return "in_progress";
        return "pending";
      case 5:
        const s5App = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-8");
        if (s5App && s5App.estado !== "desconocido") return "completed";
        return "pending";
      case 6:
        const s6App = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-9");
        if (s6App && s6App.estado !== "desconocido") return "completed";
        return "pending";
      case 7:
        const s7App = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-10");
        const hasOvenMov = s7App?.camposEspeciales?.sistema_movimiento;
        if (s7App && s7App.estado !== "desconocido" && hasOvenMov) return "completed";
        if (s7App || hasOvenMov) return "in_progress";
        return "pending";
      default:
        return "pending";
    }
  };

  const secciones = [
    { num: 1, title: "Sección 1 — Datos Generales de la Prensa", status: getSectionStatus(1) },
    { num: 2, title: "Sección 2 — Corte de Barra (Hot Shear [corte de barra/billet con cizalla] / Hot Saw [corte de barra/billet en caliente])", status: getSectionStatus(2) },
    { num: 3, title: "Sección 3 — Extrusión de Tocho", status: getSectionStatus(3) },
    { num: 4, title: "Sección 4 — Sierra de Corte en Caliente + Puller / Jalador", status: getSectionStatus(4) },
    { num: 5, title: "Sección 5 — Mesa de Tensado (Stretcher)", status: getSectionStatus(5) },
    { num: 6, title: "Sección 6 — Corte de Perfil en Frío", status: getSectionStatus(6) },
    { num: 7, title: "Sección 7 — Horno de Envejecimiento (Tratamiento Térmico)", status: getSectionStatus(7) },
  ];

  const compOpts = PRODUCTOS_COMPETIDORES.map(p => ({ label: `${p.marca} — ${p.nombreProducto ?? ""}`, value: p.id }));
  const interlubOpts = PRODUCTOS_INTERLUB.map(p => ({ label: p.nombreComercial, value: p.id }));

  const handleSaveAppWithCollapse = async (appData: any) => {
    await saveAplicacion(selectedPrensa.id, appData);
    const secNum = parseInt(appData.appNum.split(".")[0], 10);
    if (!isNaN(secNum)) {
      setOpenSections(prev => ({ ...prev, [secNum]: false }));
    }
  };

  // Handlers for Saves
  const handleSaveS1 = () => {
    const oemName = OEMS.find(o => o.id === s1OemId)?.nombre || "";
    const generatedName = `Prensa ${s1IdInterno} — ${oemName} — ${s1Diametro}`;

    savePrensaSeccion1(selectedPrensa.id, {
      nombreInterno: generatedName,
      identificacionInterna: `P-${String(s1IdInterno).padStart(2, '0')}`,
      oemId: s1OemId,
      capacidadTons: s1Capacidad ? Number(s1Capacidad) : undefined,
      diametroBillet: s1Diametro,
      aleaciones: s1SelectedAlloys,
      efectividadPct: s1Efectividad ? Number(s1Efectividad) : undefined,
      tiempoCicloMin: s1CicloMin,
      produccionMensual: s1ProdMensual ? Number(s1ProdMensual) : undefined
    });
    setS1Saved(true);
    setOpenSections(prev => ({ ...prev, 1: false }));
    setTimeout(() => setS1Saved(false), 2000);
  };

  const handleResetCorteBarra = async () => {
    if (!selectedPrensa) return;
    setTipoCorteBarra("");

    const app1 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-1");
    const app2 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-2");

    await saveAplicacion(selectedPrensa.id, {
      appNum: "2.1",
      catalogoId: "app-1",
      areaId: "area-3",
      estado: app1?.estado || "desconocido",
      productoCompetidorId: app1?.productoCompetidorId || null,
      productoInterlubActivoId: app1?.productoInterlubActivoId || null,
      formaAplicacion: app1?.formaAplicacion || "",
      metodoAplicacion: app1?.metodoAplicacion || null,
      consumoEstimado: app1?.consumoEstimado || undefined,
      consumoUnidad: app1?.consumoUnidad || "ml",
      frecuenciaAplicacion: app1?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app1?.camposEspeciales, corte_seleccionado: null }
    });

    await saveAplicacion(selectedPrensa.id, {
      appNum: "2.2",
      catalogoId: "app-2",
      areaId: "area-3",
      estado: app2?.estado || "desconocido",
      productoCompetidorId: app2?.productoCompetidorId || null,
      productoInterlubActivoId: app2?.productoInterlubActivoId || null,
      formaAplicacion: app2?.formaAplicacion || "",
      metodoAplicacion: app2?.metodoAplicacion || null,
      consumoEstimado: app2?.consumoEstimado || undefined,
      consumoUnidad: app2?.consumoUnidad || "ml",
      frecuenciaAplicacion: app2?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app2?.camposEspeciales, corte_seleccionado: null }
    });
  };

  const handleResetLubricacionSec3 = async () => {
    if (!selectedPrensa) return;
    setTipoLubricacionSec3("");

    const app3 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-3");
    const app4 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-4");

    await saveAplicacion(selectedPrensa.id, {
      appNum: "3.1",
      catalogoId: "app-3",
      areaId: "area-3",
      estado: app3?.estado || "desconocido",
      productoCompetidorId: app3?.productoCompetidorId || null,
      productoInterlubActivoId: app3?.productoInterlubActivoId || null,
      formaAplicacion: app3?.formaAplicacion || "",
      metodoAplicacion: app3?.metodoAplicacion || null,
      consumoEstimado: app3?.consumoEstimado || undefined,
      consumoUnidad: app3?.consumoUnidad || "ml",
      frecuenciaAplicacion: app3?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app3?.camposEspeciales, lubricacion_seleccionada: null }
    });

    await saveAplicacion(selectedPrensa.id, {
      appNum: "3.2",
      catalogoId: "app-4",
      areaId: "area-3",
      estado: app4?.estado || "desconocido",
      productoCompetidorId: app4?.productoCompetidorId || null,
      productoInterlubActivoId: app4?.productoInterlubActivoId || null,
      formaAplicacion: app4?.formaAplicacion || "",
      metodoAplicacion: app4?.metodoAplicacion || null,
      consumoEstimado: app4?.consumoEstimado || undefined,
      consumoUnidad: app4?.consumoUnidad || "ml",
      frecuenciaAplicacion: app4?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app4?.camposEspeciales, lubricacion_seleccionada: null }
    });
  };

  const handleToggleCorteBarra = async (val: "shear" | "saw" | "ninguno") => {
    if (!selectedPrensa) return;
    setTipoCorteBarra(val);

    const app1 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-1");
    const app2 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-2");

    await saveAplicacion(selectedPrensa.id, {
      appNum: "2.1",
      catalogoId: "app-1",
      areaId: "area-3",
      estado: app1?.estado || "desconocido",
      productoCompetidorId: app1?.productoCompetidorId || null,
      productoInterlubActivoId: app1?.productoInterlubActivoId || null,
      formaAplicacion: app1?.formaAplicacion || "",
      metodoAplicacion: app1?.metodoAplicacion || null,
      consumoEstimado: app1?.consumoEstimado || undefined,
      consumoUnidad: app1?.consumoUnidad || "ml",
      frecuenciaAplicacion: app1?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app1?.camposEspeciales, corte_seleccionado: val }
    });

    await saveAplicacion(selectedPrensa.id, {
      appNum: "2.2",
      catalogoId: "app-2",
      areaId: "area-3",
      estado: app2?.estado || "desconocido",
      productoCompetidorId: app2?.productoCompetidorId || null,
      productoInterlubActivoId: app2?.productoInterlubActivoId || null,
      formaAplicacion: app2?.formaAplicacion || "",
      metodoAplicacion: app2?.metodoAplicacion || null,
      consumoEstimado: app2?.consumoEstimado || undefined,
      consumoUnidad: app2?.consumoUnidad || "ml",
      frecuenciaAplicacion: app2?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app2?.camposEspeciales, corte_seleccionado: val }
    });
  };

  const handleToggleLubricacionSec3 = async (val: "dummy" | "billet" | "ninguno") => {
    if (!selectedPrensa) return;
    setTipoLubricacionSec3(val);

    const app3 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-3");
    const app4 = selectedPrensa.aplicaciones?.find(a => a.catalogoAplicacionId === "app-4");

    await saveAplicacion(selectedPrensa.id, {
      appNum: "3.1",
      catalogoId: "app-3",
      areaId: "area-3",
      estado: app3?.estado || "desconocido",
      productoCompetidorId: app3?.productoCompetidorId || null,
      productoInterlubActivoId: app3?.productoInterlubActivoId || null,
      formaAplicacion: app3?.formaAplicacion || "",
      metodoAplicacion: app3?.metodoAplicacion || null,
      consumoEstimado: app3?.consumoEstimado || undefined,
      consumoUnidad: app3?.consumoUnidad || "ml",
      frecuenciaAplicacion: app3?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app3?.camposEspeciales, lubricacion_seleccionada: val }
    });

    await saveAplicacion(selectedPrensa.id, {
      appNum: "3.2",
      catalogoId: "app-4",
      areaId: "area-3",
      estado: app4?.estado || "desconocido",
      productoCompetidorId: app4?.productoCompetidorId || null,
      productoInterlubActivoId: app4?.productoInterlubActivoId || null,
      formaAplicacion: app4?.formaAplicacion || "",
      metodoAplicacion: app4?.metodoAplicacion || null,
      consumoEstimado: app4?.consumoEstimado || undefined,
      consumoUnidad: app4?.consumoUnidad || "ml",
      frecuenciaAplicacion: app4?.frecuenciaAplicacion || "",
      camposEspeciales: { ...app4?.camposEspeciales, lubricacion_seleccionada: val }
    });
  };

  const handleSavePuller = () => {
    savePuller(selectedPrensa.id, {
      tipo: pullerTipo,
      cantidad: pullerCantidad ? Number(pullerCantidad) : 1,
      mecanismo: pullerMecanismo ? (pullerMecanismo as 'cadena' | 'cable') : undefined,
      tipoLubricacion: pullerLub ? (pullerLub as 'manual' | 'automatico' | 'sin_lubricacion') : undefined,
      formaAplicacion: pullerForma,
      productoCompetidorId: pullerProdComp
    });
    setPullerSaved(true);
    setOpenSections(prev => ({ ...prev, 4: false }));
    setTimeout(() => setPullerSaved(false), 2000);
  };

  const handleSaveOven = () => {
    saveHornoMovimiento(selectedPrensa.id, hornoMov as any);
    setHornoSaved(true);
    setOpenSections(prev => ({ ...prev, 7: false }));
    setTimeout(() => setHornoSaved(false), 2000);
  };

  const handleDeleteActivePrensa = async () => {
    if (!selectedPrensa) return;

    try {
      await deletePrensa(selectedPrensa.id);
      setActivePrensa(null);
      setShowDeleteConfirm(false);
      alert("Prensa eliminada con éxito.");
    } catch (err: any) {
      alert("Error al eliminar la prensa: " + err.message);
    }
  };

  const handleAddPressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPressModalError("");

    if (!idInternoPrensa) {
      setPressModalError("Debe seleccionar una Identificación Interna.");
      return;
    }
    if (!oemIdPrensa) {
      setPressModalError("Debe seleccionar un Fabricante / OEM.");
      return;
    }
    if (!diametroPrensa) {
      setPressModalError("Debe seleccionar un Diámetro de Tocho (Billet).");
      return;
    }

    const oemName = OEMS.find(o => o.id === oemIdPrensa)?.nombre || "";
    const generatedName = `Prensa ${idInternoPrensa} — ${oemName} — ${diametroPrensa}`;

    addPrensa({
      plantaId: planta.id,
      nombreInterno: generatedName,
      identificacionInterna: `P-${String(idInternoPrensa).padStart(2, '0')}`,
      oemId: oemIdPrensa,
      capacidadTons: capacidadPrensa ? Number(capacidadPrensa) : undefined,
      diametroBillet: diametroPrensa,
      aleaciones: selectedAlloys,
      notas: notasPrensa.trim() || undefined
    });

    // Reset and Close
    setIdInternoPrensa("");
    setOemIdPrensa("");
    setCapacidadPrensa("");
    setDiametroPrensa("");
    setSelectedAlloys([]);
    setNotasPrensa("");
    setShowPressModal(false);
  };

  const handleEditLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocationError("");

    if (!editNombre.trim()) {
      setLocationError("El nombre de la planta es obligatorio.");
      return;
    }

    try {
      await updatePlanta(planta.id, {
        nombre: editNombre.trim(),
        pais: editPais.trim() || undefined,
        ciudadDireccion: editCiudadDireccion.trim() || undefined
      });
      setShowLocationModal(false);
    } catch (err: any) {
      setLocationError("Error al guardar: " + (err.message || err));
    }
  };



  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4" style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
        <Link href="/plantas" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Factory size={13} /> Plantas
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--text-primary)" }}>{planta.nombre}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{planta.nombre}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <MapPin size={12} style={{ color: "var(--interlub-red)" }} />
            {planta.pais ? `${planta.pais} · ` : ""}{planta.ciudadDireccion}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setShowLocationModal(true)} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <MapPin size={14} /> Editar Ubicación
          </button>
          <button className="btn-primary" onClick={() => setShowPressModal(true)} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Plus size={14} /> Nueva Prensa
          </button>
        </div>
      </div>

      {/* Prensa Selector */}
      {plantPrensas.length > 0 ? (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {plantPrensas.map(pr => (
            <button
              key={pr.id}
              onClick={() => setActivePrensa(pr.id)}
              style={{
                padding: "0.4rem 0.875rem", borderRadius: "8px",
                border: "1px solid",
                borderColor: (activePrensa ?? plantPrensas[0]?.id) === pr.id ? "var(--interlub-red)" : "var(--bg-border)",
                background: (activePrensa ?? plantPrensas[0]?.id) === pr.id ? "rgba(204,0,0,0.1)" : "var(--bg-elevated)",
                color: (activePrensa ?? plantPrensas[0]?.id) === pr.id ? "var(--interlub-red)" : "var(--text-secondary)",
                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: "0.375rem"
              }}
            >
              <Wrench size={13} />
              {pr.nombreInterno.split("—")[0].trim()}
              <span style={{
                fontSize: "0.65rem", padding: "0.1rem 0.375rem", borderRadius: "4px",
                background: pr.pctCompletitud >= 80 ? "rgba(34,197,94,0.15)" : pr.pctCompletitud >= 40 ? "rgba(245,158,11,0.15)" : "rgba(153,153,179,0.15)",
                color: pr.pctCompletitud >= 80 ? "var(--accent-green)" : pr.pctCompletitud >= 40 ? "var(--accent-amber)" : "var(--text-muted)",
              }}>
                {formatPercent(pr.pctCompletitud)}
              </span>
            </button>
          ))}
          <button className="btn-ghost" onClick={() => setShowPressModal(true)} style={{ fontSize: "0.775rem", padding: "0.375rem 0.75rem" }}>
            <Plus size={13} /> Agregar Prensa
          </button>
        </div>
      ) : null}

      {/* Visual Process Workflow (Timeline) */}
      {selectedPrensa && (
        <div className="stepper-container">
          {stepperSteps.map((step, idx) => {
            const status = getSectionStatus(step.num);
            const isActive = openSections[step.num];
            const isCompleted = status === "completed";
            const isInProgress = status === "in_progress";
            
            // Get correct icon component
            const iconsList = [PrensaIcon, ShearIcon, ExtrusionIcon, PullerIcon, StretcherIcon, ColdSawIcon, OvenIcon];
            const StepIcon = iconsList[idx];

            return (
              <React.Fragment key={step.num}>
                <div
                  className={`stepper-step ${isCompleted ? "completed" : ""} ${isInProgress ? "in_progress" : ""} ${isActive ? "active" : ""}`}
                  onClick={() => {
                    // Toggle open
                    setOpenSections(prev => ({ ...prev, [step.num]: true }));
                    // Scroll to it
                    setTimeout(() => {
                      const element = document.getElementById(step.id);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }, 50);
                  }}
                >
                  <div className="stepper-icon-wrap btn-interactive">
                    <StepIcon />
                  </div>
                  <div className="stepper-label">{step.label}</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{step.detail}</div>
                </div>
                {idx < stepperSteps.length - 1 && (
                  <div style={{
                    height: "2px",
                    flex: "1",
                    minWidth: "12px",
                    background: isCompleted ? "var(--accent-green)" : "var(--bg-border)",
                    opacity: 0.3,
                    alignSelf: "center",
                    transform: "translateY(-10px)"
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {selectedPrensa ? (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1rem", alignItems: "start" }}>
          {/* Left: Progress sidebar */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div className="interlub-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                  Progreso
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: selectedPrensa.pctCompletitud >= 80 ? "var(--accent-green)" : "var(--accent-amber)" }}>
                  {formatPercent(selectedPrensa.pctCompletitud)}
                </span>
              </div>
              <div className="progress-bar-track" style={{ height: 8, marginBottom: "1rem" }}>
                <div
                  className={`progress-bar-fill ${selectedPrensa.pctCompletitud >= 80 ? "green" : selectedPrensa.pctCompletitud >= 40 ? "amber" : "red"}`}
                  style={{ width: `${selectedPrensa.pctCompletitud}%` }}
                />
              </div>
              {secciones.map(sec => {
                const icons = {
                  completed: "✓",
                  in_progress: "●",
                  pending: sec.num.toString(),
                };
                return (
                  <button
                    key={sec.num}
                    onClick={() => { toggleSection(sec.num); document.getElementById(`sec-${sec.num}`)?.scrollIntoView({ behavior: "smooth" }); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      width: "100%", padding: "0.4rem 0.5rem", borderRadius: "7px",
                      background: openSections[sec.num] ? "var(--bg-elevated)" : "transparent",
                      border: "none", cursor: "pointer", marginBottom: "2px",
                      textAlign: "left", transition: "background 0.15s",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: sec.status === "completed" ? "var(--accent-green)" :
                                  sec.status === "in_progress" ? "var(--interlub-red)" : "var(--bg-border)",
                      fontSize: "0.6rem", fontWeight: 700, color: "white",
                    }}>
                      {icons[sec.status]}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: sec.status === "pending" ? "var(--text-muted)" : "var(--text-primary)", lineHeight: 1.3 }}>
                      Sec. {sec.num}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Info prensa */}
            <div className="interlub-card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
                <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>
                  Datos de Prensa
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[
                  { label: "ID Interno", value: selectedPrensa.identificacionInterna },
                  { label: "OEM", value: OEMS.find(o => o.id === selectedPrensa.oemId)?.nombre },
                  { label: "Capacidad", value: selectedPrensa.capacidadTons ? `${selectedPrensa.capacidadTons} T` : null },
                  { label: "Diámetro", value: selectedPrensa.diametroBillet },
                ].filter(f => f.value).map(f => (
                  <div key={f.label}>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 500 }}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form sections */}
          <div key={selectedPrensa.id} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Sec 1 */}
            <div id="sec-1" className="form-section">
              <SectionHeader num={1} title="Datos Generales de la Prensa" status={secciones[0].status as any} isOpen={!!openSections[1]} onToggle={() => toggleSection(1)} />
              <div className={`accordion-wrapper ${openSections[1] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <FormField label="Identificación interna de la prensa" required>
                      <select
                        className="form-input"
                        value={s1IdInterno}
                        onChange={e => setS1IdInterno(e.target.value)}
                      >
                        <option value="">— Seleccionar ID (1-20) —</option>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num.toString()}>
                            Prensa {num}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Marca / OEM" required>
                      <select className="form-input" value={s1OemId} onChange={e => setS1OemId(e.target.value)}>
                        <option value="">— Seleccionar fabricante —</option>
                        {OEMS.map(o => <option key={o.id} value={o.id}>{o.nombre} ({o.paisOrigen})</option>)}
                      </select>
                    </FormField>
                    <FormField label="Capacidad nominal (toneladas)" required>
                      <select className="form-input" value={s1Capacidad} onChange={e => setS1Capacidad(e.target.value)}>
                        <option value="">— Seleccionar capacidad —</option>
                        {CAPACIDADES_PRENSA.map(c => <option key={c} value={c}>{c} T</option>)}
                      </select>
                    </FormField>
                    <FormField label="Diámetro de la barra / Billet">
                      <select className="form-input" value={s1Diametro} onChange={e => setS1Diametro(e.target.value)}>
                        <option value="">— Seleccionar diámetro —</option>
                        {DIAMETROS_BILLET.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Aleaciones utilizadas (máximo 3)">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.5rem", padding: "0.625rem", border: "1px solid var(--bg-border)", borderRadius: "8px", background: "var(--bg-secondary)" }}>
                        {ALLOY_OPTIONS.map(alloy => {
                          const isChecked = s1SelectedAlloys.includes(alloy);
                          const isDisabled = !isChecked && s1SelectedAlloys.length >= 3;
                          return (
                            <label key={alloy} style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: isDisabled ? "not-allowed" : "pointer", fontSize: "0.8rem", userSelect: "none", opacity: isDisabled ? 0.5 : 1 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={() => {
                                  if (isChecked) {
                                    setS1SelectedAlloys(prev => prev.filter(a => a !== alloy));
                                  } else if (s1SelectedAlloys.length < 3) {
                                    setS1SelectedAlloys(prev => [...prev, alloy]);
                                  }
                                }}
                                style={{ cursor: isDisabled ? "not-allowed" : "pointer", accentColor: "var(--interlub-red)" }}
                              />
                              <span>Serie {alloy}</span>
                            </label>
                          );
                        })}
                      </div>
                    </FormField>
                    <FormField 
                      label="Porcentaje de productividad de la prensa" 
                      tooltip={
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.8rem", borderBottom: "1px solid var(--bg-border)", paddingBottom: "0.25rem", margin: 0 }}>
                            📈 Porcentaje de Productividad de la Prensa
                          </p>
                          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>
                            <strong>1. Capacidad Teórica (100%):</strong> Es la cantidad máxima de aluminio que la prensa podría extruir si trabajara sin parar, a velocidad máxima, sin fallas y sin generar chatarra.
                          </p>
                          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>
                            <strong>2. Las Pérdidas Reales (¿Por qué no llegamos al 100%?):</strong>
                          </p>
                          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.72rem", fontStyle: "italic" }}>
                            La productividad real se ve afectada por tres factores principales:
                          </p>
                          <ul style={{ listStyleType: "disc", paddingLeft: "1.1rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem", margin: 0, fontSize: "0.72rem", lineHeight: "1.4" }}>
                            <li>
                              <strong style={{ color: "var(--accent-amber)" }}>Tiempos de Preparación (Setups):</strong> Paros programados para cambiar dados (moldes), ajustar herramientas o cambiar de aleación.
                            </li>
                            <li>
                              <strong style={{ color: "var(--interlub-red)" }}>Paros No Programados:</strong> Fallas mecánicas, eléctricas, falta de personal o esperas por enfriamiento del horno.
                            </li>
                            <li>
                              <strong style={{ color: "var(--accent-blue)" }}>Pérdidas de Velocidad y Calidad (Scrap):</strong> Extrusión a velocidad reducida por límites de temperatura y generación de chatarra.
                            </li>
                          </ul>
                        </div>
                      }
                    >
                      <div className="flex items-center gap-1">
                        <select
                          className="form-input"
                          value={s1Efectividad ? Math.round(parseFloat(s1Efectividad) || 0).toFixed(1) : ""}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setS1Efectividad(isNaN(val) ? "" : val.toFixed(1));
                          }}
                          style={{ textAlign: "center", height: "36px", cursor: "pointer" }}
                        >
                          <option value="">— Seleccionar % —</option>
                          {Array.from({ length: 101 }, (_, i) => i).map(pct => (
                            <option key={pct} value={pct.toFixed(1)}>
                              {pct}%
                            </option>
                          ))}
                        </select>
                      </div>
                    </FormField>

                    <FormField 
                      label="Tiempo de ciclo de extrusión" 
                      tooltip={
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.8rem", borderBottom: "1px solid var(--bg-border)", paddingBottom: "0.25rem", margin: 0 }}>
                            ⏱️ Tiempo de Ciclo de Extrusión
                          </p>
                          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>
                            Es el tiempo total transcurrido desde que se inicia la extrusión de un tocho hasta que comienza el siguiente.
                          </p>
                        </div>
                      }
                    >
                      <div style={{ display: "flex", alignItems: "start", gap: "0.5rem" }}>
                        {/* Minutos Stepper */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => setS1CicloMinutos(prev => Math.max(0, prev - 1))}
                              style={{
                                width: "36px",
                                height: "36px",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                borderRadius: "6px",
                                flexShrink: 0
                              }}
                            >
                              -
                            </button>
                            <input
                              className="form-input"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={s1CicloMinutos}
                              onChange={e => {
                                const clean = e.target.value.replace(/\D/g, "");
                                const val = parseInt(clean, 10);
                                if (isNaN(val)) {
                                  setS1CicloMinutos(0);
                                } else {
                                  setS1CicloMinutos(Math.min(5, Math.max(0, val)));
                                }
                              }}
                              style={{ textAlign: "center", width: "100%", height: "36px" }}
                            />
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => setS1CicloMinutos(prev => Math.min(5, prev + 1))}
                              style={{
                                width: "36px",
                                height: "36px",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                borderRadius: "6px",
                                flexShrink: 0
                              }}
                            >
                              +
                            </button>
                          </div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>Minutos (0-5)</span>
                        </div>

                        <span style={{ fontSize: "1.2rem", fontWeight: 700, height: "36px", display: "flex", alignItems: "center", color: "var(--text-secondary)" }}>:</span>

                        {/* Segundos Stepper */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => setS1CicloSegundos(prev => {
                                if (prev <= 0) return 60;
                                return prev - 1;
                              })}
                              style={{
                                width: "36px",
                                height: "36px",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                borderRadius: "6px",
                                flexShrink: 0
                              }}
                            >
                              -
                            </button>
                            <input
                              className="form-input"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={s1CicloSegundos}
                              onChange={e => {
                                const clean = e.target.value.replace(/\D/g, "");
                                const val = parseInt(clean, 10);
                                if (isNaN(val)) {
                                  setS1CicloSegundos(0);
                                } else {
                                  setS1CicloSegundos(Math.min(60, Math.max(0, val)));
                                }
                              }}
                              style={{ textAlign: "center", width: "100%", height: "36px" }}
                            />
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => setS1CicloSegundos(prev => {
                                if (prev >= 60) return 0;
                                return prev + 1;
                              })}
                              style={{
                                width: "36px",
                                height: "36px",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                borderRadius: "6px",
                                flexShrink: 0
                              }}
                            >
                              +
                            </button>
                          </div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>Segundos (0-60)</span>
                        </div>
                      </div>
                    </FormField>

                    <FormField label="Producción mensual (tons/mes)" hint="Calculado automáticamente en base al tocho, ciclo y productividad">
                      <input
                        className="form-input"
                        type="number"
                        value={s1ProdMensual}
                        readOnly
                        disabled
                        style={{ opacity: 0.85, cursor: "not-allowed", backgroundColor: "var(--bg-secondary)", fontWeight: 600 }}
                      />
                    </FormField>

                    <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button className="btn-primary btn-interactive" onClick={handleSaveS1} style={{ fontSize: "0.8rem" }}>
                          <Save size={14} /> Guardar Sección 1
                        </button>
                        {s1Saved && <span style={{ fontSize: "0.8rem", color: "var(--accent-green)" }}>✓ Guardado</span>}
                      </div>
                      <button
                        type="button"
                        className="btn-ghost btn-interactive"
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{ fontSize: "0.8rem", color: "var(--interlub-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                      >
                        <Trash2 size={14} style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }} /> Eliminar Prensa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sec 2 */}
            <div id="sec-2" className="form-section">
              <SectionHeader num={2} title="Sección 2 — Corte de Barra (Hot Shear [corte de barra/billet con cizalla] / Hot Saw [corte de barra/billet en caliente])" status={secciones[1].status as any} isOpen={!!openSections[2]} onToggle={() => toggleSection(2)} />
              <div className={`accordion-wrapper ${openSections[2] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <FormField label="¿Qué sistema de corte de barra en caliente utiliza esta prensa?">
                      <div className="flex items-center gap-3 flex-wrap">
                        <RadioGroup
                          name={`corteBarra-${selectedPrensa.id}`}
                          value={tipoCorteBarra}
                          onChange={(val) => handleToggleCorteBarra(val as any)}
                          options={[
                            { label: "Cizalla caliente (Hot Shear — corte de barra/billet con cizalla)", value: "shear" },
                            { label: "Sierra caliente (Hot Saw — corte de barra/billet en caliente)", value: "saw" },
                            { label: "Sin corte en caliente (Barra fría / Ninguno)", value: "ninguno" }
                          ]}
                          disabledOptions={tipoCorteBarra ? ["shear", "saw", "ninguno"].filter(o => o !== tipoCorteBarra) : []}
                        />
                        {tipoCorteBarra && (
                          <button
                            type="button"
                            className="btn-ghost btn-interactive"
                            onClick={handleResetCorteBarra}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}
                          >
                            Reestablecer
                          </button>
                        )}
                      </div>
                    </FormField>

                    {tipoCorteBarra === "shear" && (
                      <AplicacionBlock num="2.1" titulo="Hot Shear (corte de barra/billet con cizalla)" catalogoId="app-1" areaId="area-3" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                    )}

                    {tipoCorteBarra === "saw" && (
                      <AplicacionBlock num="2.2" titulo="Hot Saw (corte de barra/billet en caliente)" catalogoId="app-2" areaId="area-3" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                    )}

                    {tipoCorteBarra === "ninguno" && (
                      <div style={{ background: "var(--bg-elevated)", border: "1px dashed var(--bg-border)", borderRadius: "8px", padding: "1.5rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                          Prensa configurada sin corte de barra en caliente (barra fría).
                        </p>
                      </div>
                    )}

                    {tipoCorteBarra === "" && (
                      <div style={{ background: "var(--bg-elevated)", border: "1px dashed var(--bg-border)", borderRadius: "8px", padding: "1.5rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                          Seleccione un sistema de corte para habilitar la configuración.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sec 3 */}
            <div id="sec-3" className="form-section">
              <SectionHeader num={3} title="Sección 3 — Extrusión de Tocho" status={secciones[2].status as any} isOpen={!!openSections[3]} onToggle={() => toggleSection(3)} />
              <div className={`accordion-wrapper ${openSections[3] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ background: "rgba(198,139,53,0.06)", border: "1px solid rgba(198,139,53,0.15)", borderRadius: "8px", padding: "0.75rem" }}>
                      <p style={{ fontSize: "0.775rem", color: "var(--accent-amber)", margin: 0 }}>
                        <Info size={13} style={{ display: "inline", marginRight: "0.375rem" }} />
                        <strong>Nota de Campo:</strong> Puedes registrar el consumo de Dummy Block, Tocho y Cuchilla individual o agrupado (Sección 3.3).
                      </p>
                    </div>

                    <FormField label="¿Qué elemento se lubrica en el proceso de extrusión?">
                      <div className="flex items-center gap-3 flex-wrap">
                        <RadioGroup
                          name={`lubSec3-${selectedPrensa.id}`}
                          value={tipoLubricacionSec3}
                          onChange={(val) => handleToggleLubricacionSec3(val as any)}
                          options={[
                            { label: "Dummy Block / Cabeza de Stem", value: "dummy" },
                            { label: "Lingote / Tocho (Billet)", value: "billet" },
                            { label: "Ninguno (Sin lubricación en Dummy/Billet)", value: "ninguno" }
                          ]}
                          disabledOptions={tipoLubricacionSec3 ? ["dummy", "billet", "ninguno"].filter(o => o !== tipoLubricacionSec3) : []}
                        />
                        {tipoLubricacionSec3 && (
                          <button
                            type="button"
                            className="btn-ghost btn-interactive"
                            onClick={handleResetLubricacionSec3}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}
                          >
                            Reestablecer
                          </button>
                        )}
                      </div>
                    </FormField>

                    {tipoLubricacionSec3 === "dummy" && (
                      <AplicacionBlock num="3.1" titulo="Dummy Block / Cabeza de Stem" catalogoId="app-3" areaId="area-3" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                    )}

                    {tipoLubricacionSec3 === "billet" && (
                      <AplicacionBlock num="3.2" titulo="Lingote / Tocho (Billet)" catalogoId="app-4" areaId="area-3" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                    )}

                    {tipoLubricacionSec3 === "ninguno" && (
                      <div style={{ background: "var(--bg-elevated)", border: "1px dashed var(--bg-border)", borderRadius: "8px", padding: "1.5rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                          Prensa configurada sin lubricación de Dummy Block ni de Billet.
                        </p>
                      </div>
                    )}

                    {tipoLubricacionSec3 === "" && (
                      <div style={{ background: "var(--bg-elevated)", border: "1px dashed var(--bg-border)", borderRadius: "8px", padding: "1.5rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                          Seleccione qué elemento se lubrica para habilitar la configuración.
                        </p>
                      </div>
                    )}

                    <AplicacionBlock num="3.3" titulo="Cuchilla de Corte de Culotes / Galleta / Residuo" sinonimos={["Culotes", "Galleta", "Residuo"]} catalogoId="app-5" areaId="area-3" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sec 4 */}
            <div id="sec-4" className="form-section">
              <SectionHeader num={4} title="Sección 4 — Sierra en Caliente + Puller / Jalador" status={secciones[3].status as any} isOpen={!!openSections[4]} onToggle={() => toggleSection(4)} />
              <div className={`accordion-wrapper ${openSections[4] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content">
                    {/* Puller sub-entity */}
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "1.25rem", marginBottom: "0.875rem" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <PullerIcon /> Puller / Jalador (Sub-entidad)
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <FormField label="Tipo de puller">
                          <input className="form-input" value={pullerTipo} onChange={e => setPullerTipo(e.target.value)} placeholder="Ej: modelo / descripción..." />
                        </FormField>
                        <FormField label="Cantidad de pullers">
                          <input className="form-input" type="number" value={pullerCantidad} onChange={e => setPullerCantidad(e.target.value)} min={1} />
                        </FormField>
                        <FormField label="Mecanismo de movimiento" hint="Crítico para tipo de lubricante">
                          <RadioGroup
                            name="puller-mec"
                            value={pullerMecanismo}
                            onChange={setPullerMecanismo}
                            options={[
                              {
                                label: (
                                  <span className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    Cadena
                                  </span>
                                ),
                                value: "cadena"
                              },
                              {
                                label: (
                                  <span className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                      <line x1="12" y1="2" x2="12" y2="12" />
                                    </svg>
                                    Cable
                                  </span>
                                ),
                                value: "cable"
                              },
                            ]}
                          />
                          {pullerMecanismo === "cadena" && (
                            <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "rgba(30,141,84,0.08)", border: "1px solid rgba(30,141,84,0.2)", borderRadius: "7px" }}>
                              <p style={{ fontSize: "0.72rem", color: "var(--accent-green)" }}>
                                ⚡ Cadena detectada ➔ Se recomienda aceite penetrante <strong>Interchain HT-200</strong>
                              </p>
                            </div>
                          )}
                          {pullerMecanismo === "cable" && (
                            <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "rgba(124,82,165,0.08)", border: "1px solid rgba(124,82,165,0.2)", borderRadius: "7px" }}>
                              <p style={{ fontSize: "0.72rem", color: "var(--accent-purple)" }}>
                                ⚡ Cable detectado ➔ Se recomienda grasa de cable Interlub
                              </p>
                            </div>
                          )}
                        </FormField>
                        <FormField label="Tipo de lubricación">
                          <RadioGroup
                            name="puller-lub"
                            value={pullerLub}
                            onChange={setPullerLub}
                            options={[
                              { label: "Manual", value: "manual" },
                              { label: "Automático", value: "automatico" },
                              { label: "Sin lubricación", value: "sin_lubricacion" },
                            ]}
                          />
                        </FormField>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="form-label">Producto competidor utilizado actualmente</label>
                          <select className="form-input" value={pullerProdComp} onChange={e => setPullerProdComp(e.target.value)}>
                            <option value="">— Seleccionar producto competencia —</option>
                            {compOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: "2px" }}>
                          <button className="btn-primary btn-interactive" onClick={handleSavePuller} style={{ fontSize: "0.775rem" }}>
                            <Save size={12} /> Guardar Puller
                          </button>
                          {pullerSaved && <span style={{ marginLeft: "0.5rem", fontSize: "0.775rem", color: "var(--accent-green)" }}>✓ Guardado</span>}
                        </div>
                      </div>
                    </div>
                    <AplicacionBlock num="4.1" titulo="Sierra de Corte de Perfil en Caliente" catalogoId="app-7" areaId="area-3" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sec 5 */}
            <div id="sec-5" className="form-section">
              <SectionHeader num={5} title="Sección 5 — Mesa de Tensado (Stretcher)" status={secciones[4].status as any} isOpen={!!openSections[5]} onToggle={() => toggleSection(5)} />
              <div className={`accordion-wrapper ${openSections[5] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content">
                    <AplicacionBlock num="5.1" titulo="Mesa de Tensado (Stretcher)" catalogoId="app-8" areaId="area-4" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sec 6 */}
            <div id="sec-6" className="form-section">
              <SectionHeader num={6} title="Sección 6 — Corte de Perfil en Frío" status={secciones[5].status as any} isOpen={!!openSections[6]} onToggle={() => toggleSection(6)} />
              <div className={`accordion-wrapper ${openSections[6] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content">
                    <div style={{ background: "rgba(59,117,165,0.06)", border: "1px solid rgba(59,117,165,0.15)", borderRadius: "8px", padding: "0.75rem", marginBottom: "0.5rem" }}>
                      <p style={{ fontSize: "0.775rem", color: "var(--accent-blue)", margin: 0, marginBottom: "0.375rem" }}>
                        <Info size={13} style={{ display: "inline", marginRight: "0.375rem" }} />
                        <strong>Diferencia técnica:</strong> El corte en frío se realiza en máquinas CNC y estos cortes son de alta precisión, a diferencia de la sierra en caliente. Requiere fluidos de corte específicos.
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
                        💡 <strong>Nota de captura:</strong> Este proceso no corresponde directamente a las prensas de extrusión de aluminio. Las empresas normalmente cuentan con estas máquinas CNC en un área independiente de las prensas (por ejemplo, una planta puede tener 3 prensas de extrusión y 5 máquinas CNC). Se asocia en este formulario para consolidar el consumo a nivel planta.
                      </p>
                    </div>
                    <AplicacionBlock num="6.1" titulo="Sierra de Corte de Perfil en Frío" catalogoId="app-9" areaId="area-5" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sec 7 */}
            <div id="sec-7" className="form-section">
              <SectionHeader num={7} title="Sección 7 — Horno de Envejecimiento (Tratamiento Térmico)" status={secciones[6].status as any} isOpen={!!openSections[7]} onToggle={() => toggleSection(7)} />
              <div className={`accordion-wrapper ${openSections[7] ? "open" : ""}`}>
                <div className="accordion-inner">
                  <div className="form-section-content">
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--bg-border)", borderRadius: "10px", padding: "1.25rem", marginBottom: "0.875rem" }}>
                      <FormField label="Sistema de movimiento del horno" hint="Determina directamente el tipo de lubricante recomendable">
                        <RadioGroup
                          name="horno-mov"
                          value={hornoMov}
                          onChange={setHornoMov}
                          options={[
                            {
                              label: (
                                <span className="flex items-center gap-1.5">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </svg>
                                  Cadena
                                </span>
                              ),
                              value: "cadena"
                            },
                            {
                              label: (
                                <span className="flex items-center gap-1.5">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                    <line x1="3" y1="14" x2="21" y2="14" />
                                    <path d="M6 4v16M18 4v16" />
                                  </svg>
                                  Rieles
                                </span>
                              ),
                              value: "rieles"
                            },
                            {
                              label: (
                                <span className="flex items-center gap-1.5">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  Rodajas
                                </span>
                              ),
                              value: "rodajas"
                            },
                          ]}
                        />
                        {hornoMov === "cadena" && (
                          <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "rgba(204,0,0,0.08)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: "7px" }}>
                            <p style={{ fontSize: "0.72rem", color: "var(--interlub-red)" }}>
                              ⚡ Cadena detectada ➔ Se recomienda aceite sintético alta temperatura <strong>Interchain HT-200</strong>
                            </p>
                          </div>
                        )}
                        {(hornoMov === "rieles" || hornoMov === "rodajas") && (
                          <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "rgba(124,82,165,0.08)", border: "1px solid rgba(124,82,165,0.2)", borderRadius: "7px" }}>
                            <p style={{ fontSize: "0.72rem", color: "var(--accent-purple)" }}>
                              ⚡ Rieles/Rodajas detectados ➔ Se recomienda grasa de poliurea alta temperatura <strong>Intergrease HT-3</strong>
                            </p>
                          </div>
                        )}
                      </FormField>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", marginTop: "1rem" }}>
                        <button onClick={handleSaveOven} className="btn-primary btn-interactive" style={{ fontSize: "0.775rem" }}>
                          <Save size={12} /> Guardar Movimiento
                        </button>
                        {hornoSaved && <span style={{ marginLeft: "0.5rem", fontSize: "0.775rem", color: "var(--accent-green)" }}>✓ Guardado</span>}
                      </div>
                    </div>
                    <AplicacionBlock num="7.1" titulo="Horno de Envejecimiento" catalogoId="app-10" areaId="area-6" prensa={selectedPrensa} onSave={handleSaveAppWithCollapse} productoCompetidorOptions={compOpts} productoInterlubOptions={interlubOpts} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="interlub-card" style={{ padding: "3rem", textAlign: "center" }}>
          <Wrench size={48} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.3 }} />
          <h3 style={{ marginBottom: "0.5rem" }}>No hay prensas registradas en esta planta</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            Comienza agregando la primera prensa para mapear sus aplicaciones
          </p>
          <button className="btn-primary" onClick={() => setShowPressModal(true)}>
            <Plus size={15} /> Registrar Primera Prensa
          </button>
        </div>
      )}

      {/* --- ADD PRENSA MODAL --- */}
      {showPressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="interlub-card animate-fade-in" style={{ width: "90%", maxWidth: 550, padding: "1.5rem", position: "relative" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Agregar Prensa de Extrusión</h3>
              <button onClick={() => setShowPressModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {pressModalError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "0.5rem 0.75rem", color: "#EF4444", fontSize: "0.75rem", marginBottom: "1rem" }}>
                {pressModalError}
              </div>
            )}

            <form onSubmit={handleAddPressSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Nombre de la Prensa <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(Autogenerado)</span></label>
                <input
                  className="form-input"
                  placeholder="Se generará automáticamente al seleccionar los 3 campos mínimos"
                  value={(() => {
                    const oemName = OEMS.find(o => o.id === oemIdPrensa)?.nombre || "";
                    return idInternoPrensa && oemIdPrensa && diametroPrensa ? `Prensa ${idInternoPrensa} — ${oemName} — ${diametroPrensa}` : "";
                  })()}
                  readOnly
                  disabled
                  style={{ opacity: 0.85, cursor: "not-allowed", backgroundColor: "var(--bg-secondary)", fontWeight: 600 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Identificación Interna <span style={{ color: "var(--interlub-red)" }}>*</span></label>
                  <select
                    className="form-input"
                    value={idInternoPrensa}
                    onChange={e => setIdInternoPrensa(e.target.value)}
                    required
                  >
                    <option value="">— Seleccionar ID (1-20) —</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num.toString()}>
                        Prensa {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Fabricante / OEM <span style={{ color: "var(--interlub-red)" }}>*</span></label>
                  <select className="form-input" value={oemIdPrensa} onChange={e => setOemIdPrensa(e.target.value)} required>
                    <option value="">— Seleccionar OEM —</option>
                    {OEMS.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Capacidad (Tons)</label>
                  <select className="form-input" value={capacidadPrensa} onChange={e => setCapacidadPrensa(e.target.value)}>
                    <option value="">— Seleccionar capacidad —</option>
                    {CAPACIDADES_PRENSA.map(c => <option key={c} value={c}>{c} T</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Diámetro Tocho (Billet) <span style={{ color: "var(--interlub-red)" }}>*</span></label>
                  <select className="form-input" value={diametroPrensa} onChange={e => setDiametroPrensa(e.target.value)} required>
                    <option value="">— Seleccionar diámetro —</option>
                    {DIAMETROS_BILLET.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Aleaciones que procesa (máximo 3) <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(Opcional)</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.5rem", padding: "0.625rem", border: "1px solid var(--bg-border)", borderRadius: "8px", background: "var(--bg-secondary)", marginBottom: "0.5rem" }}>
                  {ALLOY_OPTIONS.map(alloy => {
                    const isChecked = selectedAlloys.includes(alloy);
                    const isDisabled = !isChecked && selectedAlloys.length >= 3;
                    return (
                      <label key={alloy} style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: isDisabled ? "not-allowed" : "pointer", fontSize: "0.8rem", userSelect: "none", opacity: isDisabled ? 0.5 : 1 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedAlloys(prev => prev.filter(a => a !== alloy));
                            } else if (selectedAlloys.length < 3) {
                              setSelectedAlloys(prev => [...prev, alloy]);
                            }
                          }}
                          style={{ cursor: isDisabled ? "not-allowed" : "pointer", accentColor: "var(--interlub-red)" }}
                        />
                        <span>Serie {alloy}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Comentarios adicionales</label>
                <textarea
                  className="form-input"
                  placeholder="Ej: Detalles sobre el estado de la máquina, proyectos futuros, etc."
                  value={notasPrensa}
                  onChange={e => setNotasPrensa(e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowPressModal(false)} style={{ padding: "0.5rem 1rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                  <Plus size={14} /> Registrar Prensa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT LOCATION MODAL --- */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="interlub-card animate-fade-in" style={{ width: "90%", maxWidth: 500, padding: "1.5rem", position: "relative" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }} className="flex items-center gap-1.5">
                <MapPin size={18} color="var(--interlub-red)" /> Editar Ubicación de Planta
              </h3>
              <button onClick={() => setShowLocationModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {locationError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "0.5rem 0.75rem", color: "#EF4444", fontSize: "0.75rem", marginBottom: "1rem" }}>
                {locationError}
              </div>
            )}

            <form onSubmit={handleEditLocationSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Nombre de la Planta <span style={{ color: "var(--interlub-red)" }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="Ej: Planta Monterrey Norte"
                  value={editNombre}
                  onChange={e => setEditNombre(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">País</label>
                <input
                  className="form-input"
                  placeholder="Ej: México, España, Estados Unidos..."
                  value={editPais}
                  onChange={e => setEditPais(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Ciudad / Dirección</label>
                <input
                  className="form-input"
                  placeholder="Ej: Apodaca, Nuevo León"
                  value={editCiudadDireccion}
                  onChange={e => setEditCiudadDireccion(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowLocationModal(false)} style={{ padding: "0.5rem 1rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Save size={14} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {showDeleteConfirm && selectedPrensa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="interlub-card animate-fade-in" style={{ width: "90%", maxWidth: 450, padding: "1.5rem", position: "relative" }}>
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#EF4444"
              }}>
                <Trash2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>¿Eliminar prensa?</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              ¿Estás seguro de que deseas eliminar la prensa <strong>{selectedPrensa.nombreInterno}</strong>? Se perderá toda la información y mapeo de aplicaciones asociados a ella.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setShowDeleteConfirm(false)} style={{ padding: "0.5rem 1rem" }}>
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleDeleteActivePrensa} 
                className="btn-primary" 
                style={{ 
                  padding: "0.5rem 1rem", 
                  backgroundColor: "var(--interlub-red)", 
                  borderColor: "var(--interlub-red)" 
                }}
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

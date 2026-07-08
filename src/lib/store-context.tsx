"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Empresa, Planta, Prensa, Oportunidad, Puller, AplicacionLubricacion, CaptureStatus } from './types';
import { PRODUCTOS_INTERLUB, PRODUCTOS_COMPETIDORES } from './data';
import { useAuth } from './auth-context';
import { supabase } from './supabase-client';

export interface AuditLog {
  id: string;
  usuario: string;
  rol: string;
  accion: string;
  entidad: string;
  detalles: string;
  fecha: string;
  ip: string;
}

interface StoreContextType {
  empresas: Empresa[];
  plantas: Planta[];
  prensas: Prensa[];
  oportunidades: Oportunidad[];
  logs: AuditLog[];
  usuarios: User[];
  isLoading: boolean;
  
  // Operations
  addEmpresa: (empresa: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>) => Promise<Empresa | null>;
  updateEmpresa: (id: string, updates: Partial<Empresa>) => Promise<void>;
  deleteEmpresa: (id: string) => Promise<void>;
  
  addPlanta: (planta: Omit<Planta, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'pctCompletitud' | 'estadoCaptura'>) => Promise<void>;
  updatePlanta: (id: string, updates: Partial<Planta>) => Promise<void>;
  deletePlanta: (id: string) => Promise<void>;
  clearDatabase: () => Promise<void>;
  
  addPrensa: (prensa: Omit<Prensa, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'pctCompletitud' | 'estado' | 'pullers' | 'aplicaciones' | 'equiposDosificacion'>) => Promise<void>;
  updatePrensa: (id: string, updates: Partial<Prensa>) => Promise<void>;
  deletePrensa: (id: string) => Promise<void>;

  savePrensaSeccion1: (prensaId: string, data: {
    nombreInterno?: string;
    identificacionInterna: string;
    oemId: string;
    oemOtro?: string;
    modelo?: string;
    anioFabricacion?: number;
    capacidadTons?: number;
    diametroBillet?: string;
    longitudMaxCorte?: number;
    longitudMaxCorteUnidad?: string;
    aleaciones?: string[];
    efectividadPct?: number;
    oeePct?: number;
    tiempoCicloMin?: string;
    tiempoCicloMax?: string;
    produccionMensual?: number;
    proveedorTocho?: string;
  }) => Promise<void>;

  saveAplicacion: (prensaId: string, appData: {
    appNum: string; // e.g. "2.1", "3.1"
    catalogoId: string;
    areaId: string;
    estado: string;
    productoCompetidorId?: string | null;
    productoInterlubActivoId?: string | null;
    formaAplicacion?: string | null;
    metodoAplicacion?: 'manual' | 'automatico' | 'semiautomatico' | null;
    consumoEstimado?: number;
    consumoUnidad?: string;
    consumoAgrupado?: boolean;
    frecuenciaAplicacion?: string;
    camposEspeciales?: Record<string, any> | null;
  }) => Promise<void>;

  savePuller: (prensaId: string, pullerData: {
    tipo?: string;
    cantidad?: number;
    mecanismo?: 'cadena' | 'cable';
    tipoLubricacion?: 'manual' | 'automatico' | 'sin_lubricacion';
    formaAplicacion?: string;
    productoCompetidorId?: string;
    notes?: string;
  }) => Promise<void>;

  saveHornoMovimiento: (prensaId: string, movimiento: 'cadena' | 'rieles' | 'rodajas') => Promise<void>;

  saveObservaciones: (prensaId: string, observaciones: string) => Promise<void>;

  syncOportunidadHubSpot: (oppId: string) => void;
  addLog: (accion: string, entidad: string, detalles: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Mappers between Snake Case (database) and Camel Case (frontend types)
const keysToCamel = (o: any): any => {
  if (Array.isArray(o)) return o.map(keysToCamel);
  if (o !== null && typeof o === 'object') {
    const n: any = {};
    Object.keys(o).forEach(k => {
      const ck = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (k === 'campos_especiales' || k === 'camposEspeciales' || k === 'configuracion_puntos' || k === 'configuracionPuntos') {
        n[ck] = o[k];
      } else {
        n[ck] = keysToCamel(o[k]);
      }
    });
    return n;
  }
  return o;
};

const keysToSnake = (o: any): any => {
  if (Array.isArray(o)) return o.map(keysToSnake);
  if (o !== null && typeof o === 'object') {
    const n: any = {};
    Object.keys(o).forEach(k => {
      const sk = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (k === 'campos_especiales' || k === 'camposEspeciales' || k === 'configuracion_puntos' || k === 'configuracionPuntos') {
        n[sk] = o[k];
      } else {
        n[sk] = keysToSnake(o[k]);
      }
    });
    return n;
  }
  return o;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [prensas, setPrensas] = useState<Prensa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase
  const loadDatabase = async () => {
    try {
      setIsLoading(true);
      // Fetch Companies
      const { data: emps } = await supabase
        .from('empresas')
        .select('*')
        .eq('deleted', false);
      setEmpresas(keysToCamel(emps || []));

      // Fetch Profiles/Users
      const { data: profiles } = await supabase
        .from('perfiles')
        .select('*');
      setUsuarios(keysToCamel(profiles || []));

      // Fetch Plants
      const { data: plts } = await supabase
        .from('plantas')
        .select('*')
        .eq('deleted', false);
      setPlantas(keysToCamel(plts || []));

      // Fetch Presses with related pullers and applications
      const { data: prns } = await supabase
        .from('prensas')
        .select('*, pullers(*), aplicaciones_lubricacion(*)')
        .eq('deleted', false);

      const mappedPrensas = (prns || []).map((p: any) => ({
        ...keysToCamel(p),
        aplicaciones: keysToCamel(p.aplicaciones_lubricacion || []),
        pullers: keysToCamel(p.pullers || [])
      }));
      setPrensas(mappedPrensas);

      // Fetch Logs
      const { data: logList } = await supabase
        .from('audit_logs')
        .select('*')
        .order('fecha', { ascending: false });
      setLogs(keysToCamel(logList || []));
    } catch (err) {
      console.error("Error loading Supabase database:", err);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Compute Opportunities on database updates
  useEffect(() => {
    if (!initialized) return;

    const computedOpps: Oportunidad[] = [];

    prensas.forEach((prensa) => {
      const planta = plantas.find(p => p.id === prensa.plantaId);
      const empresa = empresas.find(e => e.id === planta?.empresaId);
      if (!planta || !empresa) return;

      // Get selections for this press
      const app1 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-1');
      const app2 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-2');
      const corteSeleccionado = (app1?.camposEspeciales?.corte_seleccionado || app2?.camposEspeciales?.corte_seleccionado) || '';

      const app3 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-3');
      const app4 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-4');
      const lubricacionSeleccionada = (app3?.camposEspeciales?.lubricacion_seleccionada || app4?.camposEspeciales?.lubricacion_seleccionada) || '';

      // 1. Applications with competitor or unlubricated
      prensa.aplicaciones?.forEach((app) => {
        // Skip inactive mutually exclusive applications
        if (app.catalogoAplicacionId === 'app-1' && corteSeleccionado !== 'shear') return;
        if (app.catalogoAplicacionId === 'app-2' && corteSeleccionado !== 'saw') return;
        if (app.catalogoAplicacionId === 'app-3' && lubricacionSeleccionada !== 'dummy') return;
        if (app.catalogoAplicacionId === 'app-4' && lubricacionSeleccionada !== 'billet') return;

        const appState = app.estado;
        let match = false;
        let oppType: Oportunidad['tipo'] = 'sin_cubrir';
        let valor = 0;

        if (appState === 'lubricada_competencia') {
          match = true;
          oppType = 'con_competencia';
        } else if (appState === 'sin_lubricar') {
          match = true;
          oppType = 'sin_cubrir';
        }

        if (match) {
          // Find equivalent Interlub product price
          const compProd = PRODUCTOS_COMPETIDORES.find(p => p.id === app.productoCompetidorId);
          const eqProdId = compProd?.productoInterlubEquivalenteId || app.productoInterlubActivoId;
          const refPrice = eqProdId
            ? (PRODUCTOS_INTERLUB.find(p => p.id === eqProdId)?.precioReferencia ?? 8.5)
            : 8.5;

          const cons = app.consumoEstimado ?? 150;
          valor = cons * refPrice;

          computedOpps.push({
            id: `opp-${prensa.id}-${app.catalogoAplicacionId}`,
            plantaId: planta.id,
            planta,
            aplicacionId: app.id,
            tipo: oppType,
            valorPotencialMensual: valor,
            valorPotencialAnual: valor * 12,
            prioridad: valor * 12 > 100000 ? 'alta' : 'media',
            activa: true,
            createdAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString()
          } as any);
        }
      });

      // 2. Pullers with Chain candidates for RO3
      prensa.pullers?.forEach((puller) => {
        if (puller.mecanismo === 'cadena' && puller.tipoLubricacion === 'manual') {
          computedOpps.push({
            id: `opp-${prensa.id}-puller-ro3`,
            plantaId: planta.id,
            planta,
            tipo: 'equipo_ro3',
            valorPotencialMensual: 1500,
            valorPotencialAnual: 18000,
            prioridad: 'baja',
            activa: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as any);
        }
      });
    });

    setOportunidades(computedOpps);
  }, [prensas, plantas, empresas, initialized]);

  const addLog = async (accion: string, entidad: string, detalles: string) => {
    try {
      const newLog = {
        usuario: user?.nombre || 'Anónimo',
        rol: user?.rol || 'consultor',
        accion,
        entidad,
        detalles,
        ip: '192.168.1.42'
      };

      const { data, error } = await supabase
        .from('audit_logs')
        .insert([keysToSnake(newLog)])
        .select()
        .single();

      if (!error && data) {
        setLogs(prev => [keysToCamel(data), ...prev]);
      }
    } catch (err) {
      console.error("Error creating audit log:", err);
    }
  };

  // --- COMPANIES (EMPRESAS) ---
  const addEmpresa = async (newEmp: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Promise<Empresa | null> => {
    try {
      const company = {
        ...newEmp,
        deleted: false
      };

      const { data, error } = await supabase
        .from('empresas')
        .insert([keysToSnake(company)])
        .select()
        .single();

      if (!error && data) {
        const camelData = keysToCamel(data);
        setEmpresas(prev => [...prev, camelData]);
        addLog('Creación de Empresa', 'Empresa', `Se creó la empresa "${camelData.nombreComercial}".`);

        // Crear planta principal por defecto
        await addPlanta({
          empresaId: camelData.id,
          nombre: camelData.nombreComercial,
          pais: camelData.pais,
          ciudadDireccion: camelData.ciudadEstado || "",
          notasGenerales: "Creada automáticamente al registrar la empresa.",
          areasPresentes: ["area-3"] // Extrusión
        });

        return camelData;
      } else if (error) {
        console.error("DB error adding company:", error);
        return null;
      }
      return null;
    } catch (err) {
      console.error("Error adding company:", err);
      return null;
    }
  };

  const updateEmpresa = async (id: string, updates: Partial<Empresa>) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(keysToSnake({ ...updates, updatedAt: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const camelData = keysToCamel(data);
        setEmpresas(prev => prev.map(e => e.id === id ? camelData : e));
        addLog('Actualización de Empresa', 'Empresa', `Se actualizó la empresa "${camelData.nombreComercial}".`);
      }
    } catch (err) {
      console.error("Error updating company:", err);
    }
  };

  const deleteEmpresa = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({ deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        setEmpresas(prev => prev.map(e => e.id === id ? { ...e, deleted: true } : e));
        addLog('Eliminación de Empresa (Soft Delete)', 'Empresa', `Se desactivó la empresa "${data.nombre_comercial}".`);
      }
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  // --- PLANTS (PLANTAS) ---
  const addPlanta = async (newPlt: Omit<Planta, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'pctCompletitud' | 'estadoCaptura'>) => {
    try {
      const plant = {
        ...newPlt,
        estadoCaptura: 'pendiente',
        pctCompletitud: 0,
        deleted: false
      };

      const { data, error } = await supabase
        .from('plantas')
        .insert([keysToSnake(plant)])
        .select()
        .single();

      if (!error && data) {
        const camelData = keysToCamel(data);
        setPlantas(prev => [...prev, camelData]);
        addLog('Creación de Planta', 'Planta', `Se creó la planta "${camelData.nombre}".`);
      }
    } catch (err) {
      console.error("Error adding plant:", err);
    }
  };

  const updatePlanta = async (id: string, updates: Partial<Planta>) => {
    try {
      const { data, error } = await supabase
        .from('plantas')
        .update(keysToSnake({ ...updates, updatedAt: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const camelData = keysToCamel(data);
        setPlantas(prev => prev.map(p => p.id === id ? camelData : p));
      }
    } catch (err) {
      console.error("Error updating plant:", err);
      throw err;
    }
  };

  const deletePlanta = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('plantas')
        .update({ deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        setPlantas(prev => prev.map(p => p.id === id ? { ...p, deleted: true } : p));
        addLog('Eliminación de Planta (Soft Delete)', 'Planta', `Se desactivó la planta "${data.nombre}".`);
      }
    } catch (err) {
      console.error("Error deleting plant:", err);
    }
  };

  const clearDatabase = async () => {
    try {
      setIsLoading(true);

      // Attempt hard delete first
      const { error: errPr } = await supabase.from('prensas').delete().not('id', 'is', null);
      const { error: errPl } = await supabase.from('plantas').delete().not('id', 'is', null);
      const { error: errEm } = await supabase.from('empresas').delete().not('id', 'is', null);

      if (errPr || errPl || errEm) {
        console.warn("Hard delete failed/disallowed by RLS, falling back to soft delete:", { errPr, errPl, errEm });
        
        // Fallback: soft delete all
        await supabase.from('prensas').update({ deleted: true }).not('id', 'is', null);
        await supabase.from('plantas').update({ deleted: true }).not('id', 'is', null);
        await supabase.from('empresas').update({ deleted: true }).not('id', 'is', null);
      }

      // Reset local state
      setEmpresas([]);
      setPlantas([]);
      setPrensas([]);
      setOportunidades([]);

      addLog('Vaciado de Catálogo', 'Base de Datos', 'Se eliminaron todas las empresas, plantas y prensas del catálogo.');
    } catch (err) {
      console.error("Error clearing database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PRESSES (PRENSAS) ---
  const addPrensa = async (newPrn: Omit<Prensa, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'pctCompletitud' | 'estado' | 'pullers' | 'aplicaciones' | 'equiposDosificacion'>) => {
    try {
      const prensa = {
        ...newPrn,
        estado: 'activa',
        pctCompletitud: 0,
        deleted: false
      };

      const { data, error } = await supabase
        .from('prensas')
        .insert([keysToSnake(prensa)])
        .select()
        .single();

      if (!error && data) {
        const newPrensaObj: Prensa = {
          ...keysToCamel(data),
          pullers: [],
          aplicaciones: [],
          equiposDosificacion: []
        };
        setPrensas(prev => [...prev, newPrensaObj]);
        addLog('Creación de Prensa', 'Prensa', `Se registró la prensa "${newPrensaObj.nombreInterno}".`);
        recalculatePlantCompletitud(newPrn.plantaId);
      }
    } catch (err) {
      console.error("Error adding press:", err);
    }
  };

  const updatePrensa = async (id: string, updates: Partial<Prensa>) => {
    try {
      const { data, error } = await supabase
        .from('prensas')
        .update(keysToSnake({ ...updates, updatedAt: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const camelData = keysToCamel(data);
        setPrensas(prev => prev.map(p => p.id === id ? { ...p, ...camelData } : p));
        addLog('Actualización de Prensa', 'Prensa', `Se actualizó la prensa "${camelData.nombreInterno}".`);
      }
    } catch (err) {
      console.error("Error updating press:", err);
    }
  };

  const deletePrensa = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('prensas')
        .update({ deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const camelData = keysToCamel(data);
        setPrensas(prev => prev.map(p => p.id === id ? { ...p, deleted: true } : p));
        addLog('Eliminación de Prensa (Soft Delete)', 'Prensa', `Se desactivó la prensa "${camelData.nombreInterno}".`);
        recalculatePlantCompletitud(camelData.plantaId);
      }
    } catch (err) {
      console.error("Error deleting press:", err);
    }
  };

  const recalculatePlantCompletitud = async (plantaId: string) => {
    try {
      const { data: rawPrensas } = await supabase
        .from('prensas')
        .select('*, pullers(*), aplicaciones_lubricacion(*)')
        .eq('planta_id', plantaId)
        .eq('deleted', false);

      if (!rawPrensas || rawPrensas.length === 0) {
        await updatePlanta(plantaId, { pctCompletitud: 0, estadoCaptura: 'pendiente' });
        return;
      }

      const currentPrensas = rawPrensas.map((p: any) => ({
        ...keysToCamel(p),
        aplicaciones: keysToCamel(p.aplicaciones_lubricacion || []),
        pullers: keysToCamel(p.pullers || [])
      }));

      const sum = currentPrensas.reduce((acc: number, pr: any) => acc + (pr.pctCompletitud || 0), 0);
      const avg = Math.round(sum / currentPrensas.length);

      const newStatus: CaptureStatus = avg >= 90 ? 'completa' : avg >= 10 ? 'en_progreso' : 'pendiente';

      await updatePlanta(plantaId, { pctCompletitud: avg, estadoCaptura: newStatus });
    } catch (err) {
      console.error("Error recalculating plant completitud:", err);
    }
  };

  const calculatePressCompletitud = (prensa: Prensa): number => {
    let fieldsCount = 0;
    let filledFields = 0;

    // Section 1 - General (5 key fields: ID, OEM, Capacidad, Diámetro, and Tipo/Modelo)
    const keyFields = ['identificacionInterna', 'oemId', 'capacidadTons', 'diametroBillet', 'modelo'];
    keyFields.forEach(f => {
      fieldsCount++;
      if (prensa[f as keyof Prensa]) filledFields++;
    });

    // Sections 2-7: Applications
    const app1 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-1');
    const app2 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-2');
    const corteSeleccionado = (app1?.camposEspeciales?.corte_seleccionado || app2?.camposEspeciales?.corte_seleccionado) || '';

    const app3 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-3');
    const app4 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-4');
    const lubricacionSeleccionada = (app3?.camposEspeciales?.lubricacion_seleccionada || app4?.camposEspeciales?.lubricacion_seleccionada) || '';

    const app7 = prensa.aplicaciones?.find(a => a.catalogoAplicacionId === 'app-7');
    const ubicacionSierra = app7?.camposEspeciales?.ubicacion_sierra || '';

    const requiredApps = ['app-5', 'app-7', 'app-9', 'app-10', 'app-18'];

    if (corteSeleccionado === 'shear') {
      requiredApps.push('app-1');
    } else if (corteSeleccionado === 'saw') {
      requiredApps.push('app-2');
    }

    if (lubricacionSeleccionada === 'dummy') {
      requiredApps.push('app-3');
    } else if (lubricacionSeleccionada === 'billet') {
      requiredApps.push('app-4');
    } else if (lubricacionSeleccionada === '') {
      requiredApps.push('app-3', 'app-4');
    }

    fieldsCount += requiredApps.length;
    prensa.aplicaciones?.forEach(app => {
      if (requiredApps.includes(app.catalogoAplicacionId)) {
        if (app.estado !== 'desconocido') {
          filledFields += 0.8;
          if (app.productoCompetidorId || app.productoInterlubActivoId) filledFields += 0.2;
        }
      }
    });

    // Pullers
    fieldsCount += 2;
    if (prensa.pullers && prensa.pullers.length > 0) {
      filledFields++;
      if (prensa.pullers[0].mecanismo) filledFields++;
    }

    // Section 8
    fieldsCount++;
    if (prensa.notas) filledFields++;

    return Math.min(100, Math.round((filledFields / fieldsCount) * 100));
  };

  // --- SAVE SECTION 1 ---
  const savePrensaSeccion1 = async (prensaId: string, data: any) => {
    try {
      const { data: rawPrensa } = await supabase
        .from('prensas')
        .select('*, pullers(*), aplicaciones_lubricacion(*)')
        .eq('id', prensaId)
        .single();

      if (rawPrensa) {
        const pObj = {
          ...keysToCamel(rawPrensa),
          aplicaciones: keysToCamel(rawPrensa.aplicaciones_lubricacion || []),
          pullers: keysToCamel(rawPrensa.pullers || []),
          ...data,
          updatedAt: new Date().toISOString()
        };
        pObj.pctCompletitud = calculatePressCompletitud(pObj);

        const dbObj = keysToSnake(pObj);
        delete dbObj.pullers;
        delete dbObj.aplicaciones_lubricacion;

        const { data: updatedData, error } = await supabase
          .from('prensas')
          .update(dbObj)
          .eq('id', prensaId)
          .select()
          .single();

        if (!error && updatedData) {
          setPrensas(prev => prev.map(p => p.id === prensaId ? { ...pObj, ...keysToCamel(updatedData) } : p));
          addLog('Guardado Ficha Prensa', 'Prensa', `Se guardó la Sección 1 de la prensa "${pObj.nombreInterno}".`);
          recalculatePlantCompletitud(pObj.plantaId);
        }
      }
    } catch (err) {
      console.error("Error saving press section 1:", err);
    }
  };

  // --- SAVE APLICACION ---
  const saveAplicacion = async (prensaId: string, appData: any) => {
    try {
      const { data: existing } = await supabase
        .from('aplicaciones_lubricacion')
        .select('id, created_at')
        .eq('prensa_id', prensaId)
        .eq('catalogo_aplicacion_id', appData.catalogoId)
        .single();

      const application = {
        prensaId,
        areaId: appData.areaId,
        catalogoAplicacionId: appData.catalogoId,
        estado: appData.estado,
        productoCompetidorId: appData.productoCompetidorId || null,
        productoInterlubActivoId: appData.productoInterlubActivoId || null,
        formaAplicacion: appData.formaAplicacion || '',
        metodoAplicacion: appData.metodoAplicacion || null,
        consumoEstimado: appData.consumoEstimado ? Number(appData.consumoEstimado) : null,
        consumoUnidad: appData.consumoUnidad || 'kg',
        frecuenciaAplicacion: appData.frecuenciaAplicacion || '',
        camposEspeciales: appData.camposEspeciales || null,
        updatedAt: new Date().toISOString(),
        deleted: false
      };

      let savedApp: any = null;
      if (existing) {
        const { data, error } = await supabase
          .from('aplicaciones_lubricacion')
          .update(keysToSnake(application))
          .eq('id', existing.id)
          .select()
          .single();
        if (error) {
          console.error("Error al actualizar la aplicación de lubricación en Supabase:", error);
          throw error;
        }
        savedApp = data;
      } else {
        const { data, error } = await supabase
          .from('aplicaciones_lubricacion')
          .insert([keysToSnake({ ...application, createdAt: new Date().toISOString() })])
          .select()
          .single();
        if (error) {
          console.error("Error al insertar la aplicación de lubricación en Supabase:", error);
          throw error;
        }
        savedApp = data;
      }

      if (savedApp) {
        const { data: rawPrensa } = await supabase
          .from('prensas')
          .select('*, pullers(*), aplicaciones_lubricacion(*)')
          .eq('id', prensaId)
          .single();

        if (rawPrensa) {
          const pObj = {
            ...keysToCamel(rawPrensa),
            aplicaciones: keysToCamel(rawPrensa.aplicaciones_lubricacion || []),
            pullers: keysToCamel(rawPrensa.pullers || [])
          };
          pObj.pctCompletitud = calculatePressCompletitud(pObj);

          await supabase
            .from('prensas')
            .update({ pct_completitud: pObj.pctCompletitud, updated_at: new Date().toISOString() })
            .eq('id', prensaId);

          setPrensas(prev => prev.map(p => p.id === prensaId ? pObj : p));
          addLog('Guardado Aplicación Prensa', 'Prensa', `Se guardó la aplicación "${appData.appNum}" de la prensa "${pObj.nombreInterno}".`);
          recalculatePlantCompletitud(pObj.plantaId);
        }
      }
    } catch (err) {
      console.error("Error saving lubrication app:", err);
    }
  };

  // --- SAVE PULLER ---
  const savePuller = async (prensaId: string, pullerData: any) => {
    try {
      const { data: existingList } = await supabase
        .from('pullers')
        .select('id')
        .eq('prensa_id', prensaId)
        .limit(1);

      const puller = {
        prensaId,
        tipo: pullerData.tipo || '',
        cantidad: pullerData.cantidad ? Number(pullerData.cantidad) : 1,
        mecanismo: pullerData.mecanismo || null,
        tipoLubricacion: pullerData.tipoLubricacion || 'manual',
        formaAplicacion: pullerData.formaAplicacion || '',
        productoCompetidorId: pullerData.productoCompetidorId || null,
        notes: pullerData.notes || '',
        deleted: false
      };

      let savedPuller: any = null;
      const existing = existingList && existingList.length > 0 ? existingList[0] : null;

      if (existing) {
        const { data } = await supabase
          .from('pullers')
          .update(keysToSnake(puller))
          .eq('id', existing.id)
          .select()
          .single();
        savedPuller = data;
      } else {
        const { data } = await supabase
          .from('pullers')
          .insert([keysToSnake({ ...puller, createdAt: new Date().toISOString() })])
          .select()
          .single();
        savedPuller = data;
      }

      if (savedPuller) {
        const { data: rawPrensa } = await supabase
          .from('prensas')
          .select('*, pullers(*), aplicaciones_lubricacion(*)')
          .eq('id', prensaId)
          .single();

        if (rawPrensa) {
          const pObj = {
            ...keysToCamel(rawPrensa),
            aplicaciones: keysToCamel(rawPrensa.aplicaciones_lubricacion || []),
            pullers: keysToCamel(rawPrensa.pullers || [])
          };
          pObj.pctCompletitud = calculatePressCompletitud(pObj);

          await supabase
            .from('prensas')
            .update({ pct_completitud: pObj.pctCompletitud, updated_at: new Date().toISOString() })
            .eq('id', prensaId);

          setPrensas(prev => prev.map(p => p.id === prensaId ? pObj : p));
          addLog('Guardado Puller Prensa', 'Prensa', `Se actualizó la sub-entidad Puller de la prensa "${pObj.nombreInterno}".`);
          recalculatePlantCompletitud(pObj.plantaId);
        }
      }
    } catch (err) {
      console.error("Error saving puller:", err);
    }
  };

  // --- SAVE OVEN MOVEMENT ---
  const saveHornoMovimiento = async (prensaId: string, movimiento: 'cadena' | 'rieles' | 'rodajas') => {
    try {
      const { data: existing } = await supabase
        .from('aplicaciones_lubricacion')
        .select('id, created_at, estado, producto_competidor_id, producto_interlub_activo_id')
        .eq('prensa_id', prensaId)
        .eq('catalogo_aplicacion_id', 'app-10')
        .single();

      const application = {
        prensaId,
        areaId: 'area-6',
        catalogoAplicacionId: 'app-10',
        estado: existing?.estado || 'sin_lubricar',
        productoCompetidorId: existing?.producto_competidor_id || null,
        productoInterlubActivoId: existing?.producto_interlub_activo_id || null,
        camposEspeciales: { sistema_movimiento: movimiento },
        updatedAt: new Date().toISOString(),
        deleted: false
      };

      let savedApp: any = null;
      if (existing) {
        const { data } = await supabase
          .from('aplicaciones_lubricacion')
          .update(keysToSnake(application))
          .eq('id', existing.id)
          .select()
          .single();
        savedApp = data;
      } else {
        const { data } = await supabase
          .from('aplicaciones_lubricacion')
          .insert([keysToSnake({ ...application, createdAt: new Date().toISOString() })])
          .select()
          .single();
        savedApp = data;
      }

      if (savedApp) {
        const { data: rawPrensa } = await supabase
          .from('prensas')
          .select('*, pullers(*), aplicaciones_lubricacion(*)')
          .eq('id', prensaId)
          .single();

        if (rawPrensa) {
          const pObj = {
            ...keysToCamel(rawPrensa),
            aplicaciones: keysToCamel(rawPrensa.aplicaciones_lubricacion || []),
            pullers: keysToCamel(rawPrensa.pullers || [])
          };
          pObj.pctCompletitud = calculatePressCompletitud(pObj);

          await supabase
            .from('prensas')
            .update({ pct_completitud: pObj.pctCompletitud, updated_at: new Date().toISOString() })
            .eq('id', prensaId);

          setPrensas(prev => prev.map(p => p.id === prensaId ? pObj : p));
          addLog('Guardado Movimiento Horno', 'Prensa', `Se actualizó el sistema de movimiento del Horno de la prensa "${pObj.nombreInterno}" a "${movimiento}".`);
          recalculatePlantCompletitud(pObj.plantaId);
        }
      }
    } catch (err) {
      console.error("Error saving oven movement:", err);
    }
  };

  // --- SAVE OBSERVACIONES (SECTION 8) ---
  const saveObservaciones = async (prensaId: string, observaciones: string) => {
    try {
      const { data: rawPrensa } = await supabase
        .from('prensas')
        .select('*, pullers(*), aplicaciones_lubricacion(*)')
        .eq('id', prensaId)
        .single();

      if (rawPrensa) {
        const pObj = {
          ...keysToCamel(rawPrensa),
          aplicaciones: keysToCamel(rawPrensa.aplicaciones_lubricacion || []),
          pullers: keysToCamel(rawPrensa.pullers || []),
          notas: observaciones,
          updatedAt: new Date().toISOString()
        };
        pObj.pctCompletitud = calculatePressCompletitud(pObj);

        const { error } = await supabase
          .from('prensas')
          .update({ notas: observaciones, pct_completitud: pObj.pctCompletitud, updated_at: new Date().toISOString() })
          .eq('id', prensaId);

        if (!error) {
          setPrensas(prev => prev.map(p => p.id === prensaId ? pObj : p));
          addLog('Guardado Observaciones', 'Prensa', `Se guardaron las observaciones (Sección 8) de la prensa "${pObj.nombreInterno}".`);
          recalculatePlantCompletitud(pObj.plantaId);
        }
      }
    } catch (err) {
      console.error("Error saving press notes:", err);
    }
  };

  // --- HUBSPOT SIMULATION ---
  const syncOportunidadHubSpot = (oppId: string) => {
    const opp = oportunidades.find(o => o.id === oppId);
    if (!opp) return;

    addLog('Sincronización HubSpot CRM', 'HubSpot', `Se sincronizó la oportunidad de la planta "${opp.planta?.nombre}" al CRM. Deal creado/actualizado en HubSpot.`);
  };

  return (
    <StoreContext.Provider value={{
      empresas: empresas.filter(e => !e.deleted),
      plantas: plantas.filter(p => !p.deleted),
      prensas: prensas.filter(pr => !pr.deleted),
      oportunidades: oportunidades.filter(o => o.activa),
      logs,
      usuarios,
      isLoading,
      
      addEmpresa,
      updateEmpresa,
      deleteEmpresa,
      
      addPlanta,
      updatePlanta,
      deletePlanta,
      clearDatabase,
      
      addPrensa,
      updatePrensa,
      deletePrensa,

      savePrensaSeccion1,
      saveAplicacion,
      savePuller,
      saveHornoMovimiento,
      saveObservaciones,
      
      syncOportunidadHubSpot,
      addLog,
      refreshData: loadDatabase
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

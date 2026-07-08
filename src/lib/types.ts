// ============================================================
// TYPES — Plataforma Global de Extrusión de Aluminio Interlub
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export type UserRole = 'direccion' | 'coordinador' | 'consultor';

export type CompanyType = 'cliente_activo' | 'prospecto' | 'ex_cliente';

export type CaptureStatus = 'completa' | 'en_progreso' | 'pendiente';

export type PressStatus = 'activa' | 'inactiva' | 'en_mantenimiento';

export type AppStatus =
  | 'lubricada_interlub'
  | 'lubricada_competencia'
  | 'sin_lubricar'
  | 'desconocido';

export type AppMethod = 'manual' | 'automatico' | 'semiautomatico';

export type ProductUnit = 'litro' | 'kg' | 'galon';

export type DosingCategory = 'ro3' | 'terceros';

export type OppType =
  | 'sin_cubrir'
  | 'con_competencia'
  | 'parcialmente_cubierta'
  | 'equipo_ro3';



export type ConversionProb = 'alta' | 'media' | 'baja' | 'convertida';

export type PullerMechanism = 'cadena' | 'cable';

export type LubricationType = 'manual' | 'automatico' | 'sin_lubricacion';

export type EquipmentStatus = 'activo' | 'inactivo' | 'en_mantenimiento';

export type HovenMovement = 'cadena' | 'rieles' | 'rodajas';

// ─── Core Entities ────────────────────────────────────────────

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface OEM {
  id: string;
  nombre: string;
  paisOrigen: string;
  sitioWeb?: string;
  activo: boolean;
}

export interface Area {
  id: string;
  nombre: string;
  nombreEn: string;
  descripcion?: string;
  esPersonalizada: boolean;
  activa: boolean;
  orden: number;
}

export interface CatalogoAplicacion {
  id: string;
  areaId: string;
  nombre: string;
  nombreEn?: string;
  nombreFormularioFisico: string;
  descripcion?: string;
  sinonimos?: string[];
  camposEspeciales?: Record<string, unknown>;
  activa: boolean;
  orden: number;
}

export interface ProductoInterlub {
  id: string;
  nombreComercial: string;
  familia: string;
  descripcionTecnica?: string;
  viscosidad?: string;
  puntoInflamacion?: string;
  baseLubricante?: string;
  certificaciones?: string[];
  beneficiosClave?: string;
  precioReferencia?: number;
  unidad: ProductUnit;
  tdsUrl?: string;
  sdsUrl?: string;
  activo: boolean;
}

export interface ProductoCompetidor {
  id: string;
  marca: string;
  nombreProducto?: string;
  viscosidad?: string;
  baseLubricante?: string;
  notas?: string;
  productoInterlubEquivalenteId?: string;
  productoInterlubEquivalente?: ProductoInterlub;
}

export interface Empresa {
  id: string;
  nombreComercial: string;
  razonSocial?: string;
  pais?: string;
  ciudadEstado?: string;
  tipo: CompanyType;
  segmento: string;
  contactoNombre?: string;
  contactoPuesto?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  hubspotId?: string;
  consultorId?: string;
  consultor?: User;
  plantas?: Planta[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface Planta {
  id: string;
  empresaId: string;
  empresa?: Empresa;
  nombre: string;
  pais?: string;
  ciudadDireccion?: string;
  numPrensas?: number;
  areasPresentes?: string[];
  estadoCaptura: CaptureStatus;
  pctCompletitud: number;
  notasGenerales?: string;
  prensas?: Prensa[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface Prensa {
  id: string;
  plantaId: string;
  planta?: Planta;
  nombreInterno: string;
  identificacionInterna?: string;
  oemId?: string;
  oem?: OEM;
  oemOtro?: string;
  modelo?: string;
  anioFabricacion?: number;
  paisOrigen?: string;
  capacidadTons?: number;
  diametroBillet?: string;
  longitudMaxCorte?: number;
  longitudMaxCorteUnidad?: string;
  aleaciones?: string[];
  proveedorTocho?: string;
  tiempoCicloMin?: string;
  tiempoCicloMax?: string;
  tiempoCicloProm?: string;
  efectividadPct?: number;
  oeePct?: number;
  produccionMensual?: number;
  produccionAnual?: number;
  estado: PressStatus;
  pctCompletitud: number;
  notas?: string;
  pullers?: Puller[];
  aplicaciones?: AplicacionLubricacion[];
  equiposDosificacion?: EquipoDosificacion[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface Puller {
  id: string;
  prensaId: string;
  tipo?: string;
  cantidad?: number;
  mecanismo?: PullerMechanism;
  tipoLubricacion?: LubricationType;
  formaAplicacion?: string;
  productoCompetidorId?: string;
  productoCompetidor?: ProductoCompetidor;

  notas?: string;
  notes?: string;
  deleted: boolean;
  createdAt: string;
}

export interface AplicacionLubricacion {
  id: string;
  prensaId: string;
  areaId: string;
  area?: Area;
  catalogoAplicacionId: string;
  catalogoAplicacion?: CatalogoAplicacion;
  estado: AppStatus;
  productoCompetidorId?: string;
  productoCompetidor?: ProductoCompetidor;
  productoInterlubActivoId?: string;
  productoInterlubActivo?: ProductoInterlub;

  formaAplicacion?: string;
  metodoAplicacion?: AppMethod;
  consumoEstimado?: number;
  consumoUnidad?: string;
  consumoAgrupado?: boolean;
  frecuenciaAplicacion?: string;
  equipoDosificacionId?: string;
  potencialEconomicoMensual?: number;
  probabilidadConversion?: ConversionProb;
  camposEspeciales?: Record<string, unknown>;
  notasTecnicas?: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface EquipoDosificacion {
  id: string;
  prensaId: string;
  categoria: DosingCategory;
  marcaModelo?: string;
  fabricante?: string;
  numPuntosTotal?: number;
  puntosActivos?: number;
  configuracionPuntos?: Record<string, string>;
  flujoPorPunto?: string;
  estado: EquipmentStatus;
  fechaInstalacion?: string;
  notas?: string;
  deleted: boolean;
  createdAt: string;
}

export interface Oportunidad {
  id: string;
  plantaId: string;
  planta?: Planta;
  aplicacionId?: string;
  tipo: OppType;
  valorPotencialMensual?: number;
  valorPotencialAnual?: number;
  prioridad?: string;
  hubspotDealId?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}



// ─── Dashboard KPIs ───────────────────────────────────────────

export interface DashboardKPIs {
  totalEmpresas: number;
  totalPlantas: number;
  totalPrensas: number;
  potencialTotalAnual: number;
  potencialCaptadoAnual: number;
  potencialPendienteAnual: number;
  walletCapturePct: number;
  oportunidadesActivas: number;
  capturaCompletaPct: number;
}

export interface ConsultorKPIs {
  empresasAsignadas: number;
  plantasConCaptura: number;
  pctCompletitudPromedio: number;
  oportunidadesDetectadas: number;
  potencialMisEmpresas: number;
}

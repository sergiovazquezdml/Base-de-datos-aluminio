// ============================================================
// SEED DATA — Catálogos base de la plataforma
// ============================================================

import type { OEM, Area, CatalogoAplicacion, ProductoInterlub, ProductoCompetidor, Empresa, Planta, Prensa, User } from './types';

// ─── OEMs ────────────────────────────────────────────────────

export const OEMS: OEM[] = [
  { id: 'oem-1',  nombre: 'SMS Group',              paisOrigen: 'Alemania',     activo: true },
  { id: 'oem-2',  nombre: 'Presezzi Extrusion',     paisOrigen: 'Italia',       activo: true },
  { id: 'oem-3',  nombre: 'Cometal Engineering',    paisOrigen: 'Italia',       activo: true },
  { id: 'oem-4',  nombre: 'Danieli Breda',          paisOrigen: 'Italia',       activo: true },
  { id: 'oem-5',  nombre: 'Omav',                   paisOrigen: 'Italia',       activo: true },
  { id: 'oem-6',  nombre: 'Turla',                  paisOrigen: 'Italia',       activo: true },
  { id: 'oem-7',  nombre: 'Extral',                 paisOrigen: 'Italia',       activo: true },
  { id: 'oem-8',  nombre: 'UBE Industries',         paisOrigen: 'Japón',        activo: true },
  { id: 'oem-9',  nombre: 'Ube Machinery',          paisOrigen: 'Japón',        activo: true },
  { id: 'oem-10', nombre: 'Kobe Steel',             paisOrigen: 'Japón',        activo: true },
  { id: 'oem-11', nombre: 'Furukawa Electric',      paisOrigen: 'Japón',        activo: true },
  { id: 'oem-12', nombre: 'Sutton Engineering',     paisOrigen: 'Reino Unido',  activo: true },
  { id: 'oem-13', nombre: 'Farrel Pomini',          paisOrigen: 'Reino Unido',  activo: true },
  { id: 'oem-14', nombre: 'Loomis Products',        paisOrigen: 'Estados Unidos', activo: true },
  { id: 'oem-15', nombre: 'Granco Clark',           paisOrigen: 'Estados Unidos', activo: true },
  { id: 'oem-16', nombre: 'Technica-Guss',          paisOrigen: 'Alemania',     activo: true },
  { id: 'oem-17', nombre: 'SECO/WARWICK',           paisOrigen: 'Polonia',      activo: true },
  { id: 'oem-18', nombre: 'Giansu (Jiangsu)',       paisOrigen: 'China',        activo: true },
  { id: 'oem-19', nombre: 'Mei Ruey',               paisOrigen: 'Taiwán / China', activo: true },
  { id: 'oem-20', nombre: 'Kautec',                 paisOrigen: 'Italia',       activo: true },
  { id: 'oem-21', nombre: 'Bongioanni',             paisOrigen: 'Italia',       activo: true },
  { id: 'oem-22', nombre: 'Gasparini',              paisOrigen: 'Italia',       activo: true },
  { id: 'oem-23', nombre: 'HMI / Hydraulics Made in Italy', paisOrigen: 'Italia', activo: true },
  { id: 'oem-24', nombre: 'Inductotherm',           paisOrigen: 'Estados Unidos', activo: true },
  { id: 'oem-25', nombre: 'Hertwich Engineering',   paisOrigen: 'Austria',      activo: true },
];

// ─── Áreas de Planta ─────────────────────────────────────────

export const AREAS: Area[] = [
  { id: 'area-1', nombre: 'Área de Billet (Tochos)',   nombreEn: 'Billet Area',       descripcion: 'Almacenamiento y preparación de tochos de aluminio', esPersonalizada: false, activa: true, orden: 1 },
  { id: 'area-2', nombre: 'Área de Hornos',            nombreEn: 'Furnace Area',       descripcion: 'Calentamiento de tochos y herramientas', esPersonalizada: false, activa: true, orden: 2 },
  { id: 'area-3', nombre: 'Área de Extrusión',         nombreEn: 'Extrusion Area',     descripcion: 'Prensas de extrusión y equipos asociados', esPersonalizada: false, activa: true, orden: 3 },
  { id: 'area-4', nombre: 'Área de Estirado',          nombreEn: 'Stretching Area',    descripcion: 'Enderezado y tensado del perfil extruido', esPersonalizada: false, activa: true, orden: 4 },
  { id: 'area-5', nombre: 'Área de Corte',             nombreEn: 'Cutting Area',       descripcion: 'Corte del perfil a medida', esPersonalizada: false, activa: true, orden: 5 },
  { id: 'area-6', nombre: 'Área de Envejecimiento',    nombreEn: 'Aging Area',         descripcion: 'Tratamiento térmico post-extrusión', esPersonalizada: false, activa: true, orden: 6 },
  { id: 'area-7', nombre: 'Área de Acabado',           nombreEn: 'Finishing Area',     descripcion: 'Pintura, anodizado, empaque', esPersonalizada: false, activa: true, orden: 7 },
];

// ─── Catálogo de Aplicaciones ─────────────────────────────────

export const CATALOGO_APLICACIONES: CatalogoAplicacion[] = [
  // Sección A — Corte de Barra
  { id: 'app-1',  areaId: 'area-3', nombre: 'Hot Shear (corte de barra/billet con cizalla)', nombreEn: 'Hot Shear (corte de barra/billet con cizalla)', nombreFormularioFisico: 'Hot Shear (corte de barra/billet con cizalla)', descripcion: 'Cizalla caliente para corte del lingote/tocho', sinonimos: [],                                orden: 1, activa: true },
  { id: 'app-2',  areaId: 'area-3', nombre: 'Hot Saw (corte de barra/billet en caliente)', nombreEn: 'Hot Saw (corte de barra/billet en caliente)', nombreFormularioFisico: 'Hot Saw (corte de barra/billet en caliente)', descripcion: 'Sierra caliente alternativa al Hot Shear', sinonimos: [],                                   orden: 2, activa: true },
  // Sección B — Extrusión de Tocho
  { id: 'app-3',  areaId: 'area-3', nombre: 'Dummy Block / Cabeza de Stem',               nombreEn: 'Dummy Block / Stem Head', nombreFormularioFisico: 'Dummy Block / Cabeza de Stem',                         descripcion: 'Bloque empujador que contacta directamente el tocho', sinonimos: [],                        orden: 3, activa: true },
  { id: 'app-4',  areaId: 'area-3', nombre: 'Lingote / Tocho (Billet)',                   nombreEn: 'Billet Lubrication',     nombreFormularioFisico: 'Lingota / Tocho',                                       descripcion: 'Lubricación del tocho antes de extrusión', sinonimos: ['Billet'],                           orden: 4, activa: true },
  { id: 'app-5',  areaId: 'area-3', nombre: 'Cuchilla de Corte de Culotes / Galleta / Residuo', nombreEn: 'Butt Shear',      nombreFormularioFisico: 'Cuchilla de Corte de Culotes / Galleta / Residuo',       descripcion: 'Cuchilla que corta el residuo de aluminio del contenedor', sinonimos: ['Culotes', 'Galleta', 'Residuo', 'Butt'], orden: 5, activa: true },
  // Sección C — Sierra de Corte en Caliente
  { id: 'app-6',  areaId: 'area-3', nombre: 'Puller / Jalador',                           nombreEn: 'Puller',                 nombreFormularioFisico: 'Puller / Jalador',                                      descripcion: 'Sistema de jalado del perfil extruido', sinonimos: ['Jalador'],                              orden: 6, activa: true },
  { id: 'app-7',  areaId: 'area-3', nombre: 'Sierra de Corte de Perfil en Caliente',      nombreEn: 'Hot Profile Saw',        nombreFormularioFisico: 'Sierra de Corte de Perfil en Caliente',                descripcion: 'Sierra que corta el perfil a temperatura elevada a la salida de la prensa', sinonimos: [],  orden: 7, activa: true },
  // Sección D — Mesa de Tensado
  { id: 'app-8',  areaId: 'area-4', nombre: 'Mesa de Tensado (Stretcher)',                nombreEn: 'Stretcher',              nombreFormularioFisico: 'Mesa de Tensado',                                       descripcion: 'Sistema de estirado y enderezado del perfil extruido', sinonimos: ['Stretcher'],             orden: 8, activa: true },
  // Sección E — Sierra en Frío
  { id: 'app-9',  areaId: 'area-5', nombre: 'Sierra de Corte de Perfil en Frío',          nombreEn: 'Cold Profile Saw',       nombreFormularioFisico: 'Sierra de Corte de Perfil en Frío',                    descripcion: 'Corte final del perfil a temperatura ambiente', sinonimos: [],                               orden: 9, activa: true },
  // Sección F — Horno de Envejecimiento
  { id: 'app-10', areaId: 'area-6', nombre: 'Horno de Envejecimiento',                    nombreEn: 'Aging Oven',             nombreFormularioFisico: 'Horno de Envejecimiento',                               descripcion: 'Tratamiento térmico de los perfiles extruidos', sinonimos: [],                               orden: 10, activa: true, camposEspeciales: { sistema_movimiento: { tipo: 'enum', opciones: ['cadena', 'rieles', 'rodajas'] } } },
  // Sección G — Área de Billet
  { id: 'app-11', areaId: 'area-1', nombre: 'Billet Saw / Sierra de Tocho (en frío)',     nombreEn: 'Billet Saw',             nombreFormularioFisico: 'Billet Saw',                                            descripcion: 'Corte de tochos a longitud requerida antes del calentamiento', sinonimos: [],               orden: 11, activa: true },
  { id: 'app-12', areaId: 'area-1', nombre: 'Cadenas de Transportador de Billet',         nombreEn: 'Billet Conveyor Chains', nombreFormularioFisico: 'Cadenas de Transportador de Billet',                   descripcion: 'Cadenas de arrastre del sistema de carga de tochos', sinonimos: [],                          orden: 12, activa: true },
  { id: 'app-13', areaId: 'area-2', nombre: 'Rodillos de Horno de Tocho',                 nombreEn: 'Billet Furnace Rollers', nombreFormularioFisico: 'Rodillos de Horno de Tocho',                            descripcion: 'Rodillos transportadores dentro del horno de calentamiento', sinonimos: [],                  orden: 13, activa: true },
  { id: 'app-14', areaId: 'area-1', nombre: 'Empujador de Billet',                        nombreEn: 'Billet Pusher',          nombreFormularioFisico: 'Empujador de Billet',                                   descripcion: 'Sistema mecánico de carga del tocho a la prensa', sinonimos: [],                           orden: 14, activa: true },
  // Sección H — Área de Acabado
  { id: 'app-15', areaId: 'area-7', nombre: 'Cadenas de Línea de Pintura',                nombreEn: 'Paint Line Chains',      nombreFormularioFisico: 'Cadenas de Línea de Pintura',                          descripcion: 'Cadenas transportadoras en proceso de pintura electrostática', sinonimos: [],                orden: 15, activa: true },
  { id: 'app-16', areaId: 'area-7', nombre: 'Guías de Línea de Anodizado',                nombreEn: 'Anodizing Line Guides',  nombreFormularioFisico: 'Guías de Línea de Anodizado',                          descripcion: 'Guías y contactos en proceso de anodizado', sinonimos: [],                                   orden: 16, activa: true },
  { id: 'app-17', areaId: 'area-7', nombre: 'Carros de Envejecimiento',                   nombreEn: 'Aging Carts',            nombreFormularioFisico: 'Carros de Envejecimiento',                             descripcion: 'Rodillos y ruedas de carros que transportan perfiles al horno', sinonimos: [],              orden: 17, activa: true },
];

// ─── Catálogo de Capacidades de Prensa (toneladas) ───────────

export const CAPACIDADES_PRENSA = [
  500, 630, 800, 1000, 1100, 1250, 1350, 1450, 1600, 1800,
  2000, 2200, 2500, 2750, 3000, 3300, 3600, 4000, 4500, 5000,
  5500, 6000, 7500, 10000,
];

// ─── Catálogo de Diámetros de Tocho (pulgadas) ───────────────

export const DIAMETROS_BILLET = [
  '2"', '3"', '4"', '5"', '6"', '7"', '8"', '9"', '10"',
  '11"', '12"', '13"', '14"', '15"', '16"', '17"', '18"',
  '19"', '20"',
];

// ─── Productos Interlub (semilla) ─────────────────────────────

export const PRODUCTOS_INTERLUB: ProductoInterlub[] = [
  { id: 'pi-1', nombreComercial: 'Interforge KI-C',     familia: 'Lubricantes para extrusión', descripcionTecnica: 'Lubricante de alta temperatura para extrusión de aluminio. Alta resistencia a temperatura y compatibilidad validada con prensas SMS.', viscosidad: 'ISO VG 46', puntoInflamacion: '240°C', baseLubricante: 'Sintética', precioReferencia: 8.50, unidad: 'litro', activo: true, beneficiosClave: 'Alta resistencia a temperatura, compatible con SMS Group, reduce desgaste del dummy block' },
  { id: 'pi-8', nombreComercial: 'Interforge KI',       familia: 'Lubricantes para extrusión', descripcionTecnica: 'Lubricante de alta temperatura para extrusión.', viscosidad: 'ISO VG 46', puntoInflamacion: '230°C', baseLubricante: 'Sintética', precioReferencia: 8.00, unidad: 'litro', activo: true, beneficiosClave: 'Excelente lubricación' },
  { id: 'pi-14', nombreComercial: 'Interoil Cut Al',     familia: 'Fluidos de corte',           descripcionTecnica: 'Lubricante especializado para sierras y cortes de aluminio.', viscosidad: 'ISO VG 12', puntoInflamacion: '185°C', baseLubricante: 'Sintética', precioReferencia: 7.90, unidad: 'litro', activo: true, beneficiosClave: 'Optimizado para aleaciones de aluminio, evita adhesión' },
  { id: 'pi-12', nombreComercial: 'Interoil Cut HT LV',  familia: 'Fluidos de corte',           descripcionTecnica: 'Lubricante premium de baja viscosidad para corte en caliente.', viscosidad: 'ISO VG 10', puntoInflamacion: '190°C', baseLubricante: 'Sintética', precioReferencia: 8.10, unidad: 'litro', activo: true, beneficiosClave: 'Excelente disipación de calor, acabado limpio' },
  { id: 'pi-13', nombreComercial: 'Interoil Cut HT MV',  familia: 'Fluidos de corte',           descripcionTecnica: 'Lubricante premium de viscosidad media para corte en caliente.', viscosidad: 'ISO VG 15', puntoInflamacion: '200°C', baseLubricante: 'Sintética', precioReferencia: 8.15, unidad: 'litro', activo: true, beneficiosClave: 'Excelente lubricidad y balance de viscosidad' },
  { id: 'pi-7', nombreComercial: 'Interoil Cut HTV',    familia: 'Fluidos de corte',           descripcionTecnica: 'Lubricante premium para corte de tocho/barra en caliente.', viscosidad: 'ISO VG 22', puntoInflamacion: '210°C', baseLubricante: 'Sintética', precioReferencia: 8.20, unidad: 'litro', activo: true, beneficiosClave: 'Excelente lubricidad, sin residuos sólidos en dados, extiende vida útil de cuchillas' },
  { id: 'pi-15', nombreComercial: 'Interoil Cut HTE',    familia: 'Fluidos de corte',           descripcionTecnica: 'Lubricante premium de alta estabilidad térmica para corte.', viscosidad: 'ISO VG 32', puntoInflamacion: '220°C', baseLubricante: 'Sintética', precioReferencia: 8.30, unidad: 'litro', activo: true, beneficiosClave: 'Extrema estabilidad a altas temperaturas, prolonga vida de herramienta' },
  { id: 'pi-16', nombreComercial: 'Thermaplex LCM 2',    familia: 'Grasas industriales',        descripcionTecnica: 'Grasa compleja de litio de alto rendimiento para rodamientos y condiciones extremas.', viscosidad: 'NLGI 2', puntoInflamacion: '250°C', baseLubricante: 'Mineral', precioReferencia: 7.80, unidad: 'kg', activo: true, beneficiosClave: 'Excelente estabilidad al cizallamiento, alta resistencia al lavado por agua, protección anticorrosiva' },
  { id: 'pi-17', nombreComercial: 'Cad Tex HT 220',      familia: 'Lubricantes de cadena',      descripcionTecnica: 'Lubricante sintético para cadenas sometidas a altas temperaturas en hornos y sistemas transportadores.', viscosidad: 'ISO VG 220', puntoInflamacion: '280°C', baseLubricante: 'Sintética', precioReferencia: 11.20, unidad: 'litro', activo: true, beneficiosClave: 'Mínima evaporación, sin formación de lodos o carbón, excelente lubricidad a alta temperatura' },
  { id: 'pi-18', nombreComercial: 'Cad Tex HtT 320',     familia: 'Lubricantes de cadena',      descripcionTecnica: 'Aceite sintético de alta viscosidad para lubricación de cadenas a temperaturas extremadamente altas.', viscosidad: 'ISO VG 320', puntoInflamacion: '300°C', baseLubricante: 'Sintética', precioReferencia: 12.50, unidad: 'litro', activo: true, beneficiosClave: 'Estabilidad superior a la oxidación, excelente adherencia, prolonga la vida de la cadena' }
];

// ─── Productos Competidores (semilla) ─────────────────────────

export const PRODUCTOS_COMPETIDORES: ProductoCompetidor[] = [
  { id: 'pc-1', marca: 'Quaker Houghton', nombreProducto: 'Lotemp 149',    viscosidad: 'ISO VG 46', baseLubricante: 'Mineral', productoInterlubEquivalenteId: 'pi-1' },
  { id: 'pc-2', marca: 'Fuchs',          nombreProducto: 'Renolin Unisyn', viscosidad: 'ISO VG 32', baseLubricante: 'Sintética', productoInterlubEquivalenteId: 'pi-8' },
  { id: 'pc-3', marca: 'Henkel',         nombreProducto: 'Bonderite L-FM', viscosidad: 'ISO VG 15', baseLubricante: 'Mineral', productoInterlubEquivalenteId: 'pi-13' },
  { id: 'pc-4', marca: 'Castrol',        nombreProducto: 'Tribol 1510',    viscosidad: 'ISO VG 150', baseLubricante: 'Mineral EP', productoInterlubEquivalenteId: 'pi-17' },
  { id: 'pc-5', marca: 'Shell',          nombreProducto: 'Gadus S2 V220',  viscosidad: 'NLGI 2',    baseLubricante: 'Litio complejo', productoInterlubEquivalenteId: 'pi-16' },
];

// ─── Mock Users ───────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: 'u-1', nombre: 'Sergio Vazquez',     email: 'sergio.vazquez@interlub.com', rol: 'direccion',   activo: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'u-2', nombre: 'Ruben Leal',        email: 'ruben.leal@interlub.com', rol: 'coordinador', activo: true, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'u-3', nombre: 'Héctor Huari',      email: 'hector.huari@interlub.com', rol: 'consultor',   activo: true, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'u-4', nombre: 'Hadia Yuseff',      email: 'hyuseff@interlub.com',    rol: 'consultor',   activo: true, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'u-5', nombre: 'Maritza Sanchez',   email: 'maritza.sanchez@interlub.com', rol: 'consultor', activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-6', nombre: 'Humberto Ramirez',  email: 'hramirez@interlub.com',  rol: 'consultor',   activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-7', nombre: 'Jesus Lopez',       email: 'jesus.lopez@interlub.com', rol: 'consultor',  activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-8', nombre: 'Erika Leija',       email: 'eleija@interlub.com',    rol: 'consultor',   activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-9', nombre: 'Felipe Hixcalo',    email: 'hsandoval@interlub.com', rol: 'consultor',   activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-10', nombre: 'Lucia Zezatti',    email: 'lzezatti@interlub.com',  rol: 'consultor',   activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-11', nombre: 'Maria Rodiño',      email: 'mrodino@interlub.com',    rol: 'coordinador', activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-12', nombre: 'Marc Freudenberg',  email: 'mfreudenberg@interlub.com', rol: 'coordinador', activo: true, createdAt: '2024-02-15T00:00:00Z' },
  { id: 'u-13', nombre: 'Eva León',          email: 'eva.leon@interlub.com',   rol: 'consultor',   activo: true, createdAt: '2024-02-15T00:00:00Z' },
];

// ─── Mock Empresas ────────────────────────────────────────────

export const MOCK_EMPRESAS: Empresa[] = [
  {
    id: 'emp-1', nombreComercial: 'Aluminios Monterrey SA de CV', razonSocial: 'Aluminios Monterrey SA de CV',
    pais: 'México', ciudadEstado: 'Monterrey, Nuevo León', tipo: 'cliente_activo', segmento: 'Extrusión de aluminio',
    contactoNombre: 'Ing. Pedro Torres', contactoPuesto: 'Director de Operaciones',
    contactoEmail: 'ptorres@alumtrey.mx', contactoTelefono: '+52 81 8347 2900',
    consultorId: 'u-3', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-11-20T00:00:00Z', deleted: false,
  },
  {
    id: 'emp-2', nombreComercial: 'Al-Extrude India Pvt Ltd', razonSocial: 'Al-Extrude India Private Limited',
    pais: 'India', ciudadEstado: 'Gujarat, Ahmedabad', tipo: 'prospecto', segmento: 'Extrusión de aluminio',
    contactoNombre: 'Mr. Rajesh Patel', contactoPuesto: 'Plant Manager',
    contactoEmail: 'rpatel@alextrude.in', contactoTelefono: '+91 79 2657 4400',
    consultorId: 'u-4', createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z', deleted: false,
  },
  {
    id: 'emp-3', nombreComercial: 'Gulf Aluminum Trading LLC', razonSocial: 'Gulf Aluminum Trading LLC',
    pais: 'Emiratos Árabes', ciudadEstado: 'Dubai, Industrial Area', tipo: 'prospecto', segmento: 'Extrusión de aluminio',
    contactoNombre: 'Mr. Ahmed Al-Rashid', contactoPuesto: 'Operations Director',
    contactoEmail: 'arashid@gulfalum.ae', contactoTelefono: '+971 4 887 5500',
    consultorId: 'u-3', createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-12-10T00:00:00Z', deleted: false,
  },
  {
    id: 'emp-4', nombreComercial: 'Perfiles de Aluminio del Bajío', razonSocial: 'Perfiles de Aluminio del Bajío SA de CV',
    pais: 'México', ciudadEstado: 'León, Guanajuato', tipo: 'cliente_activo', segmento: 'Extrusión de aluminio',
    contactoNombre: 'Ing. Laura Vega', contactoPuesto: 'Gerente de Planta',
    contactoEmail: 'lvega@palobajio.mx', contactoTelefono: '+52 47 7716 3300',
    consultorId: 'u-5', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-11-30T00:00:00Z', deleted: false,
  },
  {
    id: 'emp-5', nombreComercial: 'Alumex Australia Pty Ltd', razonSocial: 'Alumex Australia Pty Ltd',
    pais: 'Australia', ciudadEstado: 'Melbourne, Victoria', tipo: 'prospecto', segmento: 'Extrusión de aluminio',
    contactoNombre: 'Mr. David Chen', contactoPuesto: 'Technical Director',
    contactoEmail: 'dchen@alumex.au', contactoTelefono: '+61 3 9421 7800',
    consultorId: 'u-4', createdAt: '2024-10-01T00:00:00Z', updatedAt: '2024-12-05T00:00:00Z', deleted: false,
  },
];

// ─── Mock Plantas ─────────────────────────────────────────────

export const MOCK_PLANTAS: Planta[] = [
  {
    id: 'plt-1', empresaId: 'emp-1', nombre: 'Planta Monterrey Norte',
    pais: 'México', ciudadDireccion: 'Av. Industrial 4500, Parque Industrial Las Américas, Monterrey NL',
    numPrensas: 4, areasPresentes: ['area-1','area-2','area-3','area-4','area-5','area-6'],
    estadoCaptura: 'en_progreso', pctCompletitud: 67,
    notasGenerales: 'Planta principal, opera 3 turnos. Próxima expansión de 2 prensas en Q2 2025.',
    createdAt: '2024-03-05T00:00:00Z', updatedAt: '2024-11-20T00:00:00Z', deleted: false,
  },
  {
    id: 'plt-2', empresaId: 'emp-1', nombre: 'Planta Guadalajara',
    pais: 'México', ciudadDireccion: 'Carretera a El Salto Km 3.5, El Salto, Jalisco',
    numPrensas: 2, areasPresentes: ['area-3','area-4','area-5'],
    estadoCaptura: 'en_progreso', pctCompletitud: 35,
    notasGenerales: 'Planta secundaria, opera 2 turnos. Enfocada en perfiles arquitectónicos.',
    createdAt: '2024-03-10T00:00:00Z', updatedAt: '2024-10-15T00:00:00Z', deleted: false,
  },
  {
    id: 'plt-3', empresaId: 'emp-2', nombre: 'Gujarat Plant 1',
    pais: 'India', ciudadDireccion: 'GIDC Industrial Estate, Phase 4, Ahmedabad, Gujarat 382445',
    numPrensas: 6, areasPresentes: ['area-1','area-2','area-3','area-4','area-5','area-6','area-7'],
    estadoCaptura: 'en_progreso', pctCompletitud: 30,
    notasGenerales: 'Planta de alta capacidad. Principalmente perfil industrial y automotriz. Requiere visita de seguimiento.',
    createdAt: '2024-06-20T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z', deleted: false,
  },
  {
    id: 'plt-4', empresaId: 'emp-4', nombre: 'Planta León',
    pais: 'México', ciudadDireccion: 'Zona Industrial Franja, Blvd. del Campesino 4000, León Gto',
    numPrensas: 3, areasPresentes: ['area-3','area-4','area-5','area-6'],
    estadoCaptura: 'completa', pctCompletitud: 92,
    notasGenerales: 'Planta completamente auditada. Todas las aplicaciones cubiertas con productos Interlub.',
    createdAt: '2024-01-25T00:00:00Z', updatedAt: '2024-11-30T00:00:00Z', deleted: false,
  },
];

// ─── Mock Prensas ─────────────────────────────────────────────

export const MOCK_PRENSAS: Prensa[] = [
  {
    id: 'prn-1', plantaId: 'plt-1', nombreInterno: 'Prensa 1 — SMS 2500T',
    identificacionInterna: 'P-01', oemId: 'oem-1', modelo: 'Direct Extrusion 2500',
    anioFabricacion: 2018, paisOrigen: 'Alemania', capacidadTons: 2500,
    diametroBillet: '8"', longitudMaxCorte: 650, longitudMaxCorteUnidad: 'mm',
    aleaciones: ['6063', '6061', '6005A'], proveedorTocho: 'Constellium',
    tiempoCicloMin: '1:45', tiempoCicloMax: '3:30', tiempoCicloProm: '2:20',
    efectividadPct: 88, oeePct: 82, produccionMensual: 480, produccionAnual: 5760,
    estado: 'activa', pctCompletitud: 85, notas: 'Prensa principal, mayor productividad de la planta.',
    createdAt: '2024-03-10T00:00:00Z', updatedAt: '2024-11-18T00:00:00Z', deleted: false,
  },
  {
    id: 'prn-2', plantaId: 'plt-1', nombreInterno: 'Prensa 2 — Presezzi 1800T',
    identificacionInterna: 'P-02', oemId: 'oem-2', modelo: 'Multihole 1800',
    anioFabricacion: 2015, paisOrigen: 'Italia', capacidadTons: 1800,
    diametroBillet: '7"', longitudMaxCorte: 550, longitudMaxCorteUnidad: 'mm',
    aleaciones: ['6063', '6060'], proveedorTocho: 'Hydro',
    tiempoCicloMin: '2:00', tiempoCicloMax: '4:00', tiempoCicloProm: '2:45',
    efectividadPct: 85, oeePct: 79, produccionMensual: 380, produccionAnual: 4560,
    estado: 'activa', pctCompletitud: 72, notas: 'Prensa multihole para perfiles pequeños.',
    createdAt: '2024-03-12T00:00:00Z', updatedAt: '2024-11-15T00:00:00Z', deleted: false,
  },
  {
    id: 'prn-3', plantaId: 'plt-4', nombreInterno: 'Prensa A — Turla 3000T',
    identificacionInterna: 'LN-A', oemId: 'oem-6', modelo: 'TURLA 3000',
    anioFabricacion: 2020, paisOrigen: 'Italia', capacidadTons: 3000,
    diametroBillet: '10"', longitudMaxCorte: 800, longitudMaxCorteUnidad: 'mm',
    aleaciones: ['6063', '6061', '6082'], proveedorTocho: 'Aleris',
    tiempoCicloMin: '1:30', tiempoCicloMax: '3:00', tiempoCicloProm: '2:00',
    efectividadPct: 91, oeePct: 87, produccionMensual: 620, produccionAnual: 7440,
    estado: 'activa', pctCompletitud: 96, notas: 'Prensa más nueva y eficiente de la planta. Completamente documentada.',
    createdAt: '2024-01-28T00:00:00Z', updatedAt: '2024-11-28T00:00:00Z', deleted: false,
  },
];

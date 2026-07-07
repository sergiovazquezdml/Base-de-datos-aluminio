const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MOCK_EMPRESAS = [
  {
    id: '11111111-1111-1111-1111-111111111111', nombre_comercial: 'Aluminios Monterrey SA de CV', razon_social: 'Aluminios Monterrey SA de CV',
    pais: 'México', ciudad_estado: 'Monterrey, Nuevo León', tipo: 'cliente_activo', segmento: 'Extrusión de aluminio',
    contacto_nombre: 'Ing. Pedro Torres', contacto_puesto: 'Director de Operaciones',
    contacto_email: 'ptorres@alumtrey.mx', contacto_telefono: '+52 81 8347 2900',
    consultor_id: 'cd6a4eda-49e4-4aa4-995f-3cb97d0e54dd', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z', deleted: false,
  },
  {
    id: '22222222-2222-2222-2222-222222222222', nombre_comercial: 'Al-Extrude India Pvt Ltd', razon_social: 'Al-Extrude India Private Limited',
    pais: 'India', ciudad_estado: 'Gujarat, Ahmedabad', tipo: 'prospecto', segmento: 'Extrusión de aluminio',
    contacto_nombre: 'Mr. Rajesh Patel', contacto_puesto: 'Plant Manager',
    contacto_email: 'rpatel@alextrude.in', contacto_telefono: '+91 79 2657 4400',
    consultor_id: '9850ca6b-a3c0-4434-87e0-cea917b9742e', created_at: '2024-06-15T00:00:00Z', updated_at: '2024-12-01T00:00:00Z', deleted: false,
  },
  {
    id: '33333333-3333-3333-3333-333333333333', nombre_comercial: 'Gulf Aluminum Trading LLC', razon_social: 'Gulf Aluminum Trading LLC',
    pais: 'Emiratos Árabes', ciudad_estado: 'Dubai, Industrial Area', tipo: 'prospecto', segmento: 'Extrusión de aluminio',
    contacto_nombre: 'Mr. Ahmed Al-Rashid', contacto_puesto: 'Operations Director',
    contacto_email: 'arashid@gulfalum.ae', contacto_telefono: '+971 4 887 5500',
    consultor_id: 'cd6a4eda-49e4-4aa4-995f-3cb97d0e54dd', created_at: '2024-09-01T00:00:00Z', updated_at: '2024-12-10T00:00:00Z', deleted: false,
  },
  {
    id: '44444444-4444-4444-4444-444444444444', nombre_comercial: 'Perfiles de Aluminio del Bajío', razon_social: 'Perfiles de Aluminio del Bajío SA de CV',
    pais: 'México', ciudad_estado: 'León, Guanajuato', tipo: 'cliente_activo', segmento: 'Extrusión de aluminio',
    contacto_nombre: 'Ing. Laura Vega', contacto_puesto: 'Gerente de Planta',
    contacto_email: 'lvega@palobajio.mx', contacto_telefono: '+52 47 7716 3300',
    consultor_id: '93eb0c80-7852-486d-b9a5-34f59e496746', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-11-30T00:00:00Z', deleted: false,
  },
  {
    id: '55555555-5555-5555-5555-555555555555', nombre_comercial: 'Alumex Australia Pty Ltd', razon_social: 'Alumex Australia Pty Ltd',
    pais: 'Australia', ciudad_estado: 'Melbourne, Victoria', tipo: 'prospecto', segmento: 'Extrusión de aluminio',
    contacto_nombre: 'Mr. David Chen', contacto_puesto: 'Technical Director',
    contacto_email: 'dchen@alumex.au', contacto_telefono: '+61 3 9421 7800',
    consultor_id: '9850ca6b-a3c0-4434-87e0-cea917b9742e', created_at: '2024-10-01T00:00:00Z', updated_at: '2024-12-05T00:00:00Z', deleted: false,
  },
];

const MOCK_PLANTAS = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', empresa_id: '11111111-1111-1111-1111-111111111111', nombre: 'Planta Monterrey Norte',
    pais: 'México', ciudad_direccion: 'Av. Industrial 4500, Parque Industrial Las Américas, Monterrey NL',
    num_prensas: 4, areas_presentes: ['area-1','area-2','area-3','area-4','area-5','area-6'],
    estado_captura: 'en_progreso', pct_completitud: 67,
    notas_generales: 'Planta principal, opera 3 turnos. Próxima expansión de 2 prensas en Q2 2025.',
    created_at: '2024-03-05T00:00:00Z', updated_at: '2024-11-20T00:00:00Z', deleted: false,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', empresa_id: '11111111-1111-1111-1111-111111111111', nombre: 'Planta Guadalajara',
    pais: 'México', ciudad_direccion: 'Carretera a El Salto Km 3.5, El Salto, Jalisco',
    num_prensas: 2, areas_presentes: ['area-3','area-4','area-5'],
    estado_captura: 'en_progreso', pct_completitud: 35,
    notas_generales: 'Planta secundaria, opera 2 turnos. Enfocada en perfiles arquitectónicos.',
    created_at: '2024-03-10T00:00:00Z', updated_at: '2024-10-15T00:00:00Z', deleted: false,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', empresa_id: '22222222-2222-2222-2222-222222222222', nombre: 'Gujarat Plant 1',
    pais: 'India', ciudad_direccion: 'GIDC Industrial Estate, Phase 4, Ahmedabad, Gujarat 382445',
    num_prensas: 6, areas_presentes: ['area-1','area-2','area-3','area-4','area-5','area-6','area-7'],
    estado_captura: 'en_progreso', pct_completitud: 30,
    notas_generales: 'Planta de alta capacidad. Principalmente perfil industrial y automotriz. Requiere visita de seguimiento.',
    created_at: '2024-06-20T00:00:00Z', updated_at: '2024-12-01T00:00:00Z', deleted: false,
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', empresa_id: '44444444-4444-4444-4444-444444444444', nombre: 'Planta León',
    pais: 'México', ciudad_direccion: 'Zona Industrial Franja, Blvd. del Campesino 4000, León Gto',
    num_prensas: 3, areas_presentes: ['area-3','area-4','area-5','area-6'],
    estado_captura: 'completa', pct_completitud: 92,
    notas_generales: 'Planta completamente auditada. Todas las aplicaciones cubiertas con productos Interlub.',
    created_at: '2024-01-25T00:00:00Z', updated_at: '2024-11-30T00:00:00Z', deleted: false,
  },
];

const MOCK_PRENSAS = [
  {
    id: '99999999-9999-9999-9999-999999999991', planta_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', nombre_interno: 'Prensa 1 — SMS 2500T',
    identificacion_interna: 'P-01', oem_id: 'oem-1', modelo: 'Direct Extrusion 2500',
    anio_fabricacion: 2018, capacidad_tons: 2500,
    diametro_billet: '8"', longitud_max_corte: 650, longitud_max_corte_unidad: 'mm',
    aleaciones: ['6063', '6061', '6005A'], proveedor_tocho: 'Constellium',
    tiempo_ciclo_min: '1:45', tiempo_ciclo_max: '3:30', tiempo_ciclo_prom: '2:20',
    efectividad_pct: 88, oee_pct: 82, produccion_mensual: 480, produccion_anual: 5760,
    estado: 'activa', pct_completitud: 85, notas: 'Prensa principal, mayor productividad de la planta.',
    created_at: '2024-03-10T00:00:00Z', updated_at: '2024-11-18T00:00:00Z', deleted: false,
  },
  {
    id: '99999999-9999-9999-9999-999999999992', planta_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', nombre_interno: 'Prensa 2 — Presezzi 1800T',
    identificacion_interna: 'P-02', oem_id: 'oem-2', modelo: 'Multihole 1800',
    anio_fabricacion: 2015, capacidad_tons: 1800,
    diametro_billet: '7"', longitud_max_corte: 550, longitud_max_corte_unidad: 'mm',
    aleaciones: ['6063', '6060'], proveedor_tocho: 'Hydro',
    tiempo_ciclo_min: '2:00', tiempo_ciclo_max: '4:00', tiempo_ciclo_prom: '2:45',
    efectividad_pct: 85, oee_pct: 79, produccion_mensual: 380, produccion_anual: 4560,
    estado: 'activa', pct_completitud: 72, notas: 'Prensa multihole para perfiles pequeños.',
    created_at: '2024-03-12T00:00:00Z', updated_at: '2024-11-15T00:00:00Z', deleted: false,
  },
  {
    id: '99999999-9999-9999-9999-999999999993', planta_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', nombre_interno: 'Prensa A — Turla 3000T',
    identificacion_interna: 'LN-A', oem_id: 'oem-6', modelo: 'TURLA 3000',
    anio_fabricacion: 2020, capacidad_tons: 3000,
    diametro_billet: '10"', longitud_max_corte: 800, longitud_max_corte_unidad: 'mm',
    aleaciones: ['6063', '6061', '6082'], proveedor_tocho: 'Aleris',
    tiempo_ciclo_min: '1:30', tiempo_ciclo_max: '3:00', tiempo_ciclo_prom: '2:00',
    efectividad_pct: 91, oee_pct: 87, produccion_mensual: 620, produccion_anual: 7440,
    estado: 'activa', pct_completitud: 96, notas: 'Prensa más nueva y eficiente de la planta. Completamente documentada.',
    created_at: '2024-01-28T00:00:00Z', updated_at: '2024-11-28T00:00:00Z', deleted: false,
  },
];

async function seed() {
  try {
    console.log('Seeding Mock Empresas...');
    const { error: errEmp } = await supabase.from('empresas').upsert(MOCK_EMPRESAS);
    if (errEmp) throw errEmp;
    console.log('Successfully seeded empresas!');

    console.log('Seeding Mock Plantas...');
    const { error: errPlt } = await supabase.from('plantas').upsert(MOCK_PLANTAS);
    if (errPlt) throw errPlt;
    console.log('Successfully seeded plantas!');

    console.log('Seeding Mock Prensas...');
    const { error: errPrn } = await supabase.from('prensas').upsert(MOCK_PRENSAS);
    if (errPrn) throw errPrn;
    console.log('Successfully seeded prensas!');

    console.log('Database seeding successfully completed!');
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
  }
}

seed();

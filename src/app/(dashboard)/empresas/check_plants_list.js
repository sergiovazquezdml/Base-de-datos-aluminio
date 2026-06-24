const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: plants, error: err } = await supabase
    .from('plantas')
    .select('*, empresas(nombre_comercial, contacto_telefono, ciudad_estado)')
    .eq('deleted', false);

  if (err) {
    console.error("Error fetching plants:", err);
    return;
  }

  console.log(`Fetched ${plants.length} active plants.`);
  plants.forEach(p => {
    const comp = p.empresas || {};
    console.log(`- Plant ID: ${p.id}`);
    console.log(`  Plant Name: "${p.nombre}"`);
    console.log(`  Location: "${p.pais}" | City: "${p.ciudad_direccion}"`);
    console.log(`  Company: "${comp.nombre_comercial}" | Phone: "${comp.contacto_telefono}" | City: "${comp.ciudad_estado}"`);
    console.log('---');
  });
}

run();

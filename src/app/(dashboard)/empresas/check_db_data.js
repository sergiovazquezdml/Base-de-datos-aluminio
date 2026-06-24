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
  console.log("Signing in as cmendoza@interlub.com...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'cmendoza@interlub.com',
    password: 'demo123'
  });

  if (authErr) {
    console.error("Auth failed:", authErr);
    return;
  }
  console.log("Auth succeeded! User ID:", authData.user.id);
  const { data: companies, error: err1 } = await supabase
    .from('empresas')
    .select('*');

  if (err1) {
    console.error("Error fetching companies:", err1);
    return;
  }

  console.log(`Total companies in DB: ${companies ? companies.length : 0}`);
  console.log("Sample companies:");
  if (companies) {
    companies.slice(0, 15).forEach(c => {
      console.log(`- ID: ${c.id} | Name: ${c.nombre_comercial} | Country: ${c.pais} | City: ${c.ciudad_estado} | Deleted: ${c.deleted}`);
    });
  }

  const { data: plants, error: err2 } = await supabase
    .from('plantas')
    .select('*');

  if (err2) {
    console.error("Error fetching plants:", err2);
    return;
  }

  console.log(`\nTotal plants in DB: ${plants ? plants.length : 0}`);
  console.log("Sample plants:");
  if (plants) {
    plants.slice(0, 15).forEach(p => {
      console.log(`- Name: ${p.nombre} | Country: ${p.pais} | City: ${p.ciudad_direccion} | Deleted: ${p.deleted}`);
    });
  }
}

run();

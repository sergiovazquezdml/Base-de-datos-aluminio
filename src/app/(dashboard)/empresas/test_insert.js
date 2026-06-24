const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const testCompany = {
    nombre_comercial: 'Test Company Antigravity',
    pais: 'España',
    ciudad_estado: 'Madrid',
    tipo: 'prospecto',
    segmento: 'Extrusión de aluminio',
    deleted: false
  };

  console.log("Attempting to insert:", testCompany);
  const { data, error } = await supabase
    .from('empresas')
    .insert([testCompany])
    .select();

  if (error) {
    console.error("Insert failed with error:", error);
  } else {
    console.log("Insert succeeded. Created data:", data);
    
    // Clean up
    if (data && data[0]) {
      const { error: delError } = await supabase
        .from('empresas')
        .delete()
        .eq('id', data[0].id);
      if (delError) {
        console.error("Cleanup failed:", delError);
      } else {
        console.log("Cleanup succeeded.");
      }
    }
  }
}

testInsert();

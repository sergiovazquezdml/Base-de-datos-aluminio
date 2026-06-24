const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL is missing in .env.local");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local.");
  console.error("Please add it to .env.local to run this admin seed script.");
  process.exit(1);
}

// Initialize Supabase with the service role key to bypass RLS and Auth confirmation restrictions
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USERS_TO_SEED = [
  { nombre: 'Sergio Vazquez', email: 'sergio.vazquez@interlub.com', rol: 'direccion' },
  { nombre: 'Ruben Leal', email: 'ruben.leal@interlub.com', rol: 'coordinador' },
  { nombre: 'Héctor Huari', email: 'hector.huari@interlub.com', rol: 'consultor' },
  { nombre: 'Hadia Yuseff', email: 'hyuseff@interlub.com', rol: 'consultor' },
  { nombre: 'Maritza Sanchez', email: 'maritza.sanchez@interlub.com', rol: 'consultor' },
  { nombre: 'Humberto Ramirez', email: 'hramirez@interlub.com', rol: 'consultor' },
  { nombre: 'Jesus Lopez', email: 'jesus.lopez@interlub.com', rol: 'consultor' },
  { nombre: 'Erika Leija', email: 'eleija@interlub.com', rol: 'consultor' },
  { nombre: 'Felipe Hixcalo', email: 'hsandoval@interlub.com', rol: 'consultor' },
  { nombre: 'Lucia Zezatti', email: 'lzezatti@interlub.com', rol: 'consultor' },
  { nombre: 'Maria Rodiño', email: 'mrodino@interlub.com', rol: 'coordinador' },
  { nombre: 'Marc Freudenberg', email: 'mfreudenberg@interlub.com', rol: 'coordinador' },
  { nombre: 'Eva León', email: 'eva.leon@interlub.com', rol: 'consultor' },
];

async function seed() {
  console.log(`Starting to seed ${USERS_TO_SEED.length} users into Supabase...`);

  for (const user of USERS_TO_SEED) {
    console.log(`\nProcessing user: ${user.nombre} (${user.email})...`);

    // 1. Check if user already exists in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error(`Error listing users:`, listError.message);
      continue;
    }

    const userPassword = user.email.split('@')[0];
    let authUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());

    if (!authUser) {
      console.log(`User does not exist in Auth. Creating with password: ${userPassword}...`);
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          nombre: user.nombre,
          rol: user.rol
        }
      });

      if (createError) {
        console.error(`Failed to create Auth user:`, createError.message);
        continue;
      }
      authUser = createData.user;
      console.log(`Created Auth user with ID: ${authUser.id}`);
    } else {
      console.log(`User already exists in Auth (ID: ${authUser.id}). Updating password to: ${userPassword}...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: userPassword
      });

      if (updateError) {
        console.error(`Failed to update Auth user password:`, updateError.message);
      } else {
        console.log(`Updated Auth user password successfully.`);
      }
    }

    // 2. Check/Upsert profile in perfiles table
    const profile = {
      id: authUser.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: true
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from('perfiles')
      .upsert([profile])
      .select();

    if (upsertError) {
      console.error(`Failed to upsert profile:`, upsertError.message);
    } else {
      console.log(`Profile successfully synced for ${user.nombre}!`);
    }
  }

  console.log("\nDatabase seeding completed!");
}

seed();

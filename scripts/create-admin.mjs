// Script para criar usuário admin no Supabase
// Uso: node scripts/create-admin.mjs
//
// Requires environment variables (set in .env or shell):
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY
//   ADMIN_EMAIL       (default: gabriel@arauz.com.br)
//   ADMIN_PASSWORD     (no default — must be provided)
//   ADMIN_FULL_NAME   (default: Gabriel Cristofolini)

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT_ID = process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'ERROR: Missing required environment variables.\n' +
    'Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.\n\n' +
    'Example:\n' +
    '  $env:SUPABASE_URL="https://xxx.supabase.co"        # PowerShell\n' +
    '  $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."             # PowerShell\n' +
    '  $env:ADMIN_PASSWORD="YourSecurePassword"            # PowerShell\n' +
    '  node scripts/create-admin.mjs'
  );
  process.exit(1);
}

const adminUser = {
  email: process.env.ADMIN_EMAIL || 'gabriel@arauz.com.br',
  password: process.env.ADMIN_PASSWORD,
  full_name: process.env.ADMIN_FULL_NAME || 'Gabriel Cristofolini'
};

if (!adminUser.password) {
  console.error(
    'ERROR: ADMIN_PASSWORD environment variable is required.\n' +
    'Never hardcode passwords in scripts.'
  );
  process.exit(1);
}

async function createAdminUser() {
  console.log('Creating admin user on Supabase...\n');
  
  // 1. Criar usuario no Auth
  console.log('[1/2] Creating user in Supabase Auth...');
  
  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminUser.full_name
      }
    })
  });
  
  const authData = await authResponse.json();
  
  if (!authResponse.ok) {
    console.error('Error creating user:', authData);
    
    // Se usuario ja existe, tentar buscar
    if (authData.msg?.includes('already been registered') || authData.code === 'email_exists') {
      console.log('User already exists. Fetching ID...');
      
      const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(adminUser.email)}`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });
      
      const listData = await listResponse.json();
      if (listData.users?.length > 0) {
        const userId = listData.users[0].id;
        console.log(`User found: ${userId}`);
        await createProfile(userId);
        return;
      }
    }
    return;
  }
  
  const userId = authData.id;
  console.log(`User created with ID: ${userId}\n`);
  
  // 2. Criar profile
  await createProfile(userId);
}

async function createProfile(userId) {
  console.log('[2/2] Creating profile with admin role...');
  
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: userId,
      tenant_id: TENANT_ID,
      email: adminUser.email,
      full_name: adminUser.full_name,
      role: 'admin',
      is_active: true
    })
  });
  
  if (!profileResponse.ok) {
    const errorData = await profileResponse.json();
    console.error('Error creating profile:', errorData);
    
    // Verificar se profile ja existe
    if (errorData.code === '23505') {
      console.log('Profile already exists.');
    }
    return;
  }
  
  const profileData = await profileResponse.json();
  console.log('Profile created successfully!\n');
  
  // Resumo
  console.log('===================================================');
  console.log('              ADMIN USER CREATED                    ');
  console.log('===================================================');
  console.log(`  ID:       ${userId}`);
  console.log(`  Email:    ${adminUser.email}`);
  console.log(`  Name:     ${adminUser.full_name}`);
  console.log(`  Role:     admin`);
  console.log(`  Tenant:   ${TENANT_ID}`);
  console.log('===================================================');
  console.log('\n  IMPORTANT: Store the password in a safe place!');
  console.log('  Change the password after first login.\n');
}

createAdminUser().catch(console.error);

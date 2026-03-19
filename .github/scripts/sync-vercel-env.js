#!/usr/bin/env node

/**
 * Sync Environment Variables from GitHub Secrets to Vercel
 *
 * This script reads GitHub secrets and syncs them to Vercel via API
 * Runs automatically on push to main or manual trigger
 *
 * Required GitHub Secrets:
 * - VERCEL_TOKEN (Vercel API token with full access)
 * - VERCEL_ORG_ID (Organization ID from Vercel)
 * - VERCEL_PROJECT_ID (Project ID from Vercel)
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const https = require('https');

// Environment variables from GitHub Actions context
const {
  VERCEL_TOKEN,
  VERCEL_ORG_ID,
  VERCEL_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// Validate required env vars
const required = [
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

// Environment variables to sync to Vercel
const envVarsToSync = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: SUPABASE_URL,
    type: 'production', // or 'preview', 'development'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: SUPABASE_ANON_KEY,
    type: 'production',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: SUPABASE_SERVICE_ROLE_KEY,
    type: 'production',
  },
];

/**
 * Make HTTP request to Vercel API
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Get existing environment variables from Vercel
 */
async function getExistingEnvVars() {
  const path = `/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_ORG_ID}`;
  const response = await makeRequest('GET', path);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch env vars: ${response.status}`);
  }

  return response.data.envs || [];
}

/**
 * Delete environment variable from Vercel
 */
async function deleteEnvVar(envId) {
  const path = `/v10/projects/${VERCEL_PROJECT_ID}/env/${envId}?teamId=${VERCEL_ORG_ID}`;
  const response = await makeRequest('DELETE', path);

  if (response.status !== 200) {
    console.warn(`⚠️  Failed to delete env var ${envId}: ${response.status}`);
  } else {
    console.log(`✅ Deleted old env var`);
  }
}

/**
 * Create or update environment variable in Vercel
 */
async function syncEnvVar(envVar) {
  const { key, value, type } = envVar;

  try {
    // Get existing vars to check if var exists
    const existing = await getExistingEnvVars();
    const existingVar = existing.find(
      (e) => e.key === key && e.target?.includes(type)
    );

    // Delete old version if exists
    if (existingVar) {
      console.log(`🔄 Updating ${key}...`);
      await deleteEnvVar(existingVar.id);
    } else {
      console.log(`➕ Creating ${key}...`);
    }

    // Create new env var
    const body = {
      key,
      value,
      type: 'encrypted',
      target: [type],
    };

    const path = `/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_ORG_ID}`;
    const response = await makeRequest('POST', path, body);

    if (response.status === 201) {
      console.log(`✅ Successfully synced ${key}`);
      return true;
    } else {
      console.error(`❌ Failed to sync ${key}: ${response.status}`);
      console.error(response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error syncing ${key}:`, error.message);
    return false;
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('🚀 Syncing environment variables to Vercel...\n');

  const results = [];
  for (const envVar of envVarsToSync) {
    const success = await syncEnvVar(envVar);
    results.push({ key: envVar.key, success });
  }

  console.log('\n📊 Sync Summary:');
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.error('\n⚠️  Some environment variables failed to sync.');
    process.exit(1);
  } else {
    console.log('\n🎉 All environment variables synced successfully!');
    process.exit(0);
  }
}

// Run
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

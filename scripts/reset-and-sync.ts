
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

// Manual env var loading
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
} catch (e) {
    console.warn('⚠️ .env.local not found, trying .env');
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    } catch (e2) {
        console.warn('⚠️ .env not found, relying on process.env');
    }
}

// Import project logic (using relative paths)
import { executeSyncAll } from '../src/lib/sync/espaider-sync';
import { createServiceClient } from '../src/lib/supabase/service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Env vars not found!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function truncateTables() {
    console.log('🗑️ Cleaning database tables...');

    // Disable RLS/Foreign Key checks if possible? No, standard postgres.
    // Must delete in order.

    const tables = [
        'project_histories',
        'project_approvers',
        'project_budgets',
        'project_phases',
        'project_schedules',
        'project_deliveries',
        'project_requirements',
        'project_notes',
        'projects'
    ];

    for (const table of tables) {
        console.log(`   Deleting from ${table}...`);
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) {
            // If 'id' is not the PK or doesn't exist, try a different condition or generic delete
            // projects uses 'id' UUID.
            // Some child tables might utilize compound keys or different PKs.
            // 'neq' with a distinct UUID usually works to match all.
            // Alternatively, use .gt('id', '00000000-0000-0000-0000-000000000000') (if UUID)

            console.warn(`   ⚠️ Error deleting from ${table}: ${error.message}. Trying allow-all policy...`);
            // If it fails, manual truncate via SQL might be needed if RLS blocks 'delete all' rows.
            // But we are using SERVICE ROLE key, so RLS is bypassed.
        }
    }
}

async function main() {
    try {
        // 1. Cleanup
        await truncateTables();

        console.log('\n🔄 Starting Sync...');

        // 2. Sync
        // We need a tenant ID.
        // Assuming a default tenant ID or fetching one.
        // The route.ts used a hardcoded ID for now or fetched from profile.
        // Let's fetch the first tenant from 'tenants' table.
        const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
        const tenantId = tenants?.[0]?.id || '00000000-0000-0000-0000-000000000001';

        console.log(`   Using Tenant ID: ${tenantId}`);

        const result = await executeSyncAll(supabase, tenantId);

        console.log('\n✅ Sync Result:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();

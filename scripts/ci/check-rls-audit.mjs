import { createClient } from '@supabase/supabase-js';

function fail(message) {
  console.error(`[rls-audit] ${message}`);
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) fail('Missing SUPABASE_URL');
if (!serviceRoleKey) fail('Missing SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase
  .from('rls_audit_summary')
  .select('table_name, audit_status, total_policies, service_role_policies')
  .order('table_name', { ascending: true });

if (error) {
  fail(`Failed to query rls_audit_summary: ${error.message}`);
}

if (!data || data.length === 0) {
  fail('RLS audit returned no rows');
}

const critical = data.filter((row) => String(row.audit_status || '').includes('CRITICAL'));
const warns = data.filter((row) => String(row.audit_status || '').includes('WARN'));

console.log('[rls-audit] Summary');
for (const row of data) {
  console.log(
    `- ${row.table_name}: ${row.audit_status} (policies=${row.total_policies}, service=${row.service_role_policies})`,
  );
}

if (warns.length > 0) {
  console.warn(`[rls-audit] WARN count: ${warns.length}`);
}

if (critical.length > 0) {
  fail(`CRITICAL findings detected: ${critical.length}`);
}

console.log('[rls-audit] PASS - no CRITICAL findings');


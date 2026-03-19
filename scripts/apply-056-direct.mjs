#!/usr/bin/env node
/**
 * Apply Migration 056 directly using Supabase Admin API
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials");
  console.error("SUPABASE_URL:", SUPABASE_URL);
  console.error("SERVICE_ROLE_KEY:", SERVICE_ROLE_KEY ? "exists" : "missing");
  process.exit(1);
}

console.log("✅ Credentials loaded");
console.log(`   URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Read SQL from inline definition instead of file
const migrationSQL = `
-- PARTE 1: Expand sync_logs dataset constraint
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));

-- PARTE 2: Expand integration_log_entries dataset constraint
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));
`;

async function executeSQL(sql) {
  console.log("\n⏳ Executing SQL...");
  console.log(sql);
  console.log("\n");

  try {
    // Use postgres.js direct connection through admin API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql_exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        sql: sql,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Request failed: ${response.status}`);
      console.error(errorText);
      return false;
    }

    const result = await response.json();
    console.log("✅ SQL executed successfully");
    return true;
  } catch (err) {
    console.error("❌ Execution error:", err.message);
    return false;
  }
}

async function testInsert() {
  console.log("\n🧪 Testing insert with HorasLancadas...");

  const { error, data } = await supabase
    .from("integration_log_entries")
    .insert([
      {
        tenant_id: "00000000-0000-0000-0000-000000000001",
        request_id: "MIGRATION-TEST-056",
        level: "info",
        dataset: "HorasLancadas",
        message: "Migration 056 verification test",
        logged_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error("❌ Test insert failed:", error.message);
    return false;
  }

  console.log("✅ Insert successful!");
  console.log(`   Inserted: ${data?.length || 0} record(s)`);

  // Cleanup
  await supabase
    .from("integration_log_entries")
    .delete()
    .eq("request_id", "MIGRATION-TEST-056");

  return true;
}

async function main() {
  console.log("=" + "=".repeat(70));
  console.log("🚀 Applying Migration 056 to Supabase Production");
  console.log("=" + "=".repeat(70));

  // Execute migration SQL
  const sqlSuccess = await executeSQL(migrationSQL);
  if (!sqlSuccess) {
    console.log("\n⚠️  SQL execution via RPC not available");
    console.log("📋 Please execute this SQL manually in Supabase SQL Editor:");
    console.log(
      "\nhttps://app.supabase.com/project/pybmawlwpmxshtccpqui/sql\n"
    );
    console.log(migrationSQL);
    process.exit(0);
  }

  // Test the migration
  const testSuccess = await testInsert();
  if (!testSuccess) {
    console.log(
      "\n⚠️  Migration executed but test failed. Check Supabase manually."
    );
    process.exit(1);
  }

  console.log("\n" + "=".repeat(72));
  console.log("🎉 MIGRATION 056 SUCCESSFULLY APPLIED!");
  console.log("=".repeat(72));
  console.log("\n✅ integration_log_entries now accepts HorasLancadas");
  console.log("✅ sync_logs now accepts HorasLancadas + TempoPermanencia");
  console.log(
    "\n→ Next: Retry synchronization from https://tech-arauz.vercel.app/integracoes\n"
  );
}

main().catch(console.error);

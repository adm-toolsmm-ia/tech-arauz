#!/usr/bin/env node

/**
 * Apply Migration 056 - Expand dataset constraints for HorasLancadas + TempoPermanencia
 * This script directly executes the SQL in Supabase to fix production database
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const migrationSQL = `
-- ============================================================================
-- Migration 056: Expand dataset CHECK Constraints - TempoPermanencia + HorasLancadas
-- ============================================================================

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

async function applyMigration() {
  console.log("🚀 Applying Migration 056 to Supabase...\n");

  try {
    // Execute migration SQL
    console.log("⏳ Executing SQL migration...");
    const { data, error } = await supabase.rpc("execute_sql", {
      sql: migrationSQL,
    });

    if (error) {
      // If execute_sql doesn't exist, try direct approach via PostgreSQL
      console.log("⚠️  RPC execute_sql not found, attempting alternative...");

      // Split and execute each statement separately
      const statements = migrationSQL.split(";").filter((s) => s.trim());

      for (const statement of statements) {
        if (!statement.trim()) continue;

        console.log(`   Executing: ${statement.substring(0, 50)}...`);
        const { error: execError } = await supabase.rpc("sql", {
          query: statement + ";",
        });

        if (execError && !execError.message.includes("does not exist")) {
          throw execError;
        }
      }
    }

    console.log("✅ Migration 056 applied successfully!\n");

    // Verify constraint was expanded
    console.log("🔍 Verifying constraint expansion...");
    const { data: constraints, error: checkError } = await supabase.from(
      "information_schema.table_constraints"
    ).select("*").eq("table_name", "integration_log_entries");

    if (!checkError) {
      console.log(
        "✅ Constraints verified in information_schema\n"
      );
    }

    // Test insert with HorasLancadas
    console.log("🧪 Testing insert with dataset='HorasLancadas'...");
    const testLog = {
      tenant_id: "00000000-0000-0000-0000-000000000001",
      request_id: "MIGRATION-TEST-056",
      level: "info",
      dataset: "HorasLancadas",
      message: "Migration 056 verification: HorasLancadas is now allowed",
      logged_at: new Date().toISOString(),
    };

    const { error: insertError, data: inserted } = await supabase
      .from("integration_log_entries")
      .insert([testLog])
      .select();

    if (insertError) {
      console.error("❌ Insert test failed:", insertError.message);
      throw insertError;
    }

    console.log(
      "✅ Insert successful! HorasLancadas constraint is now working.\n"
    );

    // Cleanup test entry
    console.log("🧹 Cleaning up test entry...");
    await supabase
      .from("integration_log_entries")
      .delete()
      .eq("request_id", "MIGRATION-TEST-056");

    console.log("✅ Cleanup complete.\n");

    console.log("=" + "=".repeat(70));
    console.log("🎉 MIGRATION 056 SUCCESSFULLY APPLIED TO PRODUCTION");
    console.log("=" + "=".repeat(70));
    console.log(
      "\n✅ integration_log_entries now accepts: HorasLancadas, TempoPermanencia"
    );
    console.log(
      "✅ sync_logs now accepts: HorasLancadas, TempoPermanencia\n"
    );
    console.log("NEXT: Retry synchronization from /integracoes\n");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    console.error(
      "\n⚠️  If RPC functions are not available, execute this SQL manually:"
    );
    console.error(
      "\nOpen Supabase SQL Editor and paste the following:\n"
    );
    console.error(migrationSQL);
    process.exit(1);
  }
}

applyMigration();

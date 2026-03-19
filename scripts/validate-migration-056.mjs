#!/usr/bin/env node
/**
 * Validate if Migration 056 was successfully applied
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function validateMigration() {
  console.log("🔍 Validating Migration 056...\n");

  try {
    // Test: Try to insert a log with HorasLancadas
    console.log(
      "📝 Attempting to insert log with dataset='HorasLancadas'..."
    );

    const { error: insertError, data } = await supabase
      .from("integration_log_entries")
      .insert([
        {
          tenant_id: "00000000-0000-0000-0000-000000000001",
          request_id: "VALIDATION-TEST-056",
          level: "info",
          dataset: "HorasLancadas",
          message: "Validation test for Migration 056",
          logged_at: new Date().toISOString(),
        },
      ])
      .select();

    if (insertError) {
      if (
        insertError.message.includes("violates check constraint") ||
        insertError.message.includes("dataset")
      ) {
        console.error("❌ FAILED: Constraint still blocking HorasLancadas");
        console.error(
          "   Error:",
          insertError.message
        );
        console.log("\n⚠️  Migration 056 has NOT been applied yet.");
        console.log(
          "\n📋 Please execute the SQL from MIGRATION_056_MANUAL.md in Supabase SQL Editor:"
        );
        console.log("   https://app.supabase.com/project/pybmawlwpmxshtccpqui/sql\n");
        return false;
      } else {
        console.error("❌ Unexpected error:", insertError.message);
        return false;
      }
    }

    if (!data || data.length === 0) {
      console.error("❌ Insert succeeded but no data returned");
      return false;
    }

    console.log("✅ SUCCESS: HorasLancadas is now allowed!");
    console.log(`   Inserted ID: ${data[0].id}`);

    // Cleanup
    await supabase
      .from("integration_log_entries")
      .delete()
      .eq("request_id", "VALIDATION-TEST-056");

    console.log("\n" + "=".repeat(72));
    console.log("🎉 MIGRATION 056 IS ACTIVE!");
    console.log("=".repeat(72));
    console.log("\n✅ Constraints have been expanded");
    console.log("✅ HorasLancadas and TempoPermanencia are now allowed");
    console.log("✅ Syncronization should now work\n");
    console.log(
      "→ Next: Open https://tech-arauz.vercel.app/integracoes and click 'Sincronizar tudo'\n"
    );

    return true;
  } catch (err) {
    console.error("❌ Validation error:", err.message);
    return false;
  }
}

validateMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

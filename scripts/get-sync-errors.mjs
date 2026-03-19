#!/usr/bin/env node
/**
 * Get last sync errors for debugging
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getErrors() {
  console.log("🔍 Fetching last 20 sync errors...\n");

  const { data, error } = await supabase
    .from("integration_log_entries")
    .select("*")
    .eq("level", "error")
    .order("logged_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("❌ Error fetching logs:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("✅ No errors found!");
    return;
  }

  console.log(`Found ${data.length} error(s):\n`);
  console.log("=" + "=".repeat(100));

  for (const log of data) {
    console.log(`\n📋 Dataset: ${log.dataset}`);
    console.log(`   Timestamp: ${log.logged_at}`);
    console.log(`   Level: ${log.level}`);
    console.log(`   Message: ${log.message}`);
    if (log.details) {
      console.log(`   Details:`, JSON.stringify(log.details, null, 2));
    }
    console.log("-" + "-".repeat(100));
  }

  console.log("\n" + "=".repeat(100));
}

getErrors().catch(console.error);

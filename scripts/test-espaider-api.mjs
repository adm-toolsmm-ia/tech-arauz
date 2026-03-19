#!/usr/bin/env node
/**
 * Test Espaider API directly to identify authentication/authorization issues
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const BASE_URL = process.env.ESPAIDER_BASE_URL;
const TOKEN = process.env.ESPAIDER_TOKEN;

if (!BASE_URL || !TOKEN) {
  console.error("❌ Missing Espaider credentials in .env.local");
  console.error(`   BASE_URL: ${BASE_URL ? "✅" : "❌"}`);
  console.error(`   TOKEN: ${TOKEN ? "✅" : "❌"}`);
  process.exit(1);
}

console.log("🧪 Testing Espaider API Connection\n");
console.log(`   Base URL: ${BASE_URL}`);
console.log(`   Token: ${TOKEN.substring(0, 20)}...${TOKEN.substring(TOKEN.length - 10)}`);
console.log("\n⏳ Sending POST request...\n");

async function testAPI() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Identificador: "BI_SOLICITACOES_PROJETOSESPAIDER",
        Token: TOKEN,
        NumPagina: 1,
        QuantRegistrosPorPagina: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`📋 Response Status: ${response.status} ${response.statusText}\n`);
    console.log("Headers:");
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    console.log();

    const data = await response.json();

    console.log("📦 Response Body:");
    console.log(JSON.stringify(data, null, 2));
    console.log();

    if (response.status === 200) {
      if (data.Situacao === "S") {
        console.log("✅ SUCCESS: API is responding correctly!");
        console.log(
          `   Records returned: ${data.ListaRegistros?.length || 0}`
        );
        console.log(
          `   Child interfaces: ${data.ListaURLFilhos?.length || 0}`
        );
        return true;
      } else if (data.Situacao === "E") {
        console.log("❌ ESPAIDER ERROR:");
        console.log(`   Message: ${data.MensagemRetorno || "Unknown error"}`);
        return false;
      }
    } else {
      console.log(
        `❌ HTTP ERROR: ${response.status}`
      );
      if (response.status === 401 || response.status === 403) {
        console.log(
          "   Possible cause: Invalid or expired token"
        );
      }
      return false;
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("❌ TIMEOUT: Request took longer than 30 seconds");
      console.error("   Possible causes:");
      console.error("   - API server is slow");
      console.error("   - Network connectivity issue");
      console.error("   - Firewall blocking");
    } else {
      console.error("❌ ERROR:", err.message);
    }
    return false;
  }
}

testAPI()
  .then((success) => {
    console.log("\n" + "=".repeat(80));
    if (success) {
      console.log("🎉 API is working correctly - problem is elsewhere");
    } else {
      console.log("⚠️  API is not responding correctly - check token and URL");
    }
    console.log("=".repeat(80));
    process.exit(success ? 0 : 1);
  })
  .catch(console.error);

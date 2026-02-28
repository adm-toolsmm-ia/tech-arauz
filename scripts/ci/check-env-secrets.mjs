/**
 * check-env-secrets.mjs
 * Story 2.26 — Security Hardening
 *
 * Audits .env.example for NEXT_PUBLIC_* variables that might contain secrets.
 * Validates that no secret-like values are exposed in the client bundle.
 *
 * Usage: node scripts/ci/check-env-secrets.mjs
 * Exit codes: 0 = PASS, 1 = FAIL (potential secrets found)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SECRET_PATTERNS = [
  /^sk[-_]/i,                      // Stripe/OpenAI secret keys
  /^whsec[-_]/i,                   // Webhook secrets
  /secret/i,                       // Any variable with "secret" in name
  /password/i,                     // Passwords
  /^eyJ/,                          // JWT tokens (base64 encoded JSON)
  /^ghp_/,                         // GitHub personal tokens
  /^ghs_/,                         // GitHub server tokens
  /^xoxb-/,                        // Slack bot tokens
  /^xoxp-/,                        // Slack user tokens
  /private[-_]?key/i,              // Private keys
  /service[-_]?role/i,             // Service role keys
];

const ALLOWED_NEXT_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',      // Public URL (designed to be public)
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', // Anon key (designed to be public with RLS)
  'NEXT_PUBLIC_APP_URL',           // App URL
  'NEXT_PUBLIC_APP_NAME',          // App name
];

function fail(message) {
  console.error(`[audit:secrets] FAIL: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`[audit:secrets] WARN: ${message}`);
}

// Read .env.example
const envExamplePath = resolve(process.cwd(), '.env.example');
if (!existsSync(envExamplePath)) {
  fail('.env.example not found');
}

const content = readFileSync(envExamplePath, 'utf-8');
const lines = content.split('\n');

const issues = [];
const nextPublicVars = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
  if (!match) continue;

  const varName = match[1];

  // Check NEXT_PUBLIC_* variables
  if (varName.startsWith('NEXT_PUBLIC_')) {
    nextPublicVars.push(varName);

    if (ALLOWED_NEXT_PUBLIC_VARS.includes(varName)) continue;

    // Check if the variable name suggests a secret
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(varName)) {
        issues.push(`${varName} — matches secret pattern: ${pattern}`);
        break;
      }
    }

    // Check the value (if set in .env.example)
    const value = trimmed.substring(varName.length + 1).trim();
    if (value) {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(value)) {
          issues.push(`${varName} — value matches secret pattern: ${pattern}`);
          break;
        }
      }
    }
  }
}

// Also scan .env.local if it exists (warn only, don't fail)
const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  const localContent = readFileSync(envLocalPath, 'utf-8');
  const localLines = localContent.split('\n');

  for (const line of localLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^(NEXT_PUBLIC_[A-Z0-9_]*)=(.+)/);
    if (!match) continue;

    const [, varName, value] = match;
    if (ALLOWED_NEXT_PUBLIC_VARS.includes(varName)) continue;

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        issues.push(`${varName} in .env.local — value looks like a secret (pattern: ${pattern})`);
        break;
      }
    }
  }
}

// Report
console.log('[audit:secrets] Scanning for exposed secrets in NEXT_PUBLIC_* variables...');
console.log(`[audit:secrets] Found ${nextPublicVars.length} NEXT_PUBLIC_* variables`);

if (nextPublicVars.length > 0) {
  console.log('[audit:secrets] NEXT_PUBLIC_* variables:');
  for (const v of nextPublicVars) {
    const allowed = ALLOWED_NEXT_PUBLIC_VARS.includes(v);
    console.log(`  ${allowed ? '✅' : '⚠️ '} ${v}${allowed ? ' (allowed)' : ' (review needed)'}`);
  }
}

if (issues.length > 0) {
  console.error('\n[audit:secrets] POTENTIAL SECRET EXPOSURE DETECTED:');
  for (const issue of issues) {
    console.error(`  ❌ ${issue}`);
  }
  fail(`${issues.length} potential secret(s) found in NEXT_PUBLIC_* variables`);
}

console.log('[audit:secrets] PASS — no secrets detected in NEXT_PUBLIC_* variables');

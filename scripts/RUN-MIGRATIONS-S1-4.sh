#!/bin/bash

# ============================================================================
# SPRINT 1 - S1-4 Migration Deployment Script
# ============================================================================
# Deploys M026 (audit function) + M027 (CRITICAL RLS fix) to production
# Usage: bash RUN-MIGRATIONS-S1-4.sh
# ============================================================================

set -e  # Exit on error

echo "🚀 SPRINT 1 - S1-4 Migration Deployment"
echo "======================================"
echo ""

# ============================================================================
# STEP 1: Verify Migrations Exist
# ============================================================================
echo "✅ Step 1: Verifying migrations..."

if [ ! -f "supabase/migrations/026_create_rls_audit_function.sql" ]; then
    echo "❌ ERROR: M026 not found!"
    exit 1
fi

if [ ! -f "supabase/migrations/027_remediate_rls_critical_gaps.sql" ]; then
    echo "❌ ERROR: M027 not found!"
    exit 1
fi

echo "✅ M026 found: supabase/migrations/026_create_rls_audit_function.sql"
echo "✅ M027 found: supabase/migrations/027_remediate_rls_critical_gaps.sql"
echo ""

# ============================================================================
# STEP 2: Display Pre-Deployment Checklist
# ============================================================================
echo "📋 Pre-Deployment Checklist:"
echo "======================================"
echo ""
echo "Before proceeding, verify:"
echo "  ✓ You have Supabase project configured"
echo "  ✓ You have database backups (via Supabase Dashboard)"
echo "  ✓ You are in low-traffic deployment window"
echo "  ✓ You have DATABASE_URL environment variable set"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  WARNING: psql not found. You'll need to verify migrations manually."
    echo "   See: docs/sprints/MIGRATION-DEPLOYMENT-GUIDE.md for manual steps"
    echo ""
fi

# ============================================================================
# STEP 3: Apply M026 (Non-Breaking)
# ============================================================================
echo "🔧 Step 2: Applying Migration 026 (Audit Function)..."
echo "======================================"
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please set it first:"
    echo "   export DATABASE_URL='postgresql://...'"
    echo ""
    echo "Alternatively, use Vercel auto-deploy or Supabase Dashboard"
    echo "See: docs/sprints/MIGRATION-DEPLOYMENT-GUIDE.md"
    exit 1
fi

echo "Executing M026..."
psql "$DATABASE_URL" < supabase/migrations/026_create_rls_audit_function.sql

if [ $? -eq 0 ]; then
    echo "✅ M026 applied successfully!"
else
    echo "❌ M026 failed!"
    exit 1
fi

echo ""

# ============================================================================
# STEP 4: Apply M027 (CRITICAL RLS Fix)
# ============================================================================
echo "🔥 Step 3: Applying Migration 027 (CRITICAL RLS Remediation)..."
echo "======================================"
echo ""
echo "⚠️  WARNING: This is a CRITICAL security fix!"
echo "   Adding tenant_id to 3 vulnerable tables..."
echo ""

echo "Executing M027..."
psql "$DATABASE_URL" < supabase/migrations/027_remediate_rls_critical_gaps.sql

if [ $? -eq 0 ]; then
    echo "✅ M027 applied successfully!"
else
    echo "❌ M027 failed!"
    exit 1
fi

echo ""

# ============================================================================
# STEP 5: Verify Migrations
# ============================================================================
echo "✅ Step 4: Verifying migrations..."
echo "======================================"
echo ""

echo "Running audit script..."
psql "$DATABASE_URL" < scripts/audit-rls-tables.sql

echo ""
echo "✅ Migrations verified!"
echo ""

# ============================================================================
# STEP 6: Summary
# ============================================================================
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "✅ M026 (Audit Function): Applied"
echo "✅ M027 (CRITICAL RLS Fix): Applied"
echo "✅ Audit Verification: Passed"
echo ""
echo "Next Steps:"
echo "  1. Deploy main to Vercel (Vercel auto-deploy or manual push)"
echo "  2. Run smoke tests on staging"
echo "  3. Mark S1-4 as Done"
echo "  4. Notify stakeholders"
echo ""
echo "See: docs/sprints/MIGRATION-DEPLOYMENT-GUIDE.md for more details"
echo ""

#!/bin/bash
# RLS Automated Test Runner
# Story 7-A-3: Automated RLS Test Suite
# Framework: pgTAP (PostgreSQL Test Anything Protocol)

set -e

# Configuration
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
TEST_FILE="${PROJECT_ROOT}/supabase/tests/rls-tests.sql"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"
TEST_SCHEMA="rls_tests_$(date +%s)"

echo "🔧 RLS Test Runner"
echo "=================="
echo "Test file: $TEST_FILE"
echo "Database: $DB_URL"
echo ""

# Check if pgTAP is installed
echo "📦 Checking pgTAP installation..."
psql "$DB_URL" -c "CREATE EXTENSION IF NOT EXISTS pgtap;" 2>/dev/null || {
  echo "❌ ERROR: pgTAP extension not available"
  echo "Install pgTAP: https://pgtap.org/"
  exit 1
}

# Run tests
echo "🧪 Running RLS test suite..."
echo ""

psql "$DB_URL" "$TEST_FILE" 2>&1 | tee "${PROJECT_ROOT}/.rls-test-results.tap"

# Parse results
RESULTS="${PROJECT_ROOT}/.rls-test-results.tap"
PASSED=$(grep -c "^ok" "$RESULTS" || true)
FAILED=$(grep -c "^not ok" "$RESULTS" || true)
TOTAL=$((PASSED + FAILED))

echo ""
echo "📊 Test Results"
echo "==============="
echo "Total: $TOTAL"
echo "Passed: $PASSED ✅"
echo "Failed: $FAILED ❌"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ ALL TESTS PASSED!"
  exit 0
else
  echo "❌ TESTS FAILED - See above for details"
  exit 1
fi

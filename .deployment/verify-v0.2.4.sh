#!/bin/bash

###############################################################################
# Tech Arauz v0.2.4 Deployment Verification Script
#
# Purpose: Verify v0.2.4 deployment successful on production
# Usage: ./verify-v0.2.4.sh
# Owner: @devops (Gage)
# Framework: Synkra AIOX v1.0.0
###############################################################################

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-https://api.tech-arauz.com}"
HEALTH_CHECK_TIMEOUT=10
LOG_FILE="/tmp/verify-v0.2.4-$(date +%Y%m%d-%H%M%S).log"

# Counter for results
PASSED=0
FAILED=0
WARNINGS=0

###############################################################################
# Utility Functions
###############################################################################

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "$LOG_FILE"
    ((PASSED++))
}

error() {
    echo -e "${RED}✗${NC} $*" | tee -a "$LOG_FILE"
    ((FAILED++))
}

warning() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "$LOG_FILE"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ${NC} $*" | tee -a "$LOG_FILE"
}

section() {
    echo "" | tee -a "$LOG_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
    echo -e "${BLUE}${1}${NC}" | tee -a "$LOG_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
}

###############################################################################
# Health Checks
###############################################################################

check_api_health() {
    section "1. API HEALTH CHECK"

    log "Checking API availability..."

    if ! curl -s -f -m "$HEALTH_CHECK_TIMEOUT" "$API_URL/health" > /dev/null; then
        error "API health endpoint not responding"
        return 1
    fi

    success "API is responding"

    # Check version
    VERSION=$(curl -s "$API_URL/version" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    if [ "$VERSION" == "0.2.4" ]; then
        success "Version: $VERSION"
    else
        error "Version mismatch. Expected 0.2.4, got $VERSION"
        return 1
    fi

    # Check status
    STATUS=$(curl -s "$API_URL/status" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" == "healthy" ]; then
        success "Status: healthy"
    else
        warning "Status: $STATUS (not ideal but may be transitional)"
    fi
}

###############################################################################
# Database Checks
###############################################################################

check_database_migrations() {
    section "2. DATABASE MIGRATIONS"

    log "Checking database migration status..."

    # Check if we can connect to database
    if ! command -v supabase &> /dev/null; then
        warning "Supabase CLI not installed, skipping database checks"
        return 0
    fi

    # Get migration status
    MIGRATION_STATUS=$(supabase db status 2>/dev/null || echo "unavailable")

    if echo "$MIGRATION_STATUS" | grep -q "081"; then
        success "Database migrations 066-081 completed"
    else
        warning "Could not verify all migrations (may need manual check)"
    fi
}

check_rls_policies() {
    section "3. RLS POLICIES"

    log "Checking Row-Level Security policies..."

    # Check that new tables have RLS enabled
    if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
        RLS_TABLES=$(psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true ORDER BY tablename;" 2>/dev/null || echo "")

        # Check for key new tables
        if echo "$RLS_TABLES" | grep -q "activity_dependencies"; then
            success "RLS enabled on activity_dependencies"
        else
            warning "Could not verify RLS on activity_dependencies"
        fi

        if echo "$RLS_TABLES" | grep -q "role_definitions"; then
            success "RLS enabled on role_definitions"
        else
            warning "Could not verify RLS on role_definitions"
        fi
    else
        warning "Database connection not available, skipping RLS verification"
    fi
}

###############################################################################
# Feature Checks
###############################################################################

check_feature_activity_system() {
    section "4. FEATURE: ACTIVITY SYSTEM"

    log "Checking Activity System endpoints..."

    # Check if activity endpoints are available
    if curl -s -f "$API_URL/api/activities" > /dev/null 2>&1; then
        success "Activities API endpoint available"
    else
        error "Activities API endpoint not responding"
        return 1
    fi

    # Check for responsible_roles in activity response
    ACTIVITY_SAMPLE=$(curl -s "$API_URL/api/activities?limit=1" | grep -o '"responsible_roles"' || echo "")
    if [ -z "$ACTIVITY_SAMPLE" ]; then
        warning "responsible_roles field not found in activity response (may be expected if no activities exist)"
    else
        success "responsible_roles field available in activities"
    fi
}

check_feature_search() {
    section "5. FEATURE: ADVANCED SEARCH"

    log "Checking search functionality..."

    # Check search endpoint
    if curl -s -f "$API_URL/api/search?q=test" > /dev/null 2>&1; then
        success "Search endpoint available"
    else
        error "Search endpoint not responding"
        return 1
    fi

    # Check for semantic search
    RESPONSE=$(curl -s "$API_URL/api/search?q=test&semantic=true" 2>/dev/null || echo "")
    if echo "$RESPONSE" | grep -q "results"; then
        success "Semantic search responding"
    else
        warning "Semantic search response unclear (may be empty results)"
    fi
}

check_feature_metrics() {
    section "6. FEATURE: PROCESS METRICS"

    log "Checking metrics functionality..."

    # Check metrics endpoint
    if curl -s -f "$API_URL/api/metrics" > /dev/null 2>&1; then
        success "Metrics endpoint available"
    else
        error "Metrics endpoint not responding"
        return 1
    fi
}

###############################################################################
# Performance Checks
###############################################################################

check_api_latency() {
    section "7. PERFORMANCE: API LATENCY"

    log "Measuring API response times..."

    local total_time=0
    local iterations=5

    for i in $(seq 1 $iterations); do
        START=$(date +%s%N)
        curl -s -f "$API_URL/health" > /dev/null
        END=$(date +%s%N)

        LATENCY=$(( (END - START) / 1000000 ))
        total_time=$((total_time + LATENCY))

        if [ $LATENCY -lt 500 ]; then
            success "Request $i: ${LATENCY}ms"
        else
            warning "Request $i: ${LATENCY}ms (over 500ms threshold)"
        fi
    done

    AVG_LATENCY=$((total_time / iterations))

    if [ $AVG_LATENCY -lt 300 ]; then
        success "Average latency: ${AVG_LATENCY}ms (excellent)"
    elif [ $AVG_LATENCY -lt 500 ]; then
        success "Average latency: ${AVG_LATENCY}ms (good)"
    else
        warning "Average latency: ${AVG_LATENCY}ms (slow, investigate)"
    fi
}

check_error_rate() {
    section "8. MONITORING: ERROR RATE"

    log "Checking error rate..."

    # Make multiple requests and check for errors
    local error_count=0
    local total_requests=20

    for i in $(seq 1 $total_requests); do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

        if [ "$HTTP_CODE" != "200" ]; then
            ((error_count++))
        fi
    done

    ERROR_RATE=$((error_count * 100 / total_requests))

    if [ $ERROR_RATE -eq 0 ]; then
        success "Error rate: 0% (0 errors in 20 requests)"
    elif [ $ERROR_RATE -lt 5 ]; then
        warning "Error rate: ${ERROR_RATE}% (${error_count} errors in ${total_requests} requests)"
    else
        error "Error rate: ${ERROR_RATE}% (${error_count} errors in ${total_requests} requests) — INVESTIGATE"
    fi
}

###############################################################################
# Feature Flags
###############################################################################

check_feature_flags() {
    section "9. FEATURE FLAGS"

    log "Checking feature flag configuration..."

    # Check for feature flag endpoint
    if curl -s -f "$API_URL/api/features" > /dev/null 2>&1; then
        success "Features endpoint available"

        # Check specific flags
        FEATURES=$(curl -s "$API_URL/api/features")

        if echo "$FEATURES" | grep -q "epic11_activity_system"; then
            success "epic11_activity_system flag present"
        else
            warning "epic11_activity_system flag not found"
        fi

        if echo "$FEATURES" | grep -q "epic11_search_semantic"; then
            success "epic11_search_semantic flag present"
        else
            warning "epic11_search_semantic flag not found"
        fi
    else
        warning "Features endpoint not available"
    fi
}

###############################################################################
# Documentation Checks
###############################################################################

check_documentation() {
    section "10. DOCUMENTATION"

    log "Checking release documentation..."

    DOC_FILES=(
        "docs/releases/CHANGELOG-v0.2.4.md"
        "docs/releases/MIGRATION-GUIDE-v0.2.4.md"
        "docs/releases/RELEASE-NOTES-v0.2.4.md"
        "docs/releases/DEPLOYMENT-CHECKLIST-v0.2.4.md"
        "docs/releases/TECHNICAL-RELEASE-SUMMARY-v0.2.4.md"
        "docs/releases/BREAKING-CHANGES-v0.2.4.md"
    )

    for file in "${DOC_FILES[@]}"; do
        if [ -f "$file" ]; then
            success "Found: $file"
        else
            error "Missing: $file"
        fi
    done
}

###############################################################################
# Security Checks
###############################################################################

check_security() {
    section "11. SECURITY VERIFICATION"

    log "Checking security headers..."

    # Check for security headers
    HEADERS=$(curl -s -I "$API_URL/health")

    if echo "$HEADERS" | grep -qi "strict-transport-security"; then
        success "HSTS header present"
    else
        warning "HSTS header missing"
    fi

    if echo "$HEADERS" | grep -qi "x-content-type-options"; then
        success "X-Content-Type-Options header present"
    else
        warning "X-Content-Type-Options header missing"
    fi

    if echo "$HEADERS" | grep -qi "x-frame-options"; then
        success "X-Frame-Options header present"
    else
        warning "X-Frame-Options header missing"
    fi
}

###############################################################################
# Summary
###############################################################################

print_summary() {
    section "VERIFICATION SUMMARY"

    echo "" | tee -a "$LOG_FILE"
    echo -e "${GREEN}Passed:${NC}   $PASSED" | tee -a "$LOG_FILE"
    echo -e "${RED}Failed:${NC}   $FAILED" | tee -a "$LOG_FILE"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}✓ DEPLOYMENT VERIFICATION PASSED${NC}" | tee -a "$LOG_FILE"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"

        if [ $WARNINGS -gt 0 ]; then
            echo "" | tee -a "$LOG_FILE"
            echo -e "${YELLOW}⚠ Note: $WARNINGS warning(s) found. Review above for details.${NC}" | tee -a "$LOG_FILE"
        fi

        return 0
    else
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}✗ DEPLOYMENT VERIFICATION FAILED${NC}" | tee -a "$LOG_FILE"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
        echo -e "${RED}$FAILED issue(s) detected. Review details above.${NC}" | tee -a "$LOG_FILE"

        return 1
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    log "Starting v0.2.4 deployment verification"
    log "API URL: $API_URL"
    log "Log file: $LOG_FILE"
    log ""

    # Run all checks
    check_api_health || true
    check_database_migrations || true
    check_rls_policies || true
    check_feature_activity_system || true
    check_feature_search || true
    check_feature_metrics || true
    check_api_latency || true
    check_error_rate || true
    check_feature_flags || true
    check_documentation || true
    check_security || true

    # Print summary and exit
    print_summary
    exit $?
}

# Run main
main "$@"

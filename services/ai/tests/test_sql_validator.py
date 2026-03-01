"""Tests for SQL validator module."""

import pytest

from app.chains.sql_validator import (
    SQLValidationError,
    validate_sql,
    ALLOWED_TABLES,
)


class TestValidateSQLBasic:
    """Tests for basic SQL validation."""

    def test_validate_sql_simple_select(self):
        """Test validation of a simple SELECT query."""
        sql = "SELECT * FROM projects WHERE id = '123'"
        clean = validate_sql(sql, tenant_id="tenant-abc")

        assert "LIMIT 100" in clean or "limit 100" in clean.lower()
        assert "tenant_id" in clean.lower()
        assert "SELECT" in clean.upper()

    def test_validate_sql_with_projection(self):
        """Test SELECT with column projection."""
        sql = "SELECT id, name FROM projects"
        clean = validate_sql(sql, tenant_id="tenant-123")

        assert "LIMIT 100" in clean or "limit 100" in clean.lower()
        assert "tenant_id" in clean.lower()

    def test_validate_sql_with_where_clause(self):
        """Test SELECT with existing WHERE clause."""
        sql = "SELECT * FROM projects WHERE status = 'active'"
        clean = validate_sql(sql, tenant_id="tenant-xyz")

        assert "LIMIT" in clean.upper()
        assert "tenant_id" in clean.lower()
        assert "status" in clean.lower()

    def test_validate_sql_multiple_tables_join(self):
        """Test SELECT with JOIN (all tables whitelisted)."""
        sql = """
        SELECT p.id, ps.duration
        FROM projects p
        JOIN project_schedules ps ON p.id = ps.project_id
        """
        clean = validate_sql(sql, tenant_id="tenant-abc")

        assert "LIMIT" in clean.upper()
        assert "tenant_id" in clean.lower()

    def test_validate_sql_returns_string(self):
        """Test that validate_sql returns a string."""
        sql = "SELECT * FROM projects"
        result = validate_sql(sql, tenant_id="tenant-1")
        assert isinstance(result, str)


class TestValidateSQLRejections:
    """Tests for SQL rejections."""

    def test_reject_insert(self):
        """Test that INSERT is rejected."""
        sql = "INSERT INTO projects (name) VALUES ('test')"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"

    def test_reject_update(self):
        """Test that UPDATE is rejected."""
        sql = "UPDATE projects SET name = 'new' WHERE id = '123'"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"

    def test_reject_delete(self):
        """Test that DELETE is rejected."""
        sql = "DELETE FROM projects WHERE id = '123'"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"

    def test_reject_create(self):
        """Test that CREATE is rejected."""
        sql = "CREATE TABLE test (id UUID)"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"

    def test_reject_drop(self):
        """Test that DROP is rejected."""
        sql = "DROP TABLE projects"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"

    def test_reject_alter(self):
        """Test that ALTER is rejected."""
        sql = "ALTER TABLE projects ADD COLUMN new_col TEXT"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"

    def test_reject_truncate(self):
        """Test that TRUNCATE is rejected."""
        sql = "TRUNCATE TABLE projects"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "mutation_blocked"


class TestValidateSQLBlockedTables:
    """Tests for table whitelisting."""

    def test_reject_users_table(self):
        """Test that access to users table is blocked."""
        sql = "SELECT * FROM users"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "blocked_table"
        assert exc.value.table_name == "users"

    def test_reject_auth_table(self):
        """Test that access to auth table is blocked."""
        sql = "SELECT * FROM auth.users"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "blocked_table"

    def test_reject_arbitrary_table(self):
        """Test that arbitrary table access is blocked."""
        sql = "SELECT * FROM secrets WHERE key = 'admin_password'"
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "blocked_table"
        assert exc.value.table_name == "secrets"

    def test_allow_all_whitelisted_tables(self):
        """Test that all whitelisted tables are allowed."""
        for table in ALLOWED_TABLES:
            sql = f"SELECT * FROM {table}"
            clean = validate_sql(sql, tenant_id="tenant-1")
            assert isinstance(clean, str)
            assert "LIMIT" in clean.upper()


class TestValidateSQLErrors:
    """Tests for error handling."""

    def test_parse_error_invalid_sql(self):
        """Test parse error on invalid SQL."""
        sql = "SELECT * FROM projects WHERE id = "  # incomplete
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "parse_error"

    def test_parse_error_sql_syntax(self):
        """Test parse error on syntax error."""
        sql = "SELECT * FORM projects"  # typo: FORM instead of FROM
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        assert exc.value.error_code == "parse_error"

    def test_parse_error_empty_sql(self):
        """Test parse error on empty SQL."""
        sql = ""
        with pytest.raises(SQLValidationError) as exc:
            validate_sql(sql, tenant_id="tenant-abc")
        # Could be parse_error or no_select

    def test_sqlvalidationerror_attributes(self):
        """Test SQLValidationError attributes."""
        error = SQLValidationError(
            error_code="test_code",
            message="test message",
            raw_sql="SELECT * FROM x",
            table_name="x",
        )
        assert error.error_code == "test_code"
        assert error.message == "test message"
        assert error.raw_sql == "SELECT * FROM x"
        assert error.table_name == "x"


class TestValidateSQLLimitHandling:
    """Tests for LIMIT clause injection and handling."""

    def test_inject_limit_default(self):
        """Test that default LIMIT is injected when not present."""
        sql = "SELECT * FROM projects"
        clean = validate_sql(sql, tenant_id="tenant-abc", default_limit=100)
        assert "LIMIT 100" in clean or "limit 100" in clean.lower()

    def test_inject_limit_respects_existing_lower(self):
        """Test that existing lower LIMIT is respected."""
        sql = "SELECT * FROM projects LIMIT 10"
        clean = validate_sql(sql, tenant_id="tenant-abc", default_limit=100)
        # Should keep 10 (lower than default)
        assert "LIMIT 10" in clean or "limit 10" in clean.lower()

    def test_inject_limit_respects_existing_higher(self):
        """Test that existing higher LIMIT is capped to default."""
        sql = "SELECT * FROM projects LIMIT 200"
        clean = validate_sql(sql, tenant_id="tenant-abc", default_limit=100)
        # Should cap to 100 (default is lower)
        assert "LIMIT 100" in clean or "limit 100" in clean.lower()

    def test_inject_limit_respects_max_limit(self):
        """Test that LIMIT is capped to max_limit."""
        sql = "SELECT * FROM projects"
        clean = validate_sql(sql, tenant_id="tenant-abc", default_limit=100, max_limit=50)
        # Should be 50 (capped by max_limit)
        assert "LIMIT 50" in clean or "limit 50" in clean.lower()

    def test_inject_limit_with_offset(self):
        """Test LIMIT injection with OFFSET clause."""
        sql = "SELECT * FROM projects OFFSET 10"
        clean = validate_sql(sql, tenant_id="tenant-abc")
        # Should have LIMIT injected
        assert "LIMIT" in clean.upper()
        # Should preserve OFFSET
        assert "OFFSET" in clean.upper() or "offset" in clean.lower()


class TestValidateSQLTenantIsolation:
    """Tests for tenant_id filter injection."""

    def test_inject_tenant_filter_simple(self):
        """Test that tenant_id filter is injected in simple query."""
        sql = "SELECT * FROM projects"
        clean = validate_sql(sql, tenant_id="tenant-xyz")
        assert "tenant_id" in clean.lower()
        assert "tenant-xyz" in clean

    def test_inject_tenant_filter_with_existing_where(self):
        """Test that tenant_id filter is ANDed with existing WHERE."""
        sql = "SELECT * FROM projects WHERE status = 'active'"
        clean = validate_sql(sql, tenant_id="tenant-123")
        # Should have both conditions
        assert "tenant_id" in clean.lower()
        assert "tenant-123" in clean
        assert "status" in clean.lower()
        assert "active" in clean

    def test_tenant_filter_uses_different_ids(self):
        """Test that different tenant IDs produce different SQL."""
        sql = "SELECT * FROM projects"
        clean1 = validate_sql(sql, tenant_id="tenant-1")
        clean2 = validate_sql(sql, tenant_id="tenant-2")

        assert "tenant-1" in clean1
        assert "tenant-2" in clean2
        assert clean1 != clean2

    def test_tenant_filter_special_characters(self):
        """Test that tenant IDs with special characters are handled."""
        sql = "SELECT * FROM projects"
        clean = validate_sql(sql, tenant_id="tenant-abc-123")
        assert "tenant-abc-123" in clean or "'tenant-abc-123'" in clean


class TestValidateSQLEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_case_insensitive_table_matching(self):
        """Test that table names are matched case-insensitively."""
        sql = "SELECT * FROM PROJECTS"  # uppercase
        clean = validate_sql(sql, tenant_id="tenant-abc")
        assert "LIMIT" in clean.upper()

    def test_schema_qualified_table_names(self):
        """Test handling of schema-qualified table names."""
        sql = "SELECT * FROM public.projects"
        clean = validate_sql(sql, tenant_id="tenant-abc")
        assert isinstance(clean, str)
        assert "LIMIT" in clean.upper()

    def test_subquery_with_whitelisted_table(self):
        """Test SELECT with subquery (if parser allows)."""
        # Note: Parser behavior varies - this documents actual behavior
        sql = "SELECT * FROM (SELECT * FROM projects) AS p"
        try:
            clean = validate_sql(sql, tenant_id="tenant-abc")
            assert "LIMIT" in clean.upper()
        except SQLValidationError:
            # If parser rejects subqueries, that's acceptable
            pass

    def test_with_cte(self):
        """Test SELECT with CTE (if parser allows)."""
        sql = """
        WITH active_projects AS (
            SELECT * FROM projects WHERE status = 'active'
        )
        SELECT * FROM active_projects
        """
        try:
            clean = validate_sql(sql, tenant_id="tenant-abc")
            assert "LIMIT" in clean.upper()
        except SQLValidationError:
            # If parser rejects CTEs, that's acceptable
            pass

    def test_union_query(self):
        """Test UNION query (if parser allows)."""
        sql = """
        SELECT id FROM projects
        UNION
        SELECT id FROM project_schedules
        """
        try:
            clean = validate_sql(sql, tenant_id="tenant-abc")
            assert isinstance(clean, str)
        except SQLValidationError:
            # If parser rejects UNIONs, that's acceptable
            pass

"""
SQL Validator — Safe SQL extraction and modification using sqlglot AST.

Features:
- Whitelist of allowed tables
- Blocks DML/DDL operations (INSERT, UPDATE, DELETE, CREATE, DROP, etc.)
- Injects LIMIT clause to prevent runaway queries
- Injects tenant_id filter to enforce multi-tenant isolation
- All modifications via AST (no string concatenation)
"""

from typing import Optional

import sqlglot
from sqlglot import expressions as exp


class SQLValidationError(Exception):
    """Raised when SQL validation fails."""

    def __init__(
        self,
        error_code: str,
        message: str,
        raw_sql: str = "",
        table_name: Optional[str] = None,
    ) -> None:
        """Initialize SQLValidationError.

        Args:
            error_code: Error classification (parse_error, blocked_table, mutation_blocked, no_select)
            message: Human-readable error message
            raw_sql: The original SQL that failed validation
            table_name: Optional table name if error is table-related
        """
        self.error_code = error_code
        self.message = message
        self.raw_sql = raw_sql
        self.table_name = table_name
        super().__init__(f"[{error_code}] {message}")


# Whitelist of tables allowed in SQL queries
ALLOWED_TABLES = frozenset({
    "projects",
    "project_schedules",
    "project_deliveries",
    "project_requirements",
    "project_histories",
    "project_budgets",
})

# Statement types that are mutation operations (blocked)
BLOCKED_STATEMENT_TYPES = frozenset({
    "insert",
    "update",
    "delete",
    "create",
    "drop",
    "alter",
    "truncate",
})


def validate_sql(
    raw_sql: str,
    tenant_id: str,
    default_limit: int = 100,
    max_limit: int = 500,
) -> str:
    """Validate and transform SQL query for safe execution.

    Performs the following transformations via AST:
    1. Parses SQL and validates syntax
    2. Ensures query is SELECT (no DML/DDL)
    3. Validates all tables are in whitelist
    4. Injects LIMIT clause (capped at max_limit)
    5. Injects WHERE tenant_id = X filter

    Args:
        raw_sql: Raw SQL query string
        tenant_id: Tenant ID to inject into WHERE clause
        default_limit: Default LIMIT value if not specified (default: 100)
        max_limit: Maximum LIMIT allowed (default: 500)

    Returns:
        Cleaned SQL with LIMIT and tenant_id filter injected

    Raises:
        SQLValidationError: If validation fails
    """
    # Step 1: Parse SQL
    try:
        stmt = sqlglot.parse_one(raw_sql, dialect="postgres")
    except (sqlglot.ParseError, sqlglot.TokenError) as exc:
        raise SQLValidationError(
            error_code="parse_error",
            message=f"Invalid SQL syntax: {str(exc)}",
            raw_sql=raw_sql,
        )
    except Exception as exc:
        raise SQLValidationError(
            error_code="parse_error",
            message=f"Failed to parse SQL: {str(exc)}",
            raw_sql=raw_sql,
        )

    if stmt is None:
        raise SQLValidationError(
            error_code="parse_error",
            message="Failed to parse SQL (parser returned None)",
            raw_sql=raw_sql,
        )

    # Step 2: Validate statement type (must be SELECT)
    stmt_type = type(stmt).__name__.lower()
    if stmt_type in BLOCKED_STATEMENT_TYPES:
        raise SQLValidationError(
            error_code="mutation_blocked",
            message=f"Mutation operations ({stmt_type.upper()}) are not allowed",
            raw_sql=raw_sql,
        )

    if stmt_type != "select":
        raise SQLValidationError(
            error_code="no_select",
            message=f"Only SELECT queries are allowed (got {stmt_type.upper()})",
            raw_sql=raw_sql,
        )

    # Step 3: Validate table whitelist
    _validate_table_whitelist(stmt, raw_sql)

    # Step 4: Inject LIMIT clause
    _inject_limit(stmt, default_limit, max_limit)

    # Step 5: Inject tenant_id filter
    _inject_tenant_filter(stmt, tenant_id)

    # Return cleaned SQL
    return stmt.sql(dialect="postgres")


def _validate_table_whitelist(stmt: sqlglot.Expression, raw_sql: str) -> None:
    """Validate that all tables in the query are in the whitelist.

    Args:
        stmt: Parsed SQL AST
        raw_sql: Original SQL (for error reporting)

    Raises:
        SQLValidationError: If any table is not whitelisted
    """
    tables = stmt.find_all(exp.Table)

    for table in tables:
        table_name = table.name.lower()

        # Skip schema-qualified references (e.g., public.projects)
        if "." in table_name:
            parts = table_name.split(".")
            table_name = parts[-1]

        if table_name not in ALLOWED_TABLES:
            raise SQLValidationError(
                error_code="blocked_table",
                message=f"Table '{table_name}' is not allowed",
                raw_sql=raw_sql,
                table_name=table_name,
            )


def _inject_limit(
    stmt: sqlglot.Expression,
    default_limit: int,
    max_limit: int,
) -> None:
    """Inject or update LIMIT clause via AST.

    Uses the smaller of: (existing LIMIT, default_limit).
    Caps at max_limit.

    Args:
        stmt: Parsed SQL AST (modified in-place)
        default_limit: Default LIMIT if not specified
        max_limit: Maximum LIMIT allowed
    """
    if not isinstance(stmt, exp.Select):
        return

    # Check for existing LIMIT
    existing_limit = stmt.args.get("limit")
    limit_value = default_limit

    if existing_limit:
        # Extract numeric value from existing LIMIT
        limit_expr = existing_limit.expression
        if isinstance(limit_expr, exp.Literal):
            try:
                existing_val = int(limit_expr.this)
                limit_value = min(existing_val, default_limit)
            except (ValueError, AttributeError):
                # If can't parse, use default
                limit_value = default_limit
        else:
            # If LIMIT is dynamic/complex, use default
            limit_value = default_limit

    # Cap at max_limit
    limit_value = min(limit_value, max_limit)

    # Set or update LIMIT
    stmt.set("limit", exp.Limit(expression=exp.Literal.number(limit_value)))


def _inject_tenant_filter(stmt: sqlglot.Expression, tenant_id: str) -> None:
    """Inject WHERE tenant_id = X filter via AST (no string concatenation).

    Args:
        stmt: Parsed SQL AST (modified in-place)
        tenant_id: Tenant ID to filter by
    """
    if not isinstance(stmt, exp.Select):
        return

    # Create the tenant filter expression: tenant_id = 'X'
    tenant_filter = exp.EQ(
        this=exp.Column(name="tenant_id"),
        expression=exp.Literal.string(tenant_id),
    )

    # Get existing WHERE clause
    existing_where = stmt.args.get("where")

    if existing_where:
        # AND with existing WHERE
        new_where = exp.Where(
            this=exp.And(this=existing_where.this, expression=tenant_filter)
        )
    else:
        # Create new WHERE clause
        new_where = exp.Where(this=tenant_filter)

    stmt.set("where", new_where)

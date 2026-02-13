-- --------------------------------------------------------
-- TEMPLATE 1: Standard Multi-Tenant Isolation
-- --------------------------------------------------------
-- Use this for 90% of tables (projects, tasks, etc.)
-- Prerequisite: Table must have 'id_tenant' column

-- 1. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: View Own Tenant
CREATE POLICY "Users can view data from their own tenant"
ON projects
FOR SELECT
USING (
  id_tenant = get_user_tenant_id(auth.uid())
);

-- 3. Create Policy: Insert into Own Tenant
CREATE POLICY "Users can insert data into their own tenant"
ON projects
FOR INSERT
WITH CHECK (
  id_tenant = get_user_tenant_id(auth.uid())
);

-- 4. Create Policy: Update Own Tenant
CREATE POLICY "Users can update data in their own tenant"
ON projects
FOR UPDATE
USING (
  id_tenant = get_user_tenant_id(auth.uid())
);

-- 5. Create Policy: Delete (Optional - usually creating Soft Delete is better)
CREATE POLICY "Users can delete data in their own tenant"
ON projects
FOR DELETE
USING (
  id_tenant = get_user_tenant_id(auth.uid())
);

-- --------------------------------------------------------
-- TEMPLATE 2: Metadata/Public Read-Only
-- --------------------------------------------------------
-- Use for reference tables (e.g., plans, categories)

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read categories"
ON categories
FOR SELECT
USING (true);  -- Public read access

CREATE POLICY "Only admins can modify categories"
ON categories
FOR ALL
USING (
  get_user_role(auth.uid()) = 'admin'
);

-- --------------------------------------------------------
-- TEMPLATE 3: User Profile (Self-Access Only)
-- --------------------------------------------------------
-- Use for users table or personal settings

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own profile"
ON profiles
FOR ALL
USING (
  id = auth.uid()
);

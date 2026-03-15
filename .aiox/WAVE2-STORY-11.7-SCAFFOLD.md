# Story 11.7: Server Actions for Responsible Roles
## Implementation Scaffold

**Story:** 11.7 Implement Server Actions for Responsible Roles
**Owner:** Dex (@dev)
**Effort:** 6-8 hours
**Priority:** HIGH
**Depends on:** 11.1, 11.6

---

## ✅ STATUS: READY FOR IMPLEMENTATION

### 4 Server Actions to Create

#### 1. `updateActivityResponsibleRolesAction`
```typescript
/**
 * Update all responsible roles for an activity
 * Story 11.7: Implement Server Actions for Responsible Roles
 */
export async function updateActivityResponsibleRolesAction(
  activityId: string,
  roles: string[]
): Promise<OrgActionResult<OrgActivity>> {
  try {
    const auth = await getSupabaseAuth();
    if (!auth.user) throw new UnauthorizedError('Not authenticated');

    const { data, error } = await supabase
      .from('org_activities')
      .update({
        responsible_roles: roles,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId)
      .eq('tenant_id', auth.user.user_metadata.tenant_id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await logAuditEvent({
      action: 'update_responsible_roles',
      entity: 'org_activity',
      entity_id: activityId,
      changes: { responsible_roles: roles },
    });

    revalidatePath('/organizacao');
    return { success: true, data };
  } catch (error) {
    return handleActionError(error);
  }
}
```

**Acceptance Criteria:**
- ✅ Accepts activityId + roles array
- ✅ Validates tenant isolation via auth context
- ✅ Updates org_activities.responsible_roles
- ✅ Logs audit event
- ✅ Revalidates /organizacao path
- ✅ Returns OrgActionResult

---

#### 2. `addActivityResponsibleRoleAction`
```typescript
/**
 * Add single role to activity (append mode)
 */
export async function addActivityResponsibleRoleAction(
  activityId: string,
  role: string
): Promise<OrgActionResult<OrgActivity>> {
  // 1. Get current roles
  // 2. Check if role already exists (prevent duplicates)
  // 3. Append new role
  // 4. Call updateActivityResponsibleRolesAction
  // 5. Log audit event
}
```

---

#### 3. `removeActivityResponsibleRoleAction`
```typescript
/**
 * Remove single role from activity
 */
export async function removeActivityResponsibleRoleAction(
  activityId: string,
  role: string
): Promise<OrgActionResult<OrgActivity>> {
  // 1. Get current roles
  // 2. Filter out role
  // 3. Call updateActivityResponsibleRolesAction
  // 4. Log audit event
}
```

---

#### 4. `getActivityResponsibleRolesAction`
```typescript
/**
 * Fetch current responsible roles for activity (read-only)
 */
export async function getActivityResponsibleRolesAction(
  activityId: string
): Promise<OrgActionResult<string[]>> {
  try {
    const auth = await getSupabaseAuth();
    if (!auth.user) throw new UnauthorizedError('Not authenticated');

    const { data, error } = await supabase
      .from('org_activities')
      .select('responsible_roles')
      .eq('id', activityId)
      .eq('tenant_id', auth.user.user_metadata.tenant_id)
      .single();

    if (error) throw error;
    return { success: true, data: data.responsible_roles || [] };
  } catch (error) {
    return handleActionError(error);
  }
}
```

---

## 📝 TESTING REQUIREMENTS

**Unit Tests (8 tests):**
1. Valid roles array updates successfully
2. Empty array clears roles
3. Duplicate roles prevented
4. Tenant isolation enforced
5. Audit logging triggered
6. Revalidation triggered
7. Invalid activityId error handling
8. Unauthorized user error handling

**Integration Tests:**
- Full flow with ResponsibleRolesInput component
- Activity update form submission
- Role persistence in database

---

## ✅ ACCEPTANCE CRITERIA

- [ ] 4 Server Actions created in `src/app/actions/organization.ts`
- [ ] All actions include tenant isolation
- [ ] All actions include error handling + logging
- [ ] Update `updateActivityAction` to accept responsible_roles param
- [ ] RLS policies validated (no cross-tenant access)
- [ ] Revalidation paths configured (`/organizacao`)
- [ ] Unit tests for each action (success + error)
- [ ] Integration tests with real DB
- [ ] Audit logging for role changes
- [ ] CodeRabbit review passing

---

## 🎯 IMPLEMENTATION CHECKLIST

**Step 1: Add 4 Actions to organization.ts**
- [ ] updateActivityResponsibleRolesAction (main update)
- [ ] addActivityResponsibleRoleAction (append)
- [ ] removeActivityResponsibleRoleAction (remove)
- [ ] getActivityResponsibleRolesAction (read-only query)

**Step 2: Update Existing Action**
- [ ] Modify `updateActivityAction` to accept `responsible_roles` param

**Step 3: Add Audit Logging**
- [ ] Implement `logAuditEvent` call in each write action

**Step 4: Testing**
- [ ] 8 unit tests in `__tests__/organization.test.ts`
- [ ] 2 integration tests
- [ ] Error case coverage

**Step 5: CodeRabbit Review**
- [ ] Run CodeRabbit CLI
- [ ] Fix any CRITICAL/HIGH issues
- [ ] Document any accepted patterns

---

## 📊 EFFORT BREAKDOWN

- Action implementation: 2h
- Error handling + validation: 1.5h
- Audit logging: 1h
- Tests (unit + integration): 2.5h
- CodeRabbit review + fixes: 1.5h
- **Total:** 8h (within 6-8h estimate)

---

**Status:** 🟡 **READY FOR CODING**

**File Location:** `src/app/actions/organization.ts`

**Next:** Story 11.8 (Activity-System UI) begins after 11.7 integration complete.


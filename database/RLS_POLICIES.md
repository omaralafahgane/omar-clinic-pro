# Row Level Security (RLS) Policies - Omar Clinic Pro

## Overview

Row Level Security (RLS) is PostgreSQL's built-in security feature that enforces data access rules at the database level. All tables in Omar Clinic Pro have RLS enabled to ensure multi-tenant data isolation.

## RLS Architecture

### Security Model

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Next.js, Clerk Authentication)        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│         API Layer                       │
│  (Next.js API Routes)                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      RLS Policies (Database Level)      │
│  - Clinic Isolation                     │
│  - Role-Based Access Control            │
│  - Audit Logging                        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│  (Supabase)                             │
└─────────────────────────────────────────┘
```

## Helper Functions

### 1. get_current_clinic_id()

```sql
CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

**Purpose:** Get the clinic ID of the current authenticated user
**Usage:** Used in all RLS policies to enforce clinic isolation

### 2. get_current_user_role()

```sql
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
  SELECT r.name FROM users u 
  JOIN roles r ON u.role_id = r.id 
  WHERE u.id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

**Purpose:** Get the role name of the current user
**Usage:** Used for role-based access control

### 3. is_admin()

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.id = auth.uid() AND r.name = 'admin'
  );
$$ LANGUAGE SQL STABLE;
```

**Purpose:** Check if current user is an admin
**Usage:** Admin override policies

### 4. is_clinic_owner()

```sql
CREATE OR REPLACE FUNCTION is_clinic_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.id = auth.uid() AND r.name = 'clinic_owner'
  );
$$ LANGUAGE SQL STABLE;
```

**Purpose:** Check if current user is a clinic owner
**Usage:** Clinic owner management policies

---

## RLS Policies by Table

### ROLES Table

**Purpose:** Define system roles (admin, clinic_owner, doctor, staff, patient)

#### Policy 1: Read Access for Authenticated Users
```sql
CREATE POLICY "Roles: Allow read for authenticated users" ON roles
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);
```
- **Action:** SELECT
- **Who:** All authenticated users
- **Condition:** Role is not deleted
- **Purpose:** All users can see available roles

#### Policy 2: Admin Management
```sql
CREATE POLICY "Roles: Allow admin to manage roles" ON roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```
- **Action:** ALL (SELECT, INSERT, UPDATE, DELETE)
- **Who:** Admins only
- **Purpose:** Only admins can create/modify roles

---

### CLINICS Table

**Purpose:** Store clinic information and subscription data

#### Policy 1: Admin View All
```sql
CREATE POLICY "Clinics: Allow admin to view all clinics" ON clinics
  FOR SELECT
  TO authenticated
  USING (is_admin() OR deleted_at IS NULL);
```
- **Action:** SELECT
- **Who:** Admins
- **Purpose:** Admins can see all clinics

#### Policy 2: Clinic Owner View Own
```sql
CREATE POLICY "Clinics: Allow clinic owner to view own clinic" ON clinics
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    id IN (SELECT clinic_id FROM users WHERE id = auth.uid())
  );
```
- **Action:** SELECT
- **Who:** Clinic owners
- **Condition:** User's clinic_id matches
- **Purpose:** Clinic owners can only see their clinic

#### Policy 3: Clinic Owner Update Own
```sql
CREATE POLICY "Clinics: Allow clinic owner to update own clinic" ON clinics
  FOR UPDATE
  TO authenticated
  USING (
    is_clinic_owner() AND 
    id IN (SELECT clinic_id FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    is_clinic_owner() AND 
    id IN (SELECT clinic_id FROM users WHERE id = auth.uid())
  );
```
- **Action:** UPDATE
- **Who:** Clinic owners
- **Purpose:** Clinic owners can update their clinic settings

#### Policy 4: Admin Management
```sql
CREATE POLICY "Clinics: Allow admin to manage all clinics" ON clinics
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```
- **Action:** ALL
- **Who:** Admins
- **Purpose:** Admins can manage all clinics

---

### USERS Table

**Purpose:** Store system users (staff, doctors, admins)

#### Policy 1: User View Own Profile
```sql
CREATE POLICY "Users: Allow user to view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    clinic_id = get_current_clinic_id()
  );
```
- **Action:** SELECT
- **Who:** All authenticated users
- **Condition:** Own profile OR same clinic
- **Purpose:** Users can see their profile and clinic colleagues

#### Policy 2: Clinic Owner Manage Users
```sql
CREATE POLICY "Users: Allow clinic owner to manage clinic users" ON users
  FOR ALL
  TO authenticated
  USING (
    is_clinic_owner() AND 
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    is_clinic_owner() AND 
    clinic_id = get_current_clinic_id()
  );
```
- **Action:** ALL
- **Who:** Clinic owners
- **Purpose:** Clinic owners can manage their clinic's users

#### Policy 3: Admin Management
```sql
CREATE POLICY "Users: Allow admin to manage all users" ON users
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```
- **Action:** ALL
- **Who:** Admins
- **Purpose:** Admins can manage all users

---

### PATIENTS Table

**Purpose:** Store patient records

#### Policy 1: Clinic Staff View
```sql
CREATE POLICY "Patients: Allow clinic staff to view patients" ON patients
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```
- **Action:** SELECT
- **Who:** Clinic staff and admins
- **Condition:** Same clinic
- **Purpose:** Staff can only see patients in their clinic

#### Policy 2: Clinic Staff Manage
```sql
CREATE POLICY "Patients: Allow clinic staff to manage patients" ON patients
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );
```
- **Action:** ALL
- **Who:** Clinic staff
- **Purpose:** Staff can create/update/delete patients in their clinic

#### Policy 3: Admin Management
```sql
CREATE POLICY "Patients: Allow admin to manage all patients" ON patients
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```
- **Action:** ALL
- **Who:** Admins
- **Purpose:** Admins can manage all patients

---

### DOCTORS Table

**Purpose:** Store doctor information

#### Policy 1: Clinic Staff View
```sql
CREATE POLICY "Doctors: Allow clinic staff to view doctors" ON doctors
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: Clinic Owner Manage
```sql
CREATE POLICY "Doctors: Allow clinic owner to manage doctors" ON doctors
  FOR ALL
  TO authenticated
  USING (
    is_clinic_owner() AND 
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    is_clinic_owner() AND 
    clinic_id = get_current_clinic_id()
  );
```

#### Policy 3: Admin Management
```sql
CREATE POLICY "Doctors: Allow admin to manage all doctors" ON doctors
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

### APPOINTMENTS Table

**Purpose:** Store appointment records

#### Policy 1: Clinic Staff View
```sql
CREATE POLICY "Appointments: Allow clinic staff to view appointments" ON appointments
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: Clinic Staff Manage
```sql
CREATE POLICY "Appointments: Allow clinic staff to manage appointments" ON appointments
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );
```

#### Policy 3: Admin Management
```sql
CREATE POLICY "Appointments: Allow admin to manage all appointments" ON appointments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

### TREATMENTS Table

**Purpose:** Store treatment records

#### Policy 1: Clinic Staff View
```sql
CREATE POLICY "Treatments: Allow clinic staff to view treatments" ON treatments
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: Clinic Staff Manage
```sql
CREATE POLICY "Treatments: Allow clinic staff to manage treatments" ON treatments
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );
```

#### Policy 3: Admin Management
```sql
CREATE POLICY "Treatments: Allow admin to manage all treatments" ON treatments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

### INVOICES Table

**Purpose:** Store billing records

#### Policy 1: Clinic Staff View
```sql
CREATE POLICY "Invoices: Allow clinic staff to view invoices" ON invoices
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: Clinic Staff Manage
```sql
CREATE POLICY "Invoices: Allow clinic staff to manage invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );
```

#### Policy 3: Admin Management
```sql
CREATE POLICY "Invoices: Allow admin to manage all invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

### PAYMENTS Table

**Purpose:** Store payment records

#### Policy 1: Clinic Staff View
```sql
CREATE POLICY "Payments: Allow clinic staff to view payments" ON payments
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: Clinic Staff Manage
```sql
CREATE POLICY "Payments: Allow clinic staff to manage payments" ON payments
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );
```

#### Policy 3: Admin Management
```sql
CREATE POLICY "Payments: Allow admin to manage all payments" ON payments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

### SUBSCRIPTIONS Table

**Purpose:** Store clinic subscription information

#### Policy 1: Clinic Owner View
```sql
CREATE POLICY "Subscriptions: Allow clinic owner to view own subscription" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: Clinic Owner Update
```sql
CREATE POLICY "Subscriptions: Allow clinic owner to update own subscription" ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    is_clinic_owner() AND 
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    is_clinic_owner() AND 
    clinic_id = get_current_clinic_id()
  );
```

#### Policy 3: Admin Management
```sql
CREATE POLICY "Subscriptions: Allow admin to manage all subscriptions" ON subscriptions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

### ACTIVITY_LOGS Table

**Purpose:** Store audit trail

#### Policy 1: Clinic Staff View Own Clinic Logs
```sql
CREATE POLICY "Activity Logs: Allow clinic staff to view own clinic logs" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );
```

#### Policy 2: System Insert Logs
```sql
CREATE POLICY "Activity Logs: Allow system to insert logs" ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id = get_current_clinic_id() OR is_admin());
```

#### Policy 3: Admin View All Logs
```sql
CREATE POLICY "Activity Logs: Allow admin to view all logs" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());
```

---

## Audit Triggers

### Trigger Function

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  -- Determine clinic_id based on table
  CASE TG_TABLE_NAME
    WHEN 'users' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'doctors' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'patients' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'appointments' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'treatments' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'invoices' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'payments' THEN v_clinic_id := NEW.clinic_id;
    WHEN 'clinics' THEN v_clinic_id := NEW.id;
    ELSE v_clinic_id := NULL;
  END CASE;

  -- Insert audit log
  INSERT INTO activity_logs (
    clinic_id, user_id, entity_type, entity_id,
    action, old_values, new_values, status
  ) VALUES (
    v_clinic_id, auth.uid(), TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    LOWER(TG_OP),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    'success'
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
```

### Triggers Attached

- `audit_users` - Track user changes
- `audit_doctors` - Track doctor changes
- `audit_patients` - Track patient changes
- `audit_appointments` - Track appointment changes
- `audit_treatments` - Track treatment changes
- `audit_invoices` - Track invoice changes
- `audit_payments` - Track payment changes

---

## Tenant Isolation Strategy

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────┐
│        Clinic A                         │
│  ├─ Users (5)                           │
│  ├─ Patients (100)                      │
│  ├─ Doctors (3)                         │
│  ├─ Appointments (50)                   │
│  └─ Invoices (200)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Clinic B                         │
│  ├─ Users (8)                           │
│  ├─ Patients (250)                      │
│  ├─ Doctors (5)                         │
│  ├─ Appointments (120)                  │
│  └─ Invoices (500)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Clinic C                         │
│  ├─ Users (3)                           │
│  ├─ Patients (50)                       │
│  ├─ Doctors (2)                         │
│  ├─ Appointments (25)                   │
│  └─ Invoices (100)                      │
└─────────────────────────────────────────┘
```

### Isolation Enforcement

1. **Database Level**
   - Every table has `clinic_id` column
   - RLS policies enforce clinic_id filtering
   - No cross-clinic queries possible

2. **Application Level**
   - Get clinic_id from authenticated user
   - Always include clinic_id in queries
   - Validate clinic_id before operations

3. **Audit Level**
   - All access logged with clinic_id
   - Track who accessed what data
   - Detect unauthorized access attempts

### Data Flow

```
User Login (Clerk)
    ↓
Get User Record (clinic_id)
    ↓
Set clinic_id in Session
    ↓
Query Database
    ↓
RLS Policy Checks
    ├─ Is user authenticated?
    ├─ Does clinic_id match?
    ├─ Does user have role permission?
    └─ Return filtered data
    ↓
Log Activity
    ↓
Return to User
```

---

## Testing RLS Policies

### Test 1: Clinic Isolation

```sql
-- User from Clinic A tries to access Clinic B patients
-- Should return 0 rows

SET request.jwt.claims = '{"sub":"user-clinic-b-id"}';
SELECT * FROM patients WHERE clinic_id != get_current_clinic_id();
-- Result: 0 rows (policy blocks access)
```

### Test 2: Role-Based Access

```sql
-- Staff member tries to create a role
-- Should fail

SET request.jwt.claims = '{"sub":"staff-user-id"}';
INSERT INTO roles (name, description) VALUES ('new_role', 'test');
-- Result: ERROR - policy violation
```

### Test 3: Admin Override

```sql
-- Admin accesses any clinic data
-- Should succeed

SET request.jwt.claims = '{"sub":"admin-user-id"}';
SELECT * FROM patients;
-- Result: All patients from all clinics
```

---

## Performance Considerations

### Index Strategy

```sql
-- Clinic isolation index
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);

-- Status filtering
CREATE INDEX idx_appointments_status ON appointments(status);

-- Combined for common queries
CREATE INDEX idx_appointments_clinic_status 
ON appointments(clinic_id, status);

-- Timestamp queries
CREATE INDEX idx_activity_logs_created_at 
ON activity_logs(created_at DESC);
```

### Query Optimization

```sql
-- Good: Uses indexes
SELECT * FROM appointments 
WHERE clinic_id = $1 AND status = 'scheduled';

-- Bad: Full table scan
SELECT * FROM appointments 
WHERE reason_for_visit LIKE '%pain%';
```

---

## Troubleshooting

### Common Errors

**Error:** `new row violates row-level security policy`
- **Cause:** clinic_id doesn't match user's clinic
- **Solution:** Verify clinic_id in INSERT/UPDATE

**Error:** `permission denied for schema public`
- **Cause:** User role doesn't have permission
- **Solution:** Check user role and RLS policies

**Error:** `relation does not exist`
- **Cause:** Table not created or RLS not enabled
- **Solution:** Run migrations and verify table exists

---

## Best Practices

1. **Always filter by clinic_id** in application queries
2. **Use prepared statements** to prevent SQL injection
3. **Log sensitive operations** in activity_logs
4. **Test RLS policies** before production
5. **Monitor audit logs** for suspicious activity
6. **Review policies quarterly** for security updates

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0
**Status:** Production Ready

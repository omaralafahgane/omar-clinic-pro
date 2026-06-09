-- Omar Clinic Pro - Row Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- Description: Implement multi-tenant data isolation and security policies
-- Created: 2026-06-09

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's clinic ID
CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
  SELECT r.name FROM users u 
  JOIN roles r ON u.role_id = r.id 
  WHERE u.id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.id = auth.uid() AND r.name = 'admin'
  );
$$ LANGUAGE SQL STABLE;

-- Check if user is clinic owner
CREATE OR REPLACE FUNCTION is_clinic_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.id = auth.uid() AND r.name = 'clinic_owner'
  );
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- ROLES TABLE POLICIES
-- ============================================================================
CREATE POLICY "Roles: Allow read for authenticated users" ON roles
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Roles: Allow admin to manage roles" ON roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- CLINICS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Clinics: Allow admin to view all clinics" ON clinics
  FOR SELECT
  TO authenticated
  USING (is_admin() OR deleted_at IS NULL);

CREATE POLICY "Clinics: Allow clinic owner to view own clinic" ON clinics
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    id IN (SELECT clinic_id FROM users WHERE id = auth.uid())
  );

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

CREATE POLICY "Clinics: Allow admin to manage all clinics" ON clinics
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Users: Allow user to view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    clinic_id = get_current_clinic_id()
  );

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

CREATE POLICY "Users: Allow admin to manage all users" ON users
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- DOCTORS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Doctors: Allow clinic staff to view doctors" ON doctors
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

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

CREATE POLICY "Doctors: Allow admin to manage all doctors" ON doctors
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- PATIENTS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Patients: Allow clinic staff to view patients" ON patients
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

CREATE POLICY "Patients: Allow clinic staff to manage patients" ON patients
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );

CREATE POLICY "Patients: Allow admin to manage all patients" ON patients
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Appointments: Allow clinic staff to view appointments" ON appointments
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

CREATE POLICY "Appointments: Allow clinic staff to manage appointments" ON appointments
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );

CREATE POLICY "Appointments: Allow admin to manage all appointments" ON appointments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TREATMENTS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Treatments: Allow clinic staff to view treatments" ON treatments
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

CREATE POLICY "Treatments: Allow clinic staff to manage treatments" ON treatments
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );

CREATE POLICY "Treatments: Allow admin to manage all treatments" ON treatments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- INVOICES TABLE POLICIES
-- ============================================================================
CREATE POLICY "Invoices: Allow clinic staff to view invoices" ON invoices
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

CREATE POLICY "Invoices: Allow clinic staff to manage invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );

CREATE POLICY "Invoices: Allow admin to manage all invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Payments: Allow clinic staff to view payments" ON payments
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

CREATE POLICY "Payments: Allow clinic staff to manage payments" ON payments
  FOR ALL
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id()
  )
  WITH CHECK (
    clinic_id = get_current_clinic_id()
  );

CREATE POLICY "Payments: Allow admin to manage all payments" ON payments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Subscriptions: Allow clinic owner to view own subscription" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

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

CREATE POLICY "Subscriptions: Allow admin to manage all subscriptions" ON subscriptions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- ACTIVITY_LOGS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Activity Logs: Allow clinic staff to view own clinic logs" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    clinic_id = get_current_clinic_id() OR 
    is_admin()
  );

CREATE POLICY "Activity Logs: Allow system to insert logs" ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id = get_current_clinic_id() OR is_admin());

CREATE POLICY "Activity Logs: Allow admin to view all logs" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- AUDIT TRIGGER FUNCTION
-- ============================================================================
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
    clinic_id,
    user_id,
    entity_type,
    entity_id,
    action,
    old_values,
    new_values,
    status
  ) VALUES (
    v_clinic_id,
    auth.uid(),
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    LOWER(TG_OP),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    'success'
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ATTACH AUDIT TRIGGERS
-- ============================================================================
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_doctors AFTER INSERT OR UPDATE OR DELETE ON doctors
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_treatments AFTER INSERT OR UPDATE OR DELETE ON treatments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- RLS Policies created: 30+
-- Helper functions created: 4
-- Audit triggers created: 7
-- All tables now have multi-tenant security
-- Next: Run 003_seed_data.sql for initial data

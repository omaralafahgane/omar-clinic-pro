-- ============================================================================
-- Omar Clinic Pro - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Get current user's clinic_id from metadata
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT clinic_id FROM users
        WHERE clerk_id = auth.jwt() ->> 'sub'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get current user's role
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM users
        WHERE clerk_id = auth.jwt() ->> 'sub'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Is current user super_admin?
-- ============================================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROLES - Public read
-- ============================================================================
CREATE POLICY "roles_read_all" ON roles
    FOR SELECT USING (true);

-- ============================================================================
-- CLINICS
-- ============================================================================
-- Super admin sees all clinics
CREATE POLICY "clinics_super_admin_all" ON clinics
    FOR ALL USING (is_super_admin());

-- Clinic members see their own clinic
CREATE POLICY "clinics_members_select" ON clinics
    FOR SELECT USING (id = get_user_clinic_id());

-- Clinic owner can update their clinic
CREATE POLICY "clinics_owner_update" ON clinics
    FOR UPDATE USING (
        id = get_user_clinic_id()
        AND get_user_role() IN ('clinic_owner', 'super_admin')
    );

-- ============================================================================
-- USERS
-- ============================================================================
-- Super admin sees all users
CREATE POLICY "users_super_admin_all" ON users
    FOR ALL USING (is_super_admin());

-- Users see members of their own clinic
CREATE POLICY "users_same_clinic_select" ON users
    FOR SELECT USING (clinic_id = get_user_clinic_id());

-- Users can update their own profile
CREATE POLICY "users_self_update" ON users
    FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Clinic owner can manage users in their clinic
CREATE POLICY "users_clinic_owner_manage" ON users
    FOR ALL USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('clinic_owner', 'super_admin')
    );

-- Allow service role to insert/upsert (for Clerk webhooks)
CREATE POLICY "users_service_insert" ON users
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- DOCTORS
-- ============================================================================
CREATE POLICY "doctors_same_clinic_all" ON doctors
    FOR ALL USING (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

-- ============================================================================
-- PATIENTS
-- ============================================================================
-- All clinic staff can read patients
CREATE POLICY "patients_clinic_staff_select" ON patients
    FOR SELECT USING (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

-- Doctors, owners, receptionists can create/update patients
CREATE POLICY "patients_clinic_staff_write" ON patients
    FOR INSERT WITH CHECK (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'doctor', 'receptionist')
    );

CREATE POLICY "patients_clinic_staff_update" ON patients
    FOR UPDATE USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'doctor', 'receptionist')
    );

-- Only owners/admins can delete (soft delete)
CREATE POLICY "patients_owner_delete" ON patients
    FOR DELETE USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner')
    );

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================
CREATE POLICY "appointments_clinic_staff_select" ON appointments
    FOR SELECT USING (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

CREATE POLICY "appointments_clinic_staff_write" ON appointments
    FOR INSERT WITH CHECK (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'doctor', 'receptionist')
    );

CREATE POLICY "appointments_clinic_staff_update" ON appointments
    FOR UPDATE USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'doctor', 'receptionist')
    );

-- ============================================================================
-- TREATMENTS
-- ============================================================================
CREATE POLICY "treatments_clinic_all" ON treatments
    FOR ALL USING (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

-- ============================================================================
-- INVOICES
-- ============================================================================
CREATE POLICY "invoices_clinic_select" ON invoices
    FOR SELECT USING (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

-- Accountants and owners manage invoices
CREATE POLICY "invoices_finance_write" ON invoices
    FOR INSERT WITH CHECK (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'accountant', 'receptionist')
    );

CREATE POLICY "invoices_finance_update" ON invoices
    FOR UPDATE USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'accountant')
    );

-- ============================================================================
-- INVOICE ITEMS
-- ============================================================================
CREATE POLICY "invoice_items_via_invoice" ON invoice_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE clinic_id = get_user_clinic_id()
        )
        OR is_super_admin()
    );

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE POLICY "payments_clinic_select" ON payments
    FOR SELECT USING (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

CREATE POLICY "payments_finance_write" ON payments
    FOR INSERT WITH CHECK (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('super_admin', 'clinic_owner', 'accountant')
    );

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================
CREATE POLICY "subscriptions_super_admin_all" ON subscriptions
    FOR ALL USING (is_super_admin());

CREATE POLICY "subscriptions_clinic_owner_select" ON subscriptions
    FOR SELECT USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('clinic_owner', 'super_admin')
    );

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================
CREATE POLICY "activity_logs_super_admin_all" ON activity_logs
    FOR ALL USING (is_super_admin());

CREATE POLICY "activity_logs_clinic_owner_select" ON activity_logs
    FOR SELECT USING (
        clinic_id = get_user_clinic_id()
        AND get_user_role() IN ('clinic_owner', 'super_admin')
    );

-- All authenticated clinic members can insert logs
CREATE POLICY "activity_logs_insert" ON activity_logs
    FOR INSERT WITH CHECK (
        clinic_id = get_user_clinic_id()
        OR is_super_admin()
    );

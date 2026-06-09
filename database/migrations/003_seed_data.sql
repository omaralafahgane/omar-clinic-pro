-- Omar Clinic Pro - Seed Data
-- Migration: 003_seed_data.sql
-- Description: Insert initial roles and sample data for development
-- Created: 2026-06-09

-- ============================================================================
-- SEED ROLES
-- ============================================================================
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'System administrator with full access', '{"all": true}'::jsonb),
  ('clinic_owner', 'Clinic owner with clinic management access', '{"clinics": true, "users": true, "doctors": true, "patients": true, "appointments": true, "invoices": true}'::jsonb),
  ('doctor', 'Doctor with patient and appointment access', '{"patients": true, "appointments": true, "treatments": true}'::jsonb),
  ('staff', 'Clinic staff with limited access', '{"patients": true, "appointments": true}'::jsonb),
  ('patient', 'Patient with self-service access', '{"own_appointments": true, "own_records": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED SAMPLE CLINIC
-- ============================================================================
INSERT INTO clinics (
  name, email, phone, address, city, state, postal_code, country,
  subscription_plan, subscription_status, trial_ends_at
) VALUES (
  'Omar Clinic Pro - Demo',
  'demo@omarclinicp.com',
  '+966501234567',
  '123 Medical Street',
  'Riyadh',
  'Riyadh Region',
  '11111',
  'Saudi Arabia',
  'advanced',
  'trial',
  CURRENT_TIMESTAMP + INTERVAL '14 days'
) ON CONFLICT (email) DO NOTHING;

-- Get the clinic ID for subsequent inserts
-- Note: In production, use actual clinic IDs

-- ============================================================================
-- SEED SAMPLE USERS
-- ============================================================================
-- Note: These are placeholder users. In production, use Clerk for auth
-- INSERT INTO users (clinic_id, email, first_name, last_name, role_id, is_active)
-- SELECT 
--   c.id,
--   'admin@omarclinicp.com',
--   'Admin',
--   'User',
--   r.id,
--   true
-- FROM clinics c, roles r
-- WHERE c.email = 'demo@omarclinicp.com' AND r.name = 'admin'
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SEED SAMPLE DOCTORS
-- ============================================================================
-- Note: Uncomment and adjust when clinic data is available
-- INSERT INTO doctors (
--   clinic_id, first_name, last_name, email, phone,
--   specialization, license_number, is_active
-- )
-- SELECT
--   c.id,
--   'Ahmed',
--   'Al-Dosari',
--   'ahmed.dosari@omarclinicp.com',
--   '+966501111111',
--   'General Medicine',
--   'LIC-001-2026',
--   true
-- FROM clinics c
-- WHERE c.email = 'demo@omarclinicp.com'
-- ON CONFLICT (license_number) DO NOTHING;

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- Roles seeded: 5
-- Sample clinic created: 1
-- Ready for production data import
-- Note: User creation should be handled through Clerk in Step 4

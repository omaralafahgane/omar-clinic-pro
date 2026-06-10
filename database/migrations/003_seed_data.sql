-- Omar Clinic Pro - Seed Data (CORRECTED)
-- Migration: 003_seed_data.sql
-- Description: Insert initial roles and sample data for development
-- Created: 2026-06-09
-- Status: CORRECTED - Removed subscription columns from clinic, added subscription record

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
-- SEED SAMPLE CLINIC (CORRECTED - NO subscription columns)
-- ============================================================================
INSERT INTO clinics (
  name, email, phone, address, city, state, postal_code, country
) VALUES (
  'Omar Clinic Pro - Demo',
  'demo@omarclinicp.com',
  '+966501234567',
  '123 Medical Street',
  'Riyadh',
  'Riyadh Region',
  '11111',
  'Saudi Arabia'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SEED SAMPLE SUBSCRIPTION (NEW - linked to demo clinic)
-- ============================================================================
INSERT INTO subscriptions (
  clinic_id,
  plan,
  status,
  start_date,
  end_date,
  renewal_date,
  auto_renew,
  price,
  currency,
  billing_cycle,
  next_billing_date
)
SELECT
  c.id,
  'advanced',
  'trial',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '14 days',
  CURRENT_TIMESTAMP + INTERVAL '14 days',
  true,
  0.00,
  'SAR',
  'monthly',
  CURRENT_TIMESTAMP + INTERVAL '14 days'
FROM clinics c
WHERE c.email = 'demo@omarclinicp.com'
ON CONFLICT DO NOTHING;

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
-- Sample subscription created: 1 (linked to demo clinic)
-- Ready for production data import
-- Note: User creation should be handled through Clerk in Step 4
-- Note: Subscription data now stored in subscriptions table (not clinics)

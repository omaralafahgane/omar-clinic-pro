-- Omar Clinic Pro - Verification Queries
-- Run these queries after applying migrations to verify production readiness
-- Created: 2026-06-09

-- ============================================================================
-- SECTION 1: VERIFY SCHEMA STRUCTURE
-- ============================================================================

-- Query 1.1: List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected Result: 11 tables
-- - activity_logs
-- - appointments
-- - clinics
-- - doctors
-- - invoices
-- - patients
-- - payments
-- - roles
-- - subscriptions
-- - treatments
-- - users

-- ============================================================================
-- SECTION 2: VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Query 2.1: List all foreign key constraints
SELECT 
  constraint_name,
  table_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
JOIN information_schema.key_column_usage kcu2 ON rc.unique_constraint_name = kcu2.constraint_name
WHERE rc.constraint_schema = 'public'
ORDER BY table_name, constraint_name;

-- Expected Result: 21 foreign key relationships

-- ============================================================================
-- SECTION 3: VERIFY UNIQUE CONSTRAINTS
-- ============================================================================

-- Query 3.1: Check multi-tenant unique constraints
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.constraint_column_usage
WHERE constraint_schema = 'public' 
  AND constraint_name LIKE '%unique%'
ORDER BY table_name, constraint_name;

-- Expected Results:
-- - users_clinic_id_email_unique (clinic-scoped)
-- - patients_clinic_id_number_unique (clinic-scoped)
-- - appointments_clinic_id_number_unique (clinic-scoped)
-- - invoices_clinic_id_number_unique (clinic-scoped)
-- - payments_clinic_id_number_unique (clinic-scoped)
-- - clinics_email_key (global - clinic unique)
-- - clinics_license_number_key (global - clinic unique)
-- - doctors_license_number_key (global - doctor unique)

-- ============================================================================
-- SECTION 4: VERIFY RLS POLICIES
-- ============================================================================

-- Query 4.1: List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected Result: 50+ policies across all tables

-- Query 4.2: Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected Result: All tables should have rowsecurity = true

-- ============================================================================
-- SECTION 5: VERIFY TRIGGERS
-- ============================================================================

-- Query 5.1: List all triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected Triggers:
-- - update_*_updated_at (11 triggers for each table)
-- - audit_* (10 triggers on data tables, NOT on activity_logs)

-- Query 5.2: Verify updated_at triggers exist
SELECT COUNT(*) as updated_at_trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE 'update_%_updated_at';

-- Expected Result: 11

-- Query 5.3: Verify audit triggers exist
SELECT COUNT(*) as audit_trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE 'audit_%';

-- Expected Result: 10 (NOT on activity_logs)

-- ============================================================================
-- SECTION 6: VERIFY FUNCTIONS
-- ============================================================================

-- Query 6.1: List all security functions
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_updated_at_column',
    'audit_trigger_function',
    'get_user_clinic_id',
    'get_user_role',
    'is_super_admin',
    'is_clinic_owner',
    'is_doctor'
  )
ORDER BY routine_name;

-- Expected Result: 7 functions
-- All should have security_type = 'DEFINER'

-- ============================================================================
-- SECTION 7: VERIFY INDEXES
-- ============================================================================

-- Query 7.1: Count indexes by table
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Expected Result: 60+ total indexes

-- Query 7.2: List composite indexes (for performance)
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%clinic_%'
ORDER BY tablename, indexname;

-- Expected Result: Multiple composite indexes with clinic_id

-- ============================================================================
-- SECTION 8: VERIFY VIEWS
-- ============================================================================

-- Query 8.1: List all views
SELECT 
  table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected Result: clinic_subscription_status view

-- ============================================================================
-- SECTION 9: VERIFY CONSTRAINTS
-- ============================================================================

-- Query 9.1: List all check constraints
SELECT 
  constraint_name,
  table_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
ORDER BY table_name, constraint_name;

-- Expected Constraints:
-- - appointments_time_check (end_time > start_time)
-- - invoices_date_check (due_date >= invoice_date)
-- - subscriptions_date_check (end_date >= start_date)
-- - roles_name_check (valid role names)
-- - clinics subscription_plan check
-- - clinics subscription_status check
-- - doctors appointment_type check
-- - payments payment_method check
-- - subscriptions billing_cycle check

-- ============================================================================
-- SECTION 10: VERIFY SOFT DELETE SUPPORT
-- ============================================================================

-- Query 10.1: Verify deleted_at columns exist on all tables
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'deleted_at'
ORDER BY table_name;

-- Expected Result: 11 tables with deleted_at column

-- ============================================================================
-- SECTION 11: DATA INTEGRITY CHECKS
-- ============================================================================

-- Query 11.1: Count rows in each table
SELECT 
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected Result: Shows row counts for all tables

-- Query 11.2: Check for orphaned records (foreign key violations)
-- This query checks if there are any patients without a clinic
SELECT COUNT(*) as orphaned_patients
FROM patients
WHERE clinic_id NOT IN (SELECT id FROM clinics WHERE deleted_at IS NULL);

-- Expected Result: 0

-- Query 11.3: Check for orphaned users
SELECT COUNT(*) as orphaned_users
FROM users
WHERE clinic_id NOT IN (SELECT id FROM clinics WHERE deleted_at IS NULL);

-- Expected Result: 0

-- ============================================================================
-- SECTION 12: AUDIT LOGGING VERIFICATION
-- ============================================================================

-- Query 12.1: Check audit log structure
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- Expected Columns:
-- - id (UUID)
-- - clinic_id (UUID)
-- - user_id (UUID)
-- - action (VARCHAR)
-- - entity_type (VARCHAR)
-- - entity_id (UUID)
-- - old_values (JSONB)
-- - new_values (JSONB)
-- - ip_address (VARCHAR)
-- - user_agent (TEXT)
-- - created_at (TIMESTAMP)
-- - deleted_at (TIMESTAMP)

-- Query 12.2: Verify audit triggers are working
SELECT COUNT(*) as audit_log_count
FROM activity_logs;

-- Expected Result: Should increase as data changes

-- ============================================================================
-- SECTION 13: PRODUCTION READINESS SUMMARY
-- ============================================================================

-- Query 13.1: Production Readiness Report
SELECT 
  'Tables' as component,
  COUNT(*) as count,
  'Expected: 11' as expected
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'RLS Policies',
  COUNT(*),
  'Expected: 50+'
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Triggers',
  COUNT(*),
  'Expected: 20+'
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 
  'Indexes',
  COUNT(*),
  'Expected: 60+'
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Functions',
  COUNT(*),
  'Expected: 7'
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';

-- ============================================================================
-- SECTION 14: MANUAL VERIFICATION STEPS
-- ============================================================================

-- After running the above queries, verify:
--
-- 1. ✅ All 11 tables exist
-- 2. ✅ 21 foreign key relationships are configured
-- 3. ✅ Multi-tenant unique constraints are in place (5 clinic-scoped)
-- 4. ✅ 50+ RLS policies are defined
-- 5. ✅ RLS is enabled on all tables
-- 6. ✅ 11 updated_at triggers exist
-- 7. ✅ 10 audit triggers exist (NOT on activity_logs)
-- 8. ✅ 7 security functions exist with SECURITY DEFINER
-- 9. ✅ 60+ indexes exist
-- 10. ✅ clinic_subscription_status view exists
-- 11. ✅ All check constraints are in place
-- 12. ✅ deleted_at columns on all 11 tables
-- 13. ✅ No orphaned records
-- 14. ✅ Audit logging structure is correct
--
-- If all checks pass: ✅ PRODUCTION READY
-- If any check fails: ❌ REVIEW AND FIX BEFORE DEPLOYMENT

-- ============================================================================
-- END OF VERIFICATION QUERIES
-- ============================================================================

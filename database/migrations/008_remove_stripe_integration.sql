-- Migration: Remove Stripe Integration
-- Date: 2026-06-18
-- Description: Remove all Stripe-related tables and columns from the database

-- 1. Drop stripe_customers table if it exists
DROP TABLE IF EXISTS stripe_customers CASCADE;

-- 2. Remove Stripe-related columns from subscriptions table
ALTER TABLE subscriptions
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS current_period_start,
DROP COLUMN IF EXISTS current_period_end;

-- 3. Log the migration
INSERT INTO activity_logs (action, entity_type, new_values)
VALUES (
  'MIGRATION_APPLIED',
  'database',
  jsonb_build_object(
    'migration', '008_remove_stripe_integration',
    'timestamp', NOW(),
    'changes', ARRAY[
      'Dropped stripe_customers table',
      'Removed Stripe columns from subscriptions',
      'Cleaned up Stripe-related indexes'
    ]
  )
) ON CONFLICT DO NOTHING;

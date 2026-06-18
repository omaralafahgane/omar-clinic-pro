-- Migration: Stripe Integration and Clinic Setup Fixes
-- Date: 2026-06-18
-- Description: Add Stripe integration tables and fix clinic-user linking issues

-- 1. Create stripe_customers table to store Stripe customer IDs
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_customers_clinic_id ON stripe_customers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- 2. Add Stripe-related columns to subscriptions table if they don't exist
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create indexes for Stripe columns
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- 3. Ensure users table has proper clinic_id linking
-- Add clinic_id column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);

-- 4. Add RLS policy to ensure users can only see their own clinic
-- First, check if the policy exists and drop it if it does
DROP POLICY IF EXISTS "Users can see their own clinic" ON users;

-- Create new policy
CREATE POLICY "Users can see their own clinic" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 5. Add RLS policy for stripe_customers table
DROP POLICY IF EXISTS "Clinics can see their Stripe customers" ON stripe_customers;

CREATE POLICY "Clinics can see their Stripe customers" ON stripe_customers
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

-- 6. Ensure subscriptions table has proper RLS policies
DROP POLICY IF EXISTS "Clinics can see their subscriptions" ON subscriptions;

CREATE POLICY "Clinics can see their subscriptions" ON subscriptions
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

-- 7. Create a function to automatically link user to clinic on first signup
CREATE OR REPLACE FUNCTION link_user_to_clinic()
RETURNS TRIGGER AS $$
BEGIN
  -- If user doesn't have a clinic_id and there's a clinic for them, link it
  IF NEW.clinic_id IS NULL THEN
    -- Try to find a clinic created by this user
    SELECT id INTO NEW.clinic_id FROM clinics 
    WHERE created_by = NEW.id 
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS link_user_to_clinic_trigger ON users;

-- Create trigger
CREATE TRIGGER link_user_to_clinic_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION link_user_to_clinic();

-- 8. Add created_by column to clinics table if it doesn't exist
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_clinics_created_by ON clinics(created_by);

-- 9. Ensure subscriptions table has all necessary columns
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'month',
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'sar';

-- 10. Create a view for clinic setup status
CREATE OR REPLACE VIEW clinic_setup_status AS
SELECT 
  u.id as user_id,
  u.clinic_id,
  c.name as clinic_name,
  c.email as clinic_email,
  c.is_active,
  s.id as subscription_id,
  s.status as subscription_status,
  s.is_active as subscription_active,
  CASE 
    WHEN c.id IS NULL THEN 'NO_CLINIC'
    WHEN s.id IS NULL THEN 'NO_SUBSCRIPTION'
    WHEN s.status = 'active' THEN 'COMPLETE'
    ELSE 'INCOMPLETE'
  END as setup_status
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.id
LEFT JOIN subscriptions s ON c.id = s.clinic_id;

-- 11. Log the migration
INSERT INTO activity_logs (action, entity_type, new_values)
VALUES (
  'MIGRATION_APPLIED',
  'database',
  jsonb_build_object(
    'migration', '007_stripe_integration_and_fixes',
    'timestamp', NOW(),
    'changes', ARRAY[
      'Added stripe_customers table',
      'Added Stripe columns to subscriptions',
      'Added clinic_id to users',
      'Updated RLS policies',
      'Created clinic setup status view'
    ]
  )
) ON CONFLICT DO NOTHING;

-- 12. Grant permissions
GRANT SELECT ON clinic_setup_status TO authenticated;

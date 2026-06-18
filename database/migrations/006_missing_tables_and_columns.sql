-- Omar Clinic Pro - Missing Tables and Columns
-- Migration: 006_missing_tables_and_columns.sql
-- Description: Add prescriptions, inventory, and missing columns (clerk_id, shopify_subscription_id)

-- ============================================================================
-- 1. UPDATE EXISTING TABLES
-- ============================================================================

-- Add clerk_id to patients for portal linking
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_patients_clerk_id ON patients(clerk_id);

-- Add clerk_id to doctors for portal linking
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_doctors_clerk_id ON doctors(clerk_id);

-- Add shopify_subscription_id to subscriptions for webhook tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS shopify_subscription_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_id ON subscriptions(shopify_subscription_id);

-- ============================================================================
-- 2. PRESCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  prescription_number VARCHAR(50) NOT NULL UNIQUE,
  diagnosis TEXT,
  medications JSONB NOT NULL DEFAULT '[]', -- [{name, dosage, frequency, duration, notes}]
  instructions TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_clinic_id ON prescriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- ============================================================================
-- 3. INVENTORY TABLES
-- ============================================================================

-- Inventory Items (Medicine, Supplies)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- 'medicine', 'supply', 'equipment'
  sku VARCHAR(100),
  description TEXT,
  unit VARCHAR(50) DEFAULT 'piece', -- 'piece', 'box', 'ml', 'mg'
  min_stock_level INT DEFAULT 10,
  current_stock_level INT DEFAULT 0,
  unit_price DECIMAL(10, 2),
  expiry_date DATE,
  supplier_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_inventory_clinic_id ON inventory_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory_items(expiry_date);

-- Inventory Transactions (Stock In/Out)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'return')),
  quantity INT NOT NULL,
  reason TEXT,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inv_trans_clinic_id ON inventory_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inv_trans_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_trans_created_at ON inventory_transactions(created_at);

-- ============================================================================
-- 4. ENABLE RLS
-- ============================================================================
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Basic multi-tenant policies (matching the pattern in 002_rls_policies.sql)
CREATE POLICY prescriptions_tenant_isolation ON prescriptions
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY inventory_items_tenant_isolation ON inventory_items
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY inventory_transactions_tenant_isolation ON inventory_transactions
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- ============================================================================
-- 5. AUDIT TRIGGERS
-- ============================================================================
CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_inventory_items AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================================================
CREATE TRIGGER set_updated_at_prescriptions BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_inventory_items BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Omar Clinic Pro - Seed Data
-- Migration: 003_seed_data.sql
-- ============================================================================

-- ============================================================================
-- ROLES
-- ============================================================================
INSERT INTO roles (name, description) VALUES
    ('super_admin',   'مسؤول النظام الكامل - وصول كامل لجميع العيادات والبيانات'),
    ('clinic_owner',  'مالك العيادة - إدارة كاملة لعيادته'),
    ('doctor',        'طبيب - إدارة المرضى والمواعيد والعلاجات'),
    ('receptionist',  'موظف الاستقبال - إدارة المواعيد والمرضى'),
    ('accountant',    'محاسب - إدارة الفواتير والمدفوعات')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- DEMO CLINIC (for development/testing)
-- ============================================================================
INSERT INTO clinics (
    id,
    name,
    email,
    phone,
    address,
    city,
    country,
    owner_id,
    is_active,
    subscription_status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'عيادة عمر التجريبية',
    'demo@omar-clinic.com',
    '+962791234567',
    'شارع الرابع، عمارة 12',
    'عمان',
    'الأردن',
    'demo_owner_clerk_id',
    TRUE,
    'trial'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- DEMO SUBSCRIPTION
-- ============================================================================
INSERT INTO subscriptions (
    clinic_id,
    plan,
    status,
    started_at,
    expires_at,
    monthly_price,
    currency
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'trial',
    'active',
    NOW(),
    NOW() + INTERVAL '14 days',
    0,
    'USD'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFY SEED DATA
-- ============================================================================
DO $$
BEGIN
    -- Check roles
    IF (SELECT COUNT(*) FROM roles) < 5 THEN
        RAISE EXCEPTION 'ERROR: Roles not seeded correctly';
    END IF;

    RAISE NOTICE '✅ Roles seeded: % rows', (SELECT COUNT(*) FROM roles);
    RAISE NOTICE '✅ Clinics seeded: % rows', (SELECT COUNT(*) FROM clinics);
    RAISE NOTICE '✅ Subscriptions seeded: % rows', (SELECT COUNT(*) FROM subscriptions);
    RAISE NOTICE '🎉 Seed data applied successfully!';
END;
$$;

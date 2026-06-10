-- ============================================================================
-- Omar Clinic Pro - Database Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLINICS
-- ============================================================================
CREATE TABLE clinics (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(50),
    address     TEXT,
    city        VARCHAR(100),
    country     VARCHAR(100),
    logo_url    TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ============================================================================
-- USERS (مزامنة مع Clerk)
-- ============================================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id    VARCHAR(255) UNIQUE NOT NULL,
    clinic_id   UUID REFERENCES clinics(id) ON DELETE SET NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100),
    phone       VARCHAR(50),
    avatar_url  TEXT,
    role        VARCHAR(50) NOT NULL DEFAULT 'receptionist',
                -- super_admin | clinic_owner | doctor | receptionist | accountant
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ============================================================================
-- DOCTORS
-- ============================================================================
CREATE TABLE doctors (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(255),
    phone             VARCHAR(50),
    specialization    VARCHAR(255),
    license_number    VARCHAR(100) UNIQUE,
    bio               TEXT,
    avatar_url        TEXT,
    consultation_fee  DECIMAL(10,2),
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

-- ============================================================================
-- PATIENTS
-- ============================================================================
CREATE TABLE patients (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id                 UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    first_name                VARCHAR(100) NOT NULL,
    last_name                 VARCHAR(100) NOT NULL,
    email                     VARCHAR(255),
    phone                     VARCHAR(50),
    date_of_birth             DATE,
    gender                    VARCHAR(10), -- male | female
    blood_type                VARCHAR(5),
    address                   TEXT,
    city                      VARCHAR(100),
    emergency_contact_name    VARCHAR(255),
    emergency_contact_phone   VARCHAR(50),
    medical_history           TEXT,
    allergies                 TEXT,
    notes                     TEXT,
    is_active                 BOOLEAN DEFAULT TRUE,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW(),
    deleted_at                TIMESTAMPTZ
);

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================
CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INTEGER DEFAULT 30,
    type                VARCHAR(50) DEFAULT 'consultation',
                        -- consultation | follow_up | checkup | emergency
    status              VARCHAR(50) DEFAULT 'scheduled',
                        -- scheduled | confirmed | completed | cancelled | no_show
    chief_complaint     TEXT,
    diagnosis           TEXT,
    notes               TEXT,
    cancellation_reason TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVOICES
-- ============================================================================
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number  VARCHAR(100) NOT NULL,
    status          VARCHAR(50) DEFAULT 'draft',
                    -- draft | sent | paid | partially_paid | overdue | cancelled
    subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount        DECIMAL(10,2) DEFAULT 0,
    tax             DECIMAL(10,2) DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid     DECIMAL(10,2) DEFAULT 0,
    currency        VARCHAR(10) DEFAULT 'JOD',
    due_date        DATE,
    notes           TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, invoice_number)
);

-- ============================================================================
-- INVOICE ITEMS
-- ============================================================================
CREATE TABLE invoice_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description  VARCHAR(255) NOT NULL,
    quantity     INTEGER DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,
    total_price  DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    invoice_id       UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   VARCHAR(50), -- cash | card | bank_transfer | insurance
    payment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number VARCHAR(255),
    notes            TEXT,
    created_by       UUID REFERENCES users(id),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTIONS (اشتراكات العيادات في النظام SaaS)
-- ============================================================================
CREATE TABLE subscriptions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id    UUID UNIQUE NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    plan         VARCHAR(50) NOT NULL DEFAULT 'trial',
                 -- trial | basic | professional | enterprise
    status       VARCHAR(50) NOT NULL DEFAULT 'trial',
                 -- trial | active | cancelled | expired
    started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ,
    price        DECIMAL(10,2),
    currency     VARCHAR(10) DEFAULT 'USD',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_users_clerk_id       ON users(clerk_id);
CREATE INDEX idx_users_clinic_id      ON users(clinic_id);
CREATE INDEX idx_doctors_clinic_id    ON doctors(clinic_id);
CREATE INDEX idx_patients_clinic_id   ON patients(clinic_id);
CREATE INDEX idx_patients_phone       ON patients(phone);
CREATE INDEX idx_appointments_clinic  ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor  ON appointments(doctor_id);
CREATE INDEX idx_appointments_date    ON appointments(scheduled_at);
CREATE INDEX idx_invoices_clinic      ON invoices(clinic_id);
CREATE INDEX idx_invoices_patient     ON invoices(patient_id);
CREATE INDEX idx_invoices_status      ON invoices(status);
CREATE INDEX idx_payments_invoice     ON payments(invoice_id);

-- ============================================================================
-- AUTO updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clinics','users','doctors','patients',
    'appointments','invoices','subscriptions'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE clinics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- دالة مساعدة: clinic_id للمستخدم الحالي
CREATE OR REPLACE FUNCTION my_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub' LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- دالة مساعدة: role للمستخدم الحالي
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE clerk_id = auth.jwt() ->> 'sub' LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- CLINICS
CREATE POLICY clinics_read   ON clinics FOR SELECT USING (id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY clinics_update ON clinics FOR UPDATE USING (id = my_clinic_id() AND my_role() IN ('clinic_owner','super_admin'));

-- USERS
CREATE POLICY users_read     ON users FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY users_insert   ON users FOR INSERT WITH CHECK (true); -- Clerk webhook
CREATE POLICY users_update   ON users FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub' OR my_role() IN ('clinic_owner','super_admin'));

-- DOCTORS
CREATE POLICY doctors_read   ON doctors FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY doctors_write  ON doctors FOR ALL    USING (clinic_id = my_clinic_id() AND my_role() IN ('clinic_owner','super_admin'));

-- PATIENTS
CREATE POLICY patients_read  ON patients FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY patients_write ON patients FOR ALL    USING (clinic_id = my_clinic_id() AND my_role() IN ('clinic_owner','doctor','receptionist','super_admin'));

-- APPOINTMENTS
CREATE POLICY appts_read     ON appointments FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY appts_write    ON appointments FOR ALL    USING (clinic_id = my_clinic_id() AND my_role() IN ('clinic_owner','doctor','receptionist','super_admin'));

-- INVOICES
CREATE POLICY invoices_read  ON invoices FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY invoices_write ON invoices FOR ALL    USING (clinic_id = my_clinic_id() AND my_role() IN ('clinic_owner','accountant','receptionist','super_admin'));

-- INVOICE ITEMS
CREATE POLICY items_all      ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE clinic_id = my_clinic_id())
  OR my_role() = 'super_admin'
);

-- PAYMENTS
CREATE POLICY payments_read  ON payments FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY payments_write ON payments FOR ALL    USING (clinic_id = my_clinic_id() AND my_role() IN ('clinic_owner','accountant','super_admin'));

-- SUBSCRIPTIONS
CREATE POLICY subs_read      ON subscriptions FOR SELECT USING (clinic_id = my_clinic_id() OR my_role() = 'super_admin');
CREATE POLICY subs_manage    ON subscriptions FOR ALL    USING (my_role() = 'super_admin');

-- ============================================================================
-- SEED: DEMO CLINIC
-- ============================================================================
INSERT INTO clinics (name, email, phone, city, country, is_active)
VALUES ('عيادة تجريبية', 'demo@omar-clinic.com', '+962791234567', 'عمان', 'الأردن', TRUE);

INSERT INTO subscriptions (clinic_id, plan, status, expires_at)
SELECT id, 'trial', 'trial', NOW() + INTERVAL '14 days' FROM clinics WHERE email = 'demo@omar-clinic.com';

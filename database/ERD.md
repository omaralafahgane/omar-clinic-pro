# Entity Relationship Diagram (ERD) - Omar Clinic Pro

## Database Relationships Overview

### Complete ERD (ASCII Art)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          OMAR CLINIC PRO DATABASE                            │
└──────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────┐
                                    │  ROLES  │
                                    │─────────│
                                    │ id (PK) │
                                    │ name    │
                                    │ perms   │
                                    └────┬────┘
                                         │
                                    1:N  │
                                         │
                    ┌────────────────────▼────────────────────┐
                    │          USERS                          │
                    │  ──────────────────────────────────     │
                    │  id (PK)                                │
                    │  clinic_id (FK) ──────────┐            │
                    │  email (UNIQUE)           │            │
                    │  first_name, last_name    │            │
                    │  role_id (FK) ────┐       │            │
                    │  is_active         │       │            │
                    │  created_at        │       │            │
                    │  updated_at        │       │            │
                    │  deleted_at        │       │            │
                    └────────────────────┼───────┼────────────┘
                                         │       │
                                    1:N  │       │  N:1
                                         │       │
                    ┌────────────────────┼───────▼────────────┐
                    │          CLINICS                        │
                    │  ──────────────────────────────────     │
                    │  id (PK)                                │
                    │  name                                   │
                    │  email (UNIQUE)                         │
                    │  phone                                  │
                    │  address, city, state, country          │
                    │  subscription_plan                      │
                    │  subscription_status                    │
                    │  trial_ends_at                          │
                    │  created_at, updated_at, deleted_at     │
                    └────────────────────┬─────────────────────┘
                                         │
                ┌────────────────────────┼────────────────────┐
                │                        │                    │
            1:N │                        │ 1:N            1:1 │
                │                        │                    │
    ┌───────────▼──────────┐  ┌─────────▼──────────┐  ┌──────▼─────────────┐
    │      DOCTORS         │  │     PATIENTS       │  │  SUBSCRIPTIONS     │
    │  ────────────────    │  │  ────────────────  │  │  ──────────────    │
    │  id (PK)             │  │  id (PK)           │  │  id (PK)           │
    │  clinic_id (FK)      │  │  clinic_id (FK)    │  │  clinic_id (FK)    │
    │  user_id (FK)        │  │  first_name        │  │  plan              │
    │  first_name          │  │  last_name         │  │  status            │
    │  last_name           │  │  email             │  │  start_date        │
    │  email               │  │  phone             │  │  end_date          │
    │  phone               │  │  date_of_birth     │  │  price             │
    │  specialization      │  │  gender            │  │  currency          │
    │  license_number      │  │  blood_type        │  │  auto_renew        │
    │  is_active           │  │  address           │  │  created_at        │
    │  created_at          │  │  emergency_contact │  │  updated_at        │
    │  updated_at          │  │  medical_history   │  │  deleted_at        │
    │  deleted_at          │  │  allergies         │  └────────────────────┘
    └───────┬──────────────┘  │  created_at        │
            │                 │  updated_at        │
            │                 │  deleted_at        │
            │                 └────────┬───────────┘
            │                          │
            │                      1:N │
            │                          │
            │         ┌────────────────┼────────────────┐
            │         │                │                │
        1:N │     1:N │            1:N │            1:N │
            │         │                │                │
    ┌───────▼─────────▼────────────────▼────────────────▼──────┐
    │              APPOINTMENTS                                 │
    │  ──────────────────────────────────────────────────────  │
    │  id (PK)                                                  │
    │  clinic_id (FK)                                           │
    │  patient_id (FK)                                          │
    │  doctor_id (FK)                                           │
    │  appointment_number (UNIQUE)                              │
    │  start_time, end_time                                     │
    │  reason_for_visit                                         │
    │  status (scheduled, completed, cancelled, no-show)        │
    │  appointment_type (in-person, virtual, phone)             │
    │  reminder_sent, reminder_sent_at                          │
    │  created_at, updated_at, deleted_at                       │
    └────────┬────────────────────────────────────────────────┬─┘
             │                                                │
         1:N │                                            1:N │
             │                                                │
    ┌────────▼──────────────────┐              ┌──────────────▼────────┐
    │      TREATMENTS           │              │      INVOICES         │
    │  ──────────────────────   │              │  ──────────────────   │
    │  id (PK)                  │              │  id (PK)              │
    │  clinic_id (FK)           │              │  clinic_id (FK)       │
    │  appointment_id (FK)      │              │  patient_id (FK)      │
    │  patient_id (FK)          │              │  appointment_id (FK)  │
    │  doctor_id (FK)           │              │  invoice_number       │
    │  treatment_name           │              │  invoice_date         │
    │  diagnosis                │              │  due_date             │
    │  treatment_plan           │              │  subtotal             │
    │  medications (JSONB)      │              │  tax_amount           │
    │  procedures (JSONB)       │              │  discount_amount      │
    │  follow_up_date           │              │  total_amount         │
    │  status                   │              │  paid_amount          │
    │  cost                     │              │  balance_due          │
    │  created_at, updated_at   │              │  status               │
    │  deleted_at               │              │  created_at, updated_at
    └───────────────────────────┘              │  deleted_at           │
                                               └──────────┬────────────┘
                                                      1:N │
                                                          │
                                               ┌──────────▼──────────┐
                                               │     PAYMENTS        │
                                               │  ──────────────────│
                                               │  id (PK)            │
                                               │  clinic_id (FK)     │
                                               │  invoice_id (FK)    │
                                               │  patient_id (FK)    │
                                               │  payment_number     │
                                               │  amount             │
                                               │  payment_date       │
                                               │  payment_method     │
                                               │  reference_number   │
                                               │  transaction_id     │
                                               │  status             │
                                               │  created_at         │
                                               │  updated_at         │
                                               │  deleted_at         │
                                               └─────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         ACTIVITY_LOGS (Audit Trail)                          │
│  ────────────────────────────────────────────────────────────────────────    │
│  id (PK)                                                                     │
│  clinic_id (FK) - Links to CLINICS                                          │
│  user_id (FK) - Links to USERS                                              │
│  entity_type - Table name (users, patients, appointments, etc.)             │
│  entity_id - Record ID that was changed                                     │
│  action - create, read, update, delete, export, import, login, logout       │
│  old_values (JSONB) - Previous state                                        │
│  new_values (JSONB) - New state                                             │
│  ip_address - Source IP                                                     │
│  user_agent - Browser info                                                  │
│  status - success or failed                                                 │
│  created_at - Timestamp                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Matrix

| From | To | Type | Constraint | Cascade |
|------|-----|------|-----------|---------|
| users | roles | N:1 | FK | RESTRICT |
| users | clinics | N:1 | FK | CASCADE |
| doctors | clinics | N:1 | FK | CASCADE |
| doctors | users | N:1 | FK | SET NULL |
| patients | clinics | N:1 | FK | CASCADE |
| appointments | clinics | N:1 | FK | CASCADE |
| appointments | patients | N:1 | FK | CASCADE |
| appointments | doctors | N:1 | FK | CASCADE |
| treatments | clinics | N:1 | FK | CASCADE |
| treatments | appointments | N:1 | FK | CASCADE |
| treatments | patients | N:1 | FK | CASCADE |
| treatments | doctors | N:1 | FK | CASCADE |
| invoices | clinics | N:1 | FK | CASCADE |
| invoices | patients | N:1 | FK | CASCADE |
| invoices | appointments | N:1 | FK | SET NULL |
| payments | clinics | N:1 | FK | CASCADE |
| payments | invoices | N:1 | FK | CASCADE |
| payments | patients | N:1 | FK | CASCADE |
| subscriptions | clinics | 1:1 | FK | CASCADE |
| activity_logs | clinics | N:1 | FK | CASCADE |
| activity_logs | users | N:1 | FK | SET NULL |

---

## Data Flow Diagrams

### Patient Registration Flow

```
┌──────────────┐
│ New Patient  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Create Patient Record               │
│ - clinic_id (from session)          │
│ - first_name, last_name, email      │
│ - phone, date_of_birth, gender      │
│ - medical_history, allergies        │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ RLS Policy Check                    │
│ - Is user in same clinic?           │
│ - Does user have permission?        │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Insert into PATIENTS table          │
│ - Generate UUID id                  │
│ - Set created_at timestamp          │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Trigger: audit_patients             │
│ - Log to ACTIVITY_LOGS              │
│ - Record: CREATE action             │
│ - Store: new_values (JSONB)         │
└──────┬────────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Patient Created ✓    │
└──────────────────────┘
```

### Appointment Booking Flow

```
┌──────────────────────┐
│ Select Patient       │
│ Select Doctor        │
│ Select Date/Time     │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Create Appointment Record           │
│ - clinic_id (from session)          │
│ - patient_id (selected)             │
│ - doctor_id (selected)              │
│ - start_time, end_time              │
│ - reason_for_visit                  │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ RLS Policy Check                    │
│ - Clinic isolation check            │
│ - Patient exists in clinic?         │
│ - Doctor exists in clinic?          │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Insert into APPOINTMENTS table      │
│ - Generate appointment_number       │
│ - Set status = 'scheduled'          │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Trigger: audit_appointments         │
│ - Log to ACTIVITY_LOGS              │
└──────┬────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Appointment Booked ✓     │
│ Send Confirmation Email  │
└──────────────────────────┘
```

### Invoice & Payment Flow

```
┌──────────────────────────┐
│ Appointment Completed    │
└──────┬───────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Create Invoice                      │
│ - clinic_id (from session)          │
│ - patient_id (from appointment)     │
│ - appointment_id (reference)        │
│ - Calculate total_amount            │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Insert into INVOICES table          │
│ - status = 'draft'                  │
│ - Generate invoice_number           │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Patient Pays Invoice                │
│ - Select payment method             │
│ - Enter payment amount              │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Create Payment Record               │
│ - clinic_id (from session)          │
│ - invoice_id (reference)            │
│ - patient_id (reference)            │
│ - amount, payment_method            │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Insert into PAYMENTS table          │
│ - status = 'pending'                │
│ - Generate payment_number           │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Process Payment (External Gateway)  │
│ - Verify transaction                │
│ - Update payment status             │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Update PAYMENTS table               │
│ - status = 'completed'              │
│ - transaction_id (from gateway)     │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Update INVOICES table               │
│ - paid_amount += payment amount     │
│ - balance_due -= payment amount     │
│ - If balance_due = 0: status = 'paid'
└──────┬────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Payment Recorded ✓       │
│ Send Receipt Email       │
└──────────────────────────┘
```

---

## Cardinality Notation

### One-to-Many (1:N)

```
Clinics (1) ──────────── (N) Patients
  id                        clinic_id
  
One clinic can have many patients
One patient belongs to one clinic
```

### One-to-One (1:1)

```
Clinics (1) ──────────── (1) Subscriptions
  id                        clinic_id
  
One clinic has one subscription
One subscription belongs to one clinic
```

### Many-to-Many (N:M) - Implicit

```
Doctors (N) ──────────── (N) Appointments ──────────── (N) Patients
  id                        doctor_id                      patient_id
                           appointment_id
                           
One doctor can have many appointments
One appointment can have one doctor
One patient can have many appointments
One appointment can have one patient
```

---

## Key Constraints

### Primary Keys (UUID)

All tables use UUID primary keys:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Benefits:
- Globally unique
- No coordination needed
- Privacy (not sequential)
- Distributed-friendly

### Foreign Keys

All relationships enforced with foreign keys:

```sql
-- Clinic isolation
clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE

-- User to role
role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT

-- Optional relationships
user_id UUID REFERENCES users(id) ON DELETE SET NULL
```

### Unique Constraints

```sql
-- Email uniqueness
email VARCHAR(255) NOT NULL UNIQUE

-- License number uniqueness
license_number VARCHAR(100) NOT NULL UNIQUE

-- Invoice/Payment numbers
invoice_number VARCHAR(50) NOT NULL UNIQUE
payment_number VARCHAR(50) NOT NULL UNIQUE
```

### Check Constraints

```sql
-- Enum-like constraints
status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'trial'))
gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'O'))
payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'credit_card', ...))
```

---

## Indexing Strategy

### Clinic Isolation Indexes

```sql
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_invoices_clinic_id ON invoices(clinic_id);
```

### Status/State Indexes

```sql
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_status ON payments(status);
```

### Composite Indexes (Common Queries)

```sql
-- Clinic + Status
CREATE INDEX idx_appointments_clinic_status 
ON appointments(clinic_id, status);

-- Clinic + Timestamp
CREATE INDEX idx_activity_logs_clinic_created 
ON activity_logs(clinic_id, created_at DESC);
```

### Foreign Key Indexes

```sql
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
```

---

## Soft Delete Strategy

### Deleted Records

```sql
-- Record is NOT deleted, just marked
UPDATE patients SET deleted_at = NOW() WHERE id = $1;

-- Query excludes deleted records
SELECT * FROM patients WHERE deleted_at IS NULL;

-- Admin can see deleted records
SELECT * FROM patients WHERE deleted_at IS NOT NULL;
```

### Recovery

```sql
-- Restore deleted record
UPDATE patients SET deleted_at = NULL WHERE id = $1;

-- Permanent delete (rare)
DELETE FROM patients WHERE id = $1;
```

### Audit Trail

```sql
-- See what was deleted and when
SELECT entity_id, old_values, created_at 
FROM activity_logs 
WHERE entity_type = 'patients' AND action = 'delete';
```

---

## Performance Considerations

### Query Optimization Examples

**Good: Uses indexes**
```sql
SELECT * FROM appointments 
WHERE clinic_id = $1 AND status = 'scheduled' 
ORDER BY start_time ASC;
```

**Bad: Full table scan**
```sql
SELECT * FROM appointments 
WHERE reason_for_visit LIKE '%pain%';
```

**Good: Indexed join**
```sql
SELECT a.*, p.first_name, d.specialization
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.clinic_id = $1 AND a.status = 'scheduled';
```

---

## Compliance & Standards

- **HIPAA** - Healthcare data protection
- **GDPR** - Data privacy (soft deletes enable right to be forgotten)
- **ISO 27001** - Information security
- **SOC 2** - Security and availability

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0
**Status:** Production Ready

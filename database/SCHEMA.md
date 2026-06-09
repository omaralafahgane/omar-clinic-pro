# Omar Clinic Pro - Database Schema Documentation

## Overview

This document describes the production-ready multi-tenant database schema for Omar Clinic Pro. The schema is designed for security, scalability, and compliance with healthcare data standards.

**Database:** PostgreSQL (Supabase)
**Multi-tenant:** Yes (clinic-based isolation)
**RLS Enabled:** Yes (Row Level Security)
**Audit Logging:** Yes (Activity tracking)

---

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Tables Overview](#tables-overview)
3. [Entity Relationships](#entity-relationships)
4. [Security Model](#security-model)
5. [RLS Policies](#rls-policies)
6. [Audit Logging](#audit-logging)
7. [Migration Guide](#migration-guide)

---

## Database Architecture

### Multi-Tenant Design

The database uses a **clinic-based multi-tenant architecture** where:
- Each clinic is a separate tenant
- All data is isolated by `clinic_id`
- Row Level Security (RLS) enforces tenant isolation
- Clinic owners can only access their clinic's data
- Admins can access all clinic data

### Key Features

- **UUID Primary Keys** - Globally unique identifiers
- **Timestamps** - `created_at` and `updated_at` on all tables
- **Soft Deletes** - `deleted_at` field for data recovery
- **Foreign Keys** - Referential integrity constraints
- **Indexes** - Performance optimization for common queries
- **Audit Trail** - Complete activity logging

---

## Tables Overview

### 1. **ROLES** - User role definitions
```sql
- id (UUID, PK)
- name (VARCHAR, UNIQUE)
- description (TEXT)
- permissions (JSONB)
- created_at, updated_at, deleted_at
```
**Roles:** admin, clinic_owner, doctor, staff, patient

### 2. **CLINICS** - Clinic entities
```sql
- id (UUID, PK)
- name, email (UNIQUE), phone
- address, city, state, postal_code, country
- logo_url, website_url
- license_number (UNIQUE)
- subscription_plan (basic, advanced, enterprise)
- subscription_status (active, inactive, trial, suspended, cancelled)
- trial_ends_at, subscription_ends_at
- max_users, max_patients
- is_active
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 3. **USERS** - System users (staff, doctors, admins)
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- email (UNIQUE), first_name, last_name, phone
- avatar_url
- role_id (FK → roles)
- is_active
- last_login_at, password_changed_at
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 4. **DOCTORS** - Medical professionals
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- user_id (FK → users, nullable)
- first_name, last_name, email, phone
- specialization, sub_specialization
- license_number (UNIQUE), license_expiry_date
- bio, avatar_url
- qualification (JSONB array)
- experience_years
- consultation_fee
- is_active
- availability (JSONB)
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 5. **PATIENTS** - Patient records
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- first_name, last_name, email, phone
- date_of_birth, gender (M/F/O)
- blood_type
- address, city, state, postal_code, country
- emergency_contact_name, emergency_contact_phone
- medical_history, allergies, current_medications
- insurance_provider, insurance_policy_number
- patient_id_number (UNIQUE)
- is_active
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 6. **APPOINTMENTS** - Appointment scheduling
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- patient_id (FK → patients)
- doctor_id (FK → doctors)
- appointment_number (UNIQUE)
- start_time, end_time (TIMESTAMP WITH TIME ZONE)
- reason_for_visit, notes
- status (scheduled, confirmed, in-progress, completed, cancelled, no-show, rescheduled)
- appointment_type (in-person, virtual, phone)
- reminder_sent, reminder_sent_at
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 7. **TREATMENTS** - Treatment records
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- appointment_id (FK → appointments)
- patient_id (FK → patients)
- doctor_id (FK → doctors)
- treatment_name, treatment_code
- description, diagnosis, treatment_plan
- medications (JSONB array)
- procedures (JSONB array)
- follow_up_date, follow_up_notes
- status (active, completed, cancelled)
- cost
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 8. **INVOICES** - Billing records
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- patient_id (FK → patients)
- appointment_id (FK → appointments, nullable)
- invoice_number (UNIQUE)
- invoice_date, due_date
- subtotal, tax_amount, discount_amount
- total_amount, paid_amount, balance_due
- status (draft, sent, viewed, paid, partially_paid, overdue, cancelled)
- payment_terms, notes
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 9. **PAYMENTS** - Payment records
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- invoice_id (FK → invoices)
- patient_id (FK → patients)
- payment_number (UNIQUE)
- amount
- payment_date
- payment_method (cash, credit_card, debit_card, bank_transfer, check, insurance)
- reference_number, transaction_id
- status (pending, completed, failed, refunded)
- notes
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 10. **SUBSCRIPTIONS** - Clinic subscription management
```sql
- id (UUID, PK)
- clinic_id (UUID, FK → clinics, UNIQUE)
- plan (basic, advanced, enterprise)
- status (active, inactive, trial, suspended, cancelled)
- start_date, end_date, renewal_date
- auto_renew
- price, currency (default: SAR)
- billing_cycle (monthly, quarterly, annual)
- payment_method
- next_billing_date
- cancellation_reason, cancelled_at
- metadata (JSONB)
- created_at, updated_at, deleted_at
```

### 11. **ACTIVITY_LOGS** - Audit trail
```sql
- id (UUID, PK)
- clinic_id (FK → clinics)
- user_id (FK → users, nullable)
- entity_type, entity_id
- action (create, read, update, delete, export, import, login, logout)
- old_values, new_values (JSONB)
- ip_address, user_agent
- status (success, failed)
- error_message
- metadata (JSONB)
- created_at (TIMESTAMP WITH TIME ZONE)
```

---

## Entity Relationships

### ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROLES                                     │
│  (id, name, description, permissions)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1:N
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                        USERS                                     │
│  (id, clinic_id, email, role_id)                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    1:N  │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                       CLINICS                                    │
│  (id, name, email, subscription_plan, subscription_status)      │
└────────────────────────┬────────────────────────────────────────┘
        │                │                │                │
        │ 1:N            │ 1:N            │ 1:N            │ 1:1
        │                │                │                │
        ▼                ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐      ┌──────────────┐
    │DOCTORS │      │PATIENTS│      │INVOICES│      │SUBSCRIPTIONS │
    └────────┘      └────────┘      └────────┘      └──────────────┘
        │                │                │
        │ 1:N            │ 1:N            │ 1:N
        │                │                │
        ├────────────────┼────────────────┤
        │                │                │
        ▼                ▼                ▼
    ┌──────────────────────────────────────────┐
    │          APPOINTMENTS                    │
    │  (id, clinic_id, patient_id, doctor_id) │
    └──────────────────────────────────────────┘
        │
        │ 1:N
        │
        ▼
    ┌──────────────┐
    │ TREATMENTS   │
    │ PAYMENTS     │
    │ACTIVITY_LOGS │
    └──────────────┘
```

### Relationships Summary

| From | To | Type | Constraint |
|------|-----|------|-----------|
| users | roles | N:1 | FK, RESTRICT |
| users | clinics | N:1 | FK, CASCADE |
| doctors | clinics | N:1 | FK, CASCADE |
| doctors | users | N:1 | FK, SET NULL |
| patients | clinics | N:1 | FK, CASCADE |
| appointments | clinics | N:1 | FK, CASCADE |
| appointments | patients | N:1 | FK, CASCADE |
| appointments | doctors | N:1 | FK, CASCADE |
| treatments | clinics | N:1 | FK, CASCADE |
| treatments | appointments | N:1 | FK, CASCADE |
| treatments | patients | N:1 | FK, CASCADE |
| treatments | doctors | N:1 | FK, CASCADE |
| invoices | clinics | N:1 | FK, CASCADE |
| invoices | patients | N:1 | FK, CASCADE |
| invoices | appointments | N:1 | FK, SET NULL |
| payments | clinics | N:1 | FK, CASCADE |
| payments | invoices | N:1 | FK, CASCADE |
| payments | patients | N:1 | FK, CASCADE |
| subscriptions | clinics | 1:1 | FK, CASCADE |
| activity_logs | clinics | N:1 | FK, CASCADE |
| activity_logs | users | N:1 | FK, SET NULL |

---

## Security Model

### Multi-Tenant Isolation

Every table has a `clinic_id` field that identifies the tenant. RLS policies ensure:

1. **Clinic Isolation** - Users can only access data from their clinic
2. **Role-Based Access** - Different roles have different permissions
3. **Admin Override** - Admins can access all clinics
4. **Audit Trail** - All access is logged

### Data Protection

- **Soft Deletes** - Data is marked as deleted, not removed
- **Timestamps** - Track creation and modification times
- **Encryption** - Sensitive data encrypted at rest (Supabase)
- **HTTPS** - All data in transit encrypted

---

## RLS Policies

### Policy Structure

Each table has RLS policies for:
- **SELECT** - View data
- **INSERT** - Create records
- **UPDATE** - Modify records
- **DELETE** - Remove records (soft delete)

### Policy Examples

#### Clinics Table
```sql
-- Admins can view all clinics
SELECT: is_admin()

-- Clinic owners can view their clinic
SELECT: clinic_id = get_current_clinic_id()

-- Clinic owners can update their clinic
UPDATE: is_clinic_owner() AND clinic_id = get_current_clinic_id()
```

#### Patients Table
```sql
-- Clinic staff can view patients in their clinic
SELECT: clinic_id = get_current_clinic_id()

-- Clinic staff can manage patients in their clinic
ALL: clinic_id = get_current_clinic_id()

-- Admins can manage all patients
ALL: is_admin()
```

#### Appointments Table
```sql
-- Clinic staff can view appointments in their clinic
SELECT: clinic_id = get_current_clinic_id()

-- Clinic staff can manage appointments in their clinic
ALL: clinic_id = get_current_clinic_id()

-- Admins can manage all appointments
ALL: is_admin()
```

---

## Audit Logging

### Activity Tracking

The `activity_logs` table tracks all changes:

| Field | Purpose |
|-------|---------|
| entity_type | Table name (users, patients, etc.) |
| entity_id | Record ID |
| action | create, read, update, delete, export, import, login, logout |
| old_values | Previous record state (JSONB) |
| new_values | New record state (JSONB) |
| user_id | User who made the change |
| ip_address | Source IP address |
| user_agent | Browser/client information |
| status | success or failed |

### Audit Triggers

Automatic triggers on all tables capture:
- CREATE - New record inserted
- UPDATE - Record modified
- DELETE - Record soft deleted

---

## Migration Guide

### Running Migrations

Migrations should be run in order:

```bash
# 1. Create initial schema
psql -d your_database -f database/migrations/001_initial_schema.sql

# 2. Create RLS policies
psql -d your_database -f database/migrations/002_rls_policies.sql

# 3. Seed initial data
psql -d your_database -f database/migrations/003_seed_data.sql
```

### Supabase Migration

In Supabase:

1. Go to **SQL Editor**
2. Create new query
3. Copy and paste migration content
4. Execute

---

## Performance Optimization

### Indexes

All tables have indexes on:
- Primary keys (UUID)
- Foreign keys (clinic_id, etc.)
- Common filters (status, is_active, deleted_at)
- Timestamps (created_at, updated_at)
- Composite indexes for common queries

### Query Optimization

```sql
-- Fast: Uses index on clinic_id and status
SELECT * FROM appointments 
WHERE clinic_id = $1 AND status = 'scheduled';

-- Fast: Uses index on clinic_id and created_at
SELECT * FROM activity_logs 
WHERE clinic_id = $1 AND created_at > NOW() - INTERVAL '7 days';

-- Slow: Full table scan (avoid)
SELECT * FROM patients WHERE first_name LIKE '%Ahmed%';
```

---

## Compliance & Standards

- **HIPAA** - Healthcare data protection
- **GDPR** - Data privacy and right to be forgotten (soft deletes)
- **ISO 27001** - Information security
- **SOC 2** - Security and availability

---

## Next Steps

1. **Step 4** - Implement Clerk authentication
2. **Step 5** - Build landing page
3. **Step 6** - Build clinic dashboard
4. **Step 7** - Build admin dashboard
5. **Step 8** - Configure Resend email
6. **Step 9** - Configure Vercel deployment

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0
**Status:** Production Ready

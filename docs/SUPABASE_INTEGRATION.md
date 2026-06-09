# Supabase Integration Guide
# Omar Clinic Pro - Database Setup & Configuration

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Environment Configuration](#environment-configuration)
3. [Applying Migrations](#applying-migrations)
4. [Verifying Setup](#verifying-setup)
5. [Testing Database Connection](#testing-database-connection)
6. [CRUD Operations](#crud-operations)
7. [Troubleshooting](#troubleshooting)

---

## Project Setup

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** `omar-clinic-pro`
   - **Database Password:** Create a strong password
   - **Region:** Select closest to your location
4. Click **"Create new project"**
5. Wait for initialization (2-3 minutes)

### Step 2: Get API Keys

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Configure Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Environment Configuration

### .env.local Template

```bash
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============================================================================
# CLERK AUTHENTICATION
# ============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# ============================================================================
# APPLICATION SETTINGS
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Omar Clinic Pro
NODE_ENV=development
```

### Verifying Configuration

```bash
# Check if environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Applying Migrations

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy content from `database/migrations/001_initial_schema.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Repeat for:
   - `database/migrations/002_rls_policies.sql`
   - `database/migrations/003_seed_data.sql`

### Method 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Verify migrations
supabase db pull
```

### Migration Files

| File | Purpose | Tables Created |
|------|---------|-----------------|
| `001_initial_schema.sql` | Create all tables with indexes | 11 tables |
| `002_rls_policies.sql` | Enable RLS and create policies | Security policies |
| `003_seed_data.sql` | Insert sample data | 5 roles, 1 clinic |

---

## Verifying Setup

### Check Tables Created

1. Go to **Supabase Dashboard** → **Table Editor**
2. Verify these tables exist:
   - ✅ `roles`
   - ✅ `clinics`
   - ✅ `users`
   - ✅ `doctors`
   - ✅ `patients`
   - ✅ `appointments`
   - ✅ `treatments`
   - ✅ `invoices`
   - ✅ `payments`
   - ✅ `subscriptions`
   - ✅ `activity_logs`

### Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Verify policies are enabled for:
   - ✅ `clinics` - Clinic isolation
   - ✅ `users` - User access control
   - ✅ `patients` - Patient data isolation
   - ✅ `appointments` - Appointment access
   - ✅ `treatments` - Treatment records
   - ✅ `invoices` - Billing data
   - ✅ `payments` - Payment records

### Check Sample Data

1. Go to **Table Editor** → **roles**
2. Verify 5 roles exist:
   - `admin`
   - `clinic_owner`
   - `doctor`
   - `receptionist`
   - `accountant`

---

## Testing Database Connection

### Run Database Tests

```bash
# Install dependencies
npm install

# Run database tests
npm run test:db

# Expected output:
# ✅ Database connection successful
# ✅ Found 5 roles
# ✅ Clinic created successfully
# ✅ Clinic retrieved successfully
# ✅ Clinic updated successfully
# ✅ Patient created successfully
# ✅ Patient retrieved successfully
# ✅ Patient updated successfully
# ✅ Patient soft deleted successfully
# ✅ Activity logs retrieved successfully
# ✅ All tables exist
```

### Manual Connection Test

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Test connection
const { data, error } = await supabase.from("roles").select("count").single();

if (error) {
  console.error("Connection failed:", error);
} else {
  console.log("✅ Connection successful");
}
```

---

## CRUD Operations

### Create Operations

#### Create Clinic

```typescript
import { clinicsDb } from "@/lib/supabase";

const result = await clinicsDb.create({
  name: "Al-Noor Clinic",
  email: "info@alnoor.com",
  phone: "+966501234567",
  address: "123 Medical Street",
  city: "Riyadh",
  country: "Saudi Arabia",
  owner_id: "user-uuid",
});

if (result.success) {
  console.log("Clinic created:", result.data.id);
} else {
  console.error("Error:", result.error);
}
```

#### Create Patient

```typescript
import { patientsDb } from "@/lib/supabase";

const result = await patientsDb.create(clinicId, {
  first_name: "أحمد",
  last_name: "محمد",
  email: "patient@example.com",
  phone: "+966501234567",
  date_of_birth: "1990-01-15",
  gender: "M",
  address: "123 Patient Street",
  city: "Riyadh",
  country: "Saudi Arabia",
});

if (result.success) {
  console.log("Patient created:", result.data.id);
}
```

### Read Operations

#### Read Clinic

```typescript
import { clinicsDb } from "@/lib/supabase";

const result = await clinicsDb.findById(clinicId);

if (result.success) {
  console.log("Clinic:", result.data);
} else {
  console.error("Error:", result.error);
}
```

#### Read Patients by Clinic

```typescript
import { patientsDb } from "@/lib/supabase";

const result = await patientsDb.findByClinic(clinicId);

if (result.success) {
  console.log("Patients:", result.data);
  console.log("Total:", result.total);
}
```

### Update Operations

#### Update Clinic

```typescript
import { clinicsDb } from "@/lib/supabase";

const result = await clinicsDb.update(clinicId, {
  phone: "+966509876543",
  address: "456 New Street",
  city: "Jeddah",
});

if (result.success) {
  console.log("Clinic updated:", result.data);
}
```

#### Update Patient

```typescript
import { patientsDb } from "@/lib/supabase";

const result = await patientsDb.update(patientId, {
  phone: "+966509876543",
  allergies: "Penicillin, Aspirin",
  medical_history: "Updated medical history",
});

if (result.success) {
  console.log("Patient updated:", result.data);
}
```

### Delete Operations

#### Soft Delete Patient

```typescript
import { patientsDb } from "@/lib/supabase";

const result = await patientsDb.update(patientId, {
  deleted_at: new Date().toISOString(),
  is_active: false,
});

if (result.success) {
  console.log("Patient soft deleted");
}
```

#### Hard Delete (Admin Only)

```typescript
import { supabase } from "@/lib/supabase";

const { error } = await supabase
  .from("patients")
  .delete()
  .eq("id", patientId);

if (!error) {
  console.log("Patient permanently deleted");
}
```

---

## Database Schema Overview

### Roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Clinics Table

```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  subscription_plan VARCHAR(50),
  subscription_status VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Patients Table

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  medical_history TEXT,
  allergies TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

---

## Row Level Security (RLS)

### RLS Policies

All tables have RLS enabled with the following policies:

#### Clinic Isolation
- Users can only access their own clinic data
- Super Admin can access all clinics

#### Role-Based Access
- Doctors can only access assigned patients
- Receptionists can manage clinic appointments
- Accountants can access billing data

#### Soft Delete
- Deleted records are excluded from queries
- Only admins can view deleted records

### Enabling RLS

```sql
-- Enable RLS on table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy for clinic isolation
CREATE POLICY "Clinic isolation"
  ON patients
  FOR SELECT
  USING (clinic_id = auth.uid()::uuid);

-- Create policy for clinic owner
CREATE POLICY "Clinic owner access"
  ON patients
  FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM users WHERE id = auth.uid()
  ));
```

---

## Troubleshooting

### Connection Issues

**Problem:** "Cannot connect to Supabase"

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check internet connection
4. Verify Supabase project is active

### RLS Policy Errors

**Problem:** "new row violates row-level security policy"

**Solution:**
1. Verify user has `clinic_id` set
2. Check RLS policies in Supabase Dashboard
3. Verify user role has permission
4. Check audit logs for details

### Migration Failures

**Problem:** "Migration failed"

**Solution:**
1. Check SQL syntax in migration file
2. Verify all extensions are enabled
3. Check for duplicate table names
4. Review Supabase logs

### Performance Issues

**Problem:** "Queries are slow"

**Solution:**
1. Verify indexes are created
2. Check query complexity
3. Add indexes for frequently queried columns
4. Use pagination for large result sets

---

## Production Checklist

- ✅ Environment variables configured
- ✅ All migrations applied
- ✅ RLS policies enabled
- ✅ Database backups configured
- ✅ SSL enabled
- ✅ Connection pooling configured
- ✅ Monitoring enabled
- ✅ Error logging configured
- ✅ Database tests passing
- ✅ Performance optimized

---

## Support & Resources

- **Supabase Documentation:** https://supabase.com/docs
- **Supabase Dashboard:** https://app.supabase.com
- **Database Migrations:** `/database/migrations/`
- **Integration Tests:** `npm run test:db`

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0
**Status:** Production Ready

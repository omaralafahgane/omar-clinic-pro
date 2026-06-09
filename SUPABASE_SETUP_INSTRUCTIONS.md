# Supabase Setup Instructions
# Omar Clinic Pro - Complete Setup Guide

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Get API Keys from Supabase

1. Go to https://app.supabase.com
2. Select your `omar-clinic-pro` project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Create .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Apply Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy content from `database/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Repeat for `002_rls_policies.sql` and `003_seed_data.sql`

### Step 4: Verify Setup

```bash
# Run database tests
npm run test:db

# Expected output:
# ✅ Database connection successful
# ✅ All tables exist
# ✅ CRUD operations working
```

---

## 📋 Detailed Setup Process

### Prerequisites

- ✅ Supabase project created
- ✅ API keys obtained
- ✅ Node.js 18+ installed
- ✅ npm or pnpm installed

### Installation Steps

#### 1. Install Dependencies

```bash
cd /home/ubuntu/omar-clinic-pro
npm install
```

#### 2. Configure Environment Variables

Create `.env.local`:

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

#### 3. Apply Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy content from `database/migrations/001_initial_schema.sql`
6. Paste into editor
7. Click **Run**
8. Repeat for `002_rls_policies.sql`
9. Repeat for `003_seed_data.sql`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Verify
supabase db pull
```

#### 4. Verify Database Setup

**Check Tables**

1. Go to Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - ✅ `roles` (5 rows)
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

**Check RLS Policies**

1. Go to **Authentication** → **Policies**
2. Verify policies are enabled for all tables

**Check Sample Data**

1. Go to **Table Editor** → **roles**
2. Verify 5 roles:
   - `admin`
   - `clinic_owner`
   - `doctor`
   - `receptionist`
   - `accountant`

#### 5. Test Database Connection

```bash
# Run comprehensive database tests
npm run test:db

# Output should show:
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
# 🎉 All tests passed!
```

---

## 🔍 Verification Checklist

### Database Connection

```bash
# Test connection
npm run test:db

# Check output for:
# ✅ Database connection successful
```

### Tables Created

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return 11 tables
```

### RLS Policies Enabled

```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should return 30+ policies
```

### Sample Data Inserted

```sql
-- Run in Supabase SQL Editor
SELECT * FROM roles;
-- Should return 5 rows

SELECT COUNT(*) FROM clinics;
-- Should return at least 1
```

---

## 🧪 Testing CRUD Operations

### Create Operation

```typescript
import { clinicsDb } from "@/lib/supabase";

const result = await clinicsDb.create({
  name: "Test Clinic",
  email: "test@clinic.com",
  phone: "+966501234567",
  address: "123 Street",
  city: "Riyadh",
  country: "Saudi Arabia",
  owner_id: "user-uuid",
});

console.log(result); // { success: true, data: {...} }
```

### Read Operation

```typescript
import { clinicsDb } from "@/lib/supabase";

const result = await clinicsDb.findById(clinicId);

console.log(result); // { success: true, data: {...} }
```

### Update Operation

```typescript
import { clinicsDb } from "@/lib/supabase";

const result = await clinicsDb.update(clinicId, {
  phone: "+966509876543",
  city: "Jeddah",
});

console.log(result); // { success: true, data: {...} }
```

### Delete Operation (Soft Delete)

```typescript
import { patientsDb } from "@/lib/supabase";

const result = await patientsDb.update(patientId, {
  deleted_at: new Date().toISOString(),
  is_active: false,
});

console.log(result); // { success: true, data: {...} }
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev

# Server starts at http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
omar-clinic-pro/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── webhooks/clerk/      # Clerk webhook handler
│   ├── dashboard/
│   │   ├── admin/               # Admin dashboard
│   │   └── clinic/              # Clinic dashboard
│   ├── page.tsx                 # Home page
│   ├── login/page.tsx           # Login page
│   └── layout.tsx               # Root layout
├── database/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
├── lib/
│   ├── supabase.ts              # Supabase client & queries
│   ├── clerk.ts                 # Clerk auth utilities
│   └── utils.ts                 # Helper functions
├── docs/
│   ├── AUTHENTICATION.md        # Auth documentation
│   ├── SUPABASE_INTEGRATION.md  # Database documentation
│   └── API.md                   # API documentation
├── middleware.ts                # Route protection
├── .env.example                 # Environment template
└── package.json                 # Dependencies
```

---

## 🔐 Security Configuration

### Enable SSL

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Enable **SSL** for connections
3. Update connection string if needed

### Configure Backups

1. Go to **Settings** → **Backups**
2. Enable **Automated Backups**
3. Set backup frequency to **Daily**

### Set Up Monitoring

1. Go to **Monitoring** → **Database**
2. Enable **Query Performance**
3. Enable **Connection Monitoring**

---

## 🐛 Troubleshooting

### Connection Errors

**Error:** `Cannot connect to Supabase`

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check internet connection
4. Verify Supabase project is active

### RLS Policy Errors

**Error:** `new row violates row-level security policy`

**Solution:**
1. Verify user has `clinic_id` set
2. Check RLS policies in dashboard
3. Verify user role has permission
4. Check activity logs for details

### Migration Failures

**Error:** `Migration failed`

**Solution:**
1. Check SQL syntax
2. Verify all extensions are enabled
3. Check for duplicate table names
4. Review Supabase error logs

### Performance Issues

**Error:** `Queries are slow`

**Solution:**
1. Verify indexes are created
2. Check query complexity
3. Add indexes for frequently queried columns
4. Use pagination for large datasets

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub Issues:** https://github.com/omaralafahgane/omar-clinic-pro/issues

---

## ✅ Production Checklist

Before deploying to production:

- ✅ Environment variables configured
- ✅ All migrations applied
- ✅ RLS policies enabled
- ✅ SSL enabled
- ✅ Backups configured
- ✅ Monitoring enabled
- ✅ Database tests passing
- ✅ Performance optimized
- ✅ Security reviewed
- ✅ Error logging configured

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0
**Status:** Production Ready

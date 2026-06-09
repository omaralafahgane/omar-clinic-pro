# Supabase Setup Guide - Omar Clinic Pro

## Prerequisites

- Supabase account (https://supabase.com)
- Project created in Supabase
- Access to SQL Editor

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign in or create account
3. Click "New Project"
4. Fill in project details:
   - **Name:** omar-clinic-pro
   - **Database Password:** Use strong password
   - **Region:** Choose closest to your users
5. Click "Create new project"
6. Wait for project initialization (5-10 minutes)

## Step 2: Get Connection Credentials

After project creation:

1. Go to **Settings** → **Database**
2. Copy these credentials:
   - **Host:** `db.xxxxx.supabase.co`
   - **Port:** `5432`
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** Your database password

3. Go to **Settings** → **API**
4. Copy these credentials:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** (public key for frontend)
   - **Service Role Key:** (private key for backend)

## Step 3: Run Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy content from `database/migrations/001_initial_schema.sql`
4. Paste into editor
5. Click "Run"
6. Wait for completion

Repeat for:
- `database/migrations/002_rls_policies.sql`
- `database/migrations/003_seed_data.sql`

### Option B: Using psql CLI

```bash
# Connect to Supabase
psql postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Run migrations
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_rls_policies.sql
\i database/migrations/003_seed_data.sql

# Exit
\q
```

### Option C: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref xxxxx

# Run migrations
supabase db push

# View migrations
supabase migration list
```

## Step 4: Verify Installation

### Check Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
```
activity_logs
appointments
clinics
doctors
invoices
patients
payments
roles
subscriptions
treatments
users
```

### Check RLS Status

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `rowsecurity = true`

### Check Roles

```sql
SELECT * FROM roles;
```

Expected 5 roles:
- admin
- clinic_owner
- doctor
- staff
- patient

## Step 5: Update Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Clerk (Step 4)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Resend (Step 8)
RESEND_API_KEY=your_resend_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Test Connection

Create a test file `lib/supabase-test.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function testConnection() {
  try {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) throw error;
    console.log("✅ Supabase connected!");
    console.log("Roles:", data);
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}
```

Run test:
```bash
npx ts-node lib/supabase-test.ts
```

## Step 7: Enable Auth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - Email/Password
   - Google
   - GitHub
   - etc.

3. Configure redirect URLs:
   - Add `http://localhost:3000/auth/callback`
   - Add `https://yourdomain.com/auth/callback`

## Step 8: Backup Strategy

### Automatic Backups

Supabase automatically backs up daily. To restore:

1. Go to **Settings** → **Backups**
2. Select backup date
3. Click "Restore"

### Manual Backups

```bash
# Export database
pg_dump postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres > backup.sql

# Import database
psql postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres < backup.sql
```

## Step 9: Monitoring

### Check Database Health

1. Go to **Database** → **Health**
2. Monitor:
   - Connection count
   - Query performance
   - Disk usage

### View Logs

1. Go to **Logs** → **Postgres**
2. Filter by:
   - Timestamp
   - Severity
   - Query

## Troubleshooting

### Connection Issues

**Error:** `connection refused`
- Check database password
- Verify IP whitelist (if applicable)
- Check region selection

### RLS Issues

**Error:** `new row violates row-level security policy`
- Verify user has correct role
- Check clinic_id matches
- Review RLS policies

### Performance Issues

**Slow queries:**
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM appointments 
WHERE clinic_id = 'xxxxx' AND status = 'scheduled';

-- Add indexes if needed
CREATE INDEX idx_appointments_clinic_status 
ON appointments(clinic_id, status);
```

## Next Steps

1. **Step 4** - Implement Clerk authentication
2. **Step 5** - Build landing page
3. **Step 6** - Build clinic dashboard
4. **Step 7** - Build admin dashboard
5. **Step 8** - Configure Resend email
6. **Step 9** - Configure Vercel deployment

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.io
- GitHub Issues: https://github.com/supabase/supabase/issues

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0

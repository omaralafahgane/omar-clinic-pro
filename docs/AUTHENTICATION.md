# Authentication & Authorization Documentation
# Omar Clinic Pro - Clerk & Supabase Integration

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Clerk Setup](#clerk-setup)
3. [User Synchronization](#user-synchronization)
4. [Role-Based Access Control (RBAC)](#role-based-access-control)
5. [Route Protection](#route-protection)
6. [Middleware Implementation](#middleware-implementation)
7. [Webhook Configuration](#webhook-configuration)
8. [Audit Logging](#audit-logging)
9. [Permission Matrix](#permission-matrix)
10. [Implementation Examples](#implementation-examples)

---

## Authentication Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
│                   (Next.js 15 + React)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Clerk Authentication Service                    │
│  - Email/Password Login                                      │
│  - Google OAuth                                              │
│  - Session Management                                        │
│  - User Metadata Storage                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Middleware                              │
│  - Route Protection                                          │
│  - Role Verification                                         │
│  - Clinic Isolation                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Supabase Database with RLS                         │
│  - User Records                                              │
│  - Role Assignments                                          │
│  - Clinic Data Isolation                                     │
│  - Activity Audit Logs                                       │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User visits application
   ↓
2. Clerk checks authentication status
   ├─ If authenticated → Load user session
   └─ If not → Redirect to login
   ↓
3. Middleware verifies route access
   ├─ Check user role
   ├─ Check clinic_id (if applicable)
   └─ Allow or redirect
   ↓
4. Application loads protected content
   ↓
5. User actions logged to activity_logs
```

---

## Clerk Setup

### Environment Variables

Create `.env.local` with:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Clerk Dashboard Configuration

1. **Go to Clerk Dashboard** → Settings → API Keys
2. **Copy Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. **Copy Secret Key** → `CLERK_SECRET_KEY`
4. **Go to Webhooks** → Create Endpoint
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy Signing Secret → `CLERK_WEBHOOK_SECRET`

### Clerk Sign-In/Sign-Up Pages

```typescript
// app/login/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}

// app/sign-up/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
```

---

## User Synchronization

### Clerk Webhook Flow

```
Clerk Event Triggered
    ↓
POST /api/webhooks/clerk
    ↓
Verify Webhook Signature
    ↓
Parse Event Type
    ├─ user.created
    ├─ user.updated
    └─ user.deleted
    ↓
Sync to Supabase
    ├─ Create/Update/Delete user record
    ├─ Assign default role (patient)
    └─ Log activity
    ↓
Return Success/Error
```

### Webhook Handler Implementation

**File:** `app/api/webhooks/clerk/route.ts`

```typescript
export async function POST(req: Request) {
  // 1. Verify webhook signature
  const wh = new Webhook(webhookSecret);
  const evt = wh.verify(body, headers);

  // 2. Handle user.created
  if (evt.type === "user.created") {
    // Create user in Supabase
    // Assign patient role
    // Log activity
  }

  // 3. Handle user.updated
  if (evt.type === "user.updated") {
    // Update user in Supabase
    // Log activity
  }

  // 4. Handle user.deleted
  if (evt.type === "user.deleted") {
    // Soft delete user in Supabase
    // Log activity
  }
}
```

### Clinic Assignment Workflow

```
New User Signs Up
    ↓
Webhook creates user in Supabase (role: patient)
    ↓
User completes Free Trial signup
    ├─ Create clinic record
    ├─ Assign clinic_id to user
    └─ Change role to clinic_owner
    ↓
User can now access clinic dashboard
```

### Role Assignment Workflow

```
Clinic Owner invites staff
    ↓
Staff member signs up via email link
    ↓
Webhook creates user in Supabase
    ↓
Clinic Owner assigns role
    ├─ Update user.role_id in database
    ├─ Update Clerk metadata with role
    └─ Log role change
    ↓
Staff member now has role-specific access
```

---

## Role-Based Access Control (RBAC)

### 5 System Roles

#### 1. Super Admin
- **Description:** Full system access
- **Access:** All clinics, all data
- **Responsibilities:**
  - System configuration
  - Clinic management
  - User management
  - Subscription management
  - System reports

#### 2. Clinic Owner
- **Description:** Clinic management and staff oversight
- **Access:** Own clinic data only
- **Responsibilities:**
  - Clinic settings
  - Staff management
  - Doctor management
  - Patient management
  - Billing management
  - Clinic reports

#### 3. Doctor
- **Description:** Patient care and appointment management
- **Access:** Assigned patients and appointments
- **Responsibilities:**
  - View assigned patients
  - Manage appointments
  - Create treatment records
  - Update medical records
  - View personal reports

#### 4. Receptionist
- **Description:** Appointment and patient data management
- **Access:** Clinic patients and appointments
- **Responsibilities:**
  - Register new patients
  - Schedule appointments
  - Manage appointment status
  - View clinic reports

#### 5. Accountant
- **Description:** Billing and financial management
- **Access:** Clinic billing data only
- **Responsibilities:**
  - Create invoices
  - Record payments
  - View financial reports
  - Generate billing statements

---

## Route Protection

### Protected Routes Configuration

```typescript
// middleware.ts
const PROTECTED_ROUTES = {
  // Admin routes - Super Admin only
  admin: /^\/dashboard\/admin/,

  // Clinic routes - Multiple roles
  clinic: /^\/dashboard\/clinic/,

  // Doctor routes
  doctor: /^\/dashboard\/clinic\/patients/,

  // Receptionist routes
  receptionist: /^\/dashboard\/clinic\/appointments/,

  // Accountant routes
  accountant: /^\/dashboard\/clinic\/invoices/,
};
```

### Route Access Matrix

| Route | Super Admin | Clinic Owner | Doctor | Receptionist | Accountant |
|-------|:-----------:|:------------:|:------:|:------------:|:----------:|
| `/dashboard/admin` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard/clinic` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/clinic/patients` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/clinic/appointments` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/clinic/invoices` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/dashboard/clinic/reports` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/clinic/settings` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Middleware Implementation

### File: `middleware.ts`

```typescript
import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default authMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = auth();
  const pathname = req.nextUrl.pathname;

  // 1. Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users
  if (!userId && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Get user role and clinic ID
  const userRole = (sessionClaims?.metadata as any)?.role;
  const userClinicId = (sessionClaims?.metadata as any)?.clinic_id;

  // 4. Enforce role-based access
  if (pathname.startsWith("/dashboard/admin")) {
    if (userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard/clinic", req.url));
    }
  }

  // 5. Enforce clinic isolation
  if (pathname.startsWith("/dashboard/clinic")) {
    if (userRole !== "super_admin" && !userClinicId) {
      return NextResponse.redirect(new URL("/free-trial", req.url));
    }
  }

  return NextResponse.next();
});
```

---

## Webhook Configuration

### Webhook URL

```
https://yourdomain.com/api/webhooks/clerk
```

### Events to Subscribe

- `user.created` - New user registration
- `user.updated` - User profile changes
- `user.deleted` - User account deletion

### Webhook Signature Verification

```typescript
import { Webhook } from "svix";

const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

try {
  const evt = wh.verify(body, {
    "svix-id": headers.get("svix-id"),
    "svix-timestamp": headers.get("svix-timestamp"),
    "svix-signature": headers.get("svix-signature"),
  });
} catch (err) {
  // Webhook verification failed
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Audit Logging

### Logged Events

| Event | Entity | Action | Details |
|-------|--------|--------|---------|
| User Registration | users | create | Email, name, role |
| User Login | users | login | User ID, timestamp, IP |
| Failed Login | users | login_failed | Email, reason, IP |
| Role Change | users | update | Old role, new role |
| User Deletion | users | delete | User ID, timestamp |
| Account Creation | users | create | Clinic owner assignment |

### Activity Log Schema

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  user_id UUID,
  entity_type VARCHAR(50),
  entity_id UUID,
  action VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### Logging Example

```typescript
// Log user login
await activityLogsDb.log({
  clinic_id: user.clinic_id,
  user_id: user.id,
  entity_type: "users",
  entity_id: user.id,
  action: "login",
  ip_address: req.ip,
  user_agent: req.headers.get("user-agent"),
  status: "success",
});

// Log failed login
await activityLogsDb.log({
  clinic_id: clinicId,
  entity_type: "users",
  entity_id: userId,
  action: "login_failed",
  ip_address: req.ip,
  status: "failed",
  error_message: "Invalid credentials",
});
```

---

## Permission Matrix

### Resource-Level Permissions

```
┌─────────────────┬──────────┬──────────┬────────┬──────────────┬──────────┐
│ Resource        │ Admin    │ Owner    │ Doctor │ Receptionist │ Accountant
├─────────────────┼──────────┼──────────┼────────┼──────────────┼──────────┤
│ Users           │ CRUD     │ CRU      │ R      │ R            │ R        │
│ Clinics         │ CRUD     │ RU       │ R      │ R            │ R        │
│ Doctors         │ CRUD     │ CRUD     │ R      │ R            │ R        │
│ Patients        │ CRUD     │ CRUD     │ RU     │ CRUD         │ R        │
│ Appointments    │ CRUD     │ CRUD     │ RU     │ CRUD         │ R        │
│ Treatments      │ CRUD     │ CRUD     │ CRU    │ R            │ R        │
│ Invoices        │ CRUD     │ CRUD     │ R      │ R            │ RU       │
│ Payments        │ CRUD     │ CRU      │ R      │ R            │ RU       │
│ Reports         │ CRUD     │ RU       │ R      │ R            │ RU       │
│ Settings        │ CRUD     │ RU       │ R      │ R            │ R        │
└─────────────────┴──────────┴──────────┴────────┴──────────────┴──────────┘

Legend: C = Create, R = Read, U = Update, D = Delete
```

---

## Implementation Examples

### Example 1: Protected API Route

```typescript
// app/api/patients/route.ts
import { auth } from "@clerk/nextjs/server";
import { permissionChecker } from "@/lib/clerk";
import { patientsDb } from "@/lib/supabase";

export async function GET(req: Request) {
  // 1. Get authenticated user
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get user role and clinic ID
  const userRole = (sessionClaims?.metadata as any)?.role;
  const userClinicId = (sessionClaims?.metadata as any)?.clinic_id;

  // 3. Check permission
  if (!permissionChecker.hasPermission(userRole, "patients", "read")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Fetch patients (clinic-isolated)
  const result = await patientsDb.findByClinic(userClinicId);

  if (!result.success) {
    return Response.json({ error: "Failed to fetch patients" }, { status: 500 });
  }

  return Response.json(result.data);
}
```

### Example 2: Protected Component

```typescript
// components/PatientsList.tsx
import { useAuth } from "@clerk/nextjs";
import { permissionChecker } from "@/lib/clerk";

export function PatientsList() {
  const { sessionClaims } = useAuth();
  const userRole = (sessionClaims?.metadata as any)?.role;

  // Check if user can create patients
  const canCreate = permissionChecker.hasPermission(
    userRole,
    "patients",
    "create"
  );

  return (
    <div>
      {canCreate && (
        <button className="btn btn-primary">Add Patient</button>
      )}
      {/* Patient list */}
    </div>
  );
}
```

### Example 3: Clinic Isolation

```typescript
// lib/clinic-isolation.ts
import { auth } from "@clerk/nextjs/server";

export function getClinicId(): string | null {
  const { sessionClaims } = auth();
  return (sessionClaims?.metadata as any)?.clinic_id || null;
}

export async function getClinicPatients() {
  const clinicId = getClinicId();

  if (!clinicId) {
    throw new Error("User not assigned to clinic");
  }

  // All queries automatically filtered by clinic_id
  return await patientsDb.findByClinic(clinicId);
}
```

### Example 4: Role Assignment

```typescript
// app/api/users/[id]/assign-role/route.ts
import { roleAssignment } from "@/lib/clerk";
import { usersDb, activityLogsDb } from "@/lib/supabase";

export async function POST(req: Request, { params }: any) {
  const { role, clinicId } = await req.json();

  // Assign role
  const result = await roleAssignment.assignRole(params.id, role, clinicId);

  if (!result.success) {
    return Response.json({ error: "Failed to assign role" }, { status: 500 });
  }

  // Log role change
  await activityLogsDb.log({
    clinic_id: clinicId,
    user_id: params.id,
    entity_type: "users",
    entity_id: params.id,
    action: "update",
    new_values: { role },
  });

  return Response.json({ success: true });
}
```

---

## Security Best Practices

1. **Always verify authentication** before accessing protected resources
2. **Check permissions** for every resource access
3. **Enforce clinic isolation** in all queries
4. **Log all sensitive actions** for audit trail
5. **Use HTTPS** in production
6. **Rotate secrets** regularly
7. **Monitor webhook failures** for sync issues
8. **Validate all user inputs** before database operations

---

## Troubleshooting

### Webhook not syncing users

1. Check `CLERK_WEBHOOK_SECRET` is correct
2. Verify webhook URL is accessible
3. Check Clerk dashboard for webhook logs
4. Ensure Supabase credentials are valid

### Users can't access clinic dashboard

1. Verify user has `clinic_id` in metadata
2. Check user role is not "patient"
3. Verify clinic exists in database
4. Check RLS policies on clinic tables

### Role permissions not working

1. Verify role exists in `roles` table
2. Check user's `role_id` in `users` table
3. Verify middleware is checking permissions
4. Check API routes enforce permissions

---

**Last Updated:** June 9, 2026
**Version:** 1.0.0
**Status:** Production Ready

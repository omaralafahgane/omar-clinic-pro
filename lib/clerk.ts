// Clerk Authentication Configuration
// Production-ready Clerk integration for Omar Clinic Pro

import { clerkClient } from "@clerk/nextjs/server";

// ============================================================================
// CLERK USER MANAGEMENT
// ============================================================================

export const clerkUserManager = {
  /**
   * Create a user in Clerk
   */
  create: async (data: {
    email_address: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) => {
    try {
      const user = await clerkClient.users.createUser({
        emailAddress: [data.email_address],
        password: data.password,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNumber: data.phone_number ? [data.phone_number] : undefined,
      });

      return { success: true, data: user };
    } catch (error) {
      console.error("Error creating Clerk user:", error);
      return { success: false, error };
    }
  },

  /**
   * Get user by email
   */
  findByEmail: async (email: string) => {
    try {
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length === 0) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: users.data[0] };
    } catch (error) {
      console.error("Error finding Clerk user:", error);
      return { success: false, error };
    }
  },

  /**
   * Update user metadata
   */
  updateMetadata: async (userId: string, metadata: any) => {
    try {
      const user = await clerkClient.users.updateUser(userId, {
        publicMetadata: metadata,
      });

      return { success: true, data: user };
    } catch (error) {
      console.error("Error updating Clerk user metadata:", error);
      return { success: false, error };
    }
  },

  /**
   * Delete user
   */
  delete: async (userId: string) => {
    try {
      await clerkClient.users.deleteUser(userId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting Clerk user:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// ROLE PERMISSION DEFINITIONS
// ============================================================================

export const ROLE_PERMISSIONS = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access",
    permissions: {
      // Clinic Management
      clinics: ["create", "read", "update", "delete"],
      // User Management
      users: ["create", "read", "update", "delete", "assign_role"],
      // Subscription Management
      subscriptions: ["create", "read", "update", "cancel"],
      // System Settings
      settings: ["read", "update"],
      // Audit Logs
      audit_logs: ["read"],
      // Reports
      reports: ["read", "export"],
    },
  },

  clinic_owner: {
    id: "clinic_owner",
    name: "Clinic Owner",
    description: "Clinic management and staff oversight",
    permissions: {
      // Own Clinic
      clinic: ["read", "update"],
      // Staff Management
      users: ["create", "read", "update", "delete"],
      // Doctors
      doctors: ["create", "read", "update", "delete"],
      // Patients
      patients: ["create", "read", "update", "delete"],
      // Appointments
      appointments: ["create", "read", "update", "delete"],
      // Treatments
      treatments: ["create", "read", "update", "delete"],
      // Billing
      invoices: ["create", "read", "update", "delete"],
      payments: ["create", "read", "update"],
      // Reports
      reports: ["read", "export"],
      // Clinic Settings
      clinic_settings: ["read", "update"],
    },
  },

  doctor: {
    id: "doctor",
    name: "Doctor",
    description: "Patient care and appointment management",
    permissions: {
      // Own Profile
      profile: ["read", "update"],
      // Patients
      patients: ["read", "update"],
      // Appointments
      appointments: ["read", "update"],
      // Treatments
      treatments: ["create", "read", "update"],
      // Medical Records
      medical_records: ["create", "read", "update"],
      // Reports
      reports: ["read"],
    },
  },

  receptionist: {
    id: "receptionist",
    name: "Receptionist",
    description: "Appointment and patient data management",
    permissions: {
      // Own Profile
      profile: ["read", "update"],
      // Patients
      patients: ["create", "read", "update"],
      // Appointments
      appointments: ["create", "read", "update"],
      // Doctors
      doctors: ["read"],
      // Reports
      reports: ["read"],
    },
  },

  accountant: {
    id: "accountant",
    name: "Accountant",
    description: "Billing and financial management",
    permissions: {
      // Own Profile
      profile: ["read", "update"],
      // Invoices
      invoices: ["read", "update"],
      // Payments
      payments: ["read", "update"],
      // Financial Reports
      reports: ["read", "export"],
      // Patients (read-only for billing)
      patients: ["read"],
    },
  },
};

// ============================================================================
// PERMISSION CHECKING UTILITIES
// ============================================================================

export const permissionChecker = {
  /**
   * Check if user has permission
   */
  hasPermission: (
    userRole: string,
    resource: string,
    action: string
  ): boolean => {
    const role = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];

    if (!role) {
      console.warn(`Unknown role: ${userRole}`);
      return false;
    }

    const resourcePermissions =
      role.permissions[resource as keyof typeof role.permissions];

    if (!resourcePermissions) {
      return false;
    }

    if (Array.isArray(resourcePermissions)) {
      return resourcePermissions.includes(action);
    }

    return false;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasRole: (userRole: string, allowedRoles: string[]): boolean => {
    return allowedRoles.includes(userRole);
  },

  /**
   * Get all permissions for a role
   */
  getPermissions: (userRole: string) => {
    return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  },

  /**
   * Check if user can access clinic
   */
  canAccessClinic: (
    userRole: string,
    userClinicId: string,
    targetClinicId: string
  ): boolean => {
    // Super admin can access all clinics
    if (userRole === "super_admin") {
      return true;
    }

    // Others can only access their own clinic
    return userClinicId === targetClinicId;
  },
};

// ============================================================================
// ROLE ASSIGNMENT
// ============================================================================

export const roleAssignment = {
  /**
   * Assign role to user
   */
  assignRole: async (
    userId: string,
    role: string,
    clinicId?: string
  ) => {
    try {
      const metadata = {
        role,
        clinic_id: clinicId,
        assigned_at: new Date().toISOString(),
      };

      const result = await clerkUserManager.updateMetadata(userId, metadata);

      if (!result.success) {
        throw result.error;
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error assigning role:", error);
      return { success: false, error };
    }
  },

  /**
   * Get user role
   */
  getUserRole: (user: any): string => {
    return user?.publicMetadata?.role || "patient";
  },

  /**
   * Get user clinic ID
   */
  getUserClinicId: (user: any): string | null => {
    return user?.publicMetadata?.clinic_id || null;
  },
};

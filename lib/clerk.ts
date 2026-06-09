// Clerk Authentication Configuration
// This file will be populated in Step 4 with actual Clerk integration

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  secretKey: process.env.CLERK_SECRET_KEY || "",
};

// Placeholder for Clerk initialization
export const initClerk = () => {
  if (!clerkConfig.publishableKey) {
    console.warn("Clerk configuration is missing");
    return null;
  }
  // Clerk will be initialized here in Step 4
};

// Authentication utilities (to be implemented in Step 4)
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    // TODO: Implement in Step 4
  },

  signIn: async (email: string, password: string) => {
    // TODO: Implement in Step 4
  },

  signOut: async () => {
    // TODO: Implement in Step 4
  },

  getCurrentUser: async () => {
    // TODO: Implement in Step 4
  },

  updateProfile: async (data: any) => {
    // TODO: Implement in Step 4
  },
};

// Role-based access control
export const roles = {
  ADMIN: "admin",
  CLINIC_OWNER: "clinic_owner",
  DOCTOR: "doctor",
  STAFF: "staff",
};

// Permission checking
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    admin: 4,
    clinic_owner: 3,
    doctor: 2,
    staff: 1,
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

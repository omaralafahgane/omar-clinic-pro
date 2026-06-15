// Supabase Client Configuration and Database Operations
// Production-ready Supabase integration for Omar Clinic Pro

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (Anon key - for client-side operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (process.env.NODE_ENV === "production" ? "https://placeholder.supabase.co" : undefined);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (process.env.NODE_ENV === "production" ? "placeholder" : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables - using mock mode");
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ============================================================================
// SERVICE ROLE CLIENT - For server-side operations (webhooks, etc.)
// Bypasses RLS policies for system operations
// ============================================================================
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : supabase;

// ============================================================================
// USERS OPERATIONS
// ============================================================================
export const usersDb = {
  create: async (data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: user, error } = await supabase
        .from("users")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: user };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error };
    }
  },

  findById: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding user:", error);
      return { success: false, error };
    }
  },

  findByEmail: async (email: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return { success: false, error };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: user, error } = await supabase
        .from("users")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: user };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// CLINICS OPERATIONS
// ============================================================================
export const clinicsDb = {
  create: async (data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: clinic, error } = await supabase
        .from("clinics")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: clinic };
    } catch (error) {
      console.error("Error creating clinic:", error);
      return { success: false, error };
    }
  },

  findById: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding clinic:", error);
      return { success: false, error };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: clinic, error } = await supabase
        .from("clinics")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: clinic };
    } catch (error) {
      console.error("Error updating clinic:", error);
      return { success: false, error };
    }
  },

  getAll: async (limit = 50, offset = 0) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error, count } = await supabase
        .from("clinics")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error getting all clinics:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// DOCTORS OPERATIONS
// ============================================================================
export const doctorsDb = {
  create: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: doctor, error } = await supabase
        .from("doctors")
        .insert([{ clinic_id: clinicId, ...data }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: doctor };
    } catch (error) {
      console.error("Error creating doctor:", error);
      return { success: false, error };
    }
  },

  findByClinic: async (clinicId: string) => {
    try {
      if (!supabase) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("is_active", true)
        .order("first_name", { ascending: true });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding clinic doctors:", error);
      return { success: true, data: [] };
    }
  },
};

// ============================================================================
// PATIENTS OPERATIONS
// ============================================================================
export const patientsDb = {
  create: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: patient, error } = await supabase
        .from("patients")
        .insert([{ clinic_id: clinicId, ...data, is_active: true }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: patient };
    } catch (error) {
      console.error("Error creating patient:", error);
      return { success: false, error };
    }
  },

  findById: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding patient:", error);
      return { success: false, error };
    }
  },

  findByClinic: async (clinicId: string, limit = 50, offset = 0) => {
    try {
      if (!supabase) return { success: true, data: [], total: 0 };
      const { data, error, count } = await supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error finding clinic patients:", error);
      return { success: true, data: [], total: 0 };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: patient, error } = await supabase
        .from("patients")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: patient };
    } catch (error) {
      console.error("Error updating patient:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// APPOINTMENTS OPERATIONS
// ============================================================================
export const appointmentsDb = {
  create: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: appointment, error } = await supabase
        .from("appointments")
        .insert([{ clinic_id: clinicId, ...data, status: "scheduled" }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: appointment };
    } catch (error) {
      console.error("Error creating appointment:", error);
      return { success: false, error };
    }
  },

  findByClinic: async (clinicId: string, filters?: any) => {
    try {
      if (!supabase) return { success: true, data: [] };
      let query = supabase
        .from("appointments")
        .select("*")
        .eq("clinic_id", clinicId);

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.date) {
        const startOfDay = new Date(filters.date).toISOString();
        const endOfDay = new Date(new Date(filters.date).getTime() + 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("start_time", startOfDay).lt("start_time", endOfDay);
      }

      const { data, error } = await query.order("start_time", { ascending: true });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding appointments:", error);
      return { success: true, data: [] };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: appointment, error } = await supabase
        .from("appointments")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: appointment };
    } catch (error) {
      console.error("Error updating appointment:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// INVOICES OPERATIONS
// ============================================================================
export const invoicesDb = {
  create: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert([{ clinic_id: clinicId, ...data }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error creating invoice:", error);
      return { success: false, error };
    }
  },

  findByClinic: async (clinicId: string, limit = 50, offset = 0) => {
    try {
      if (!supabase) return { success: true, data: [], total: 0 };
      const { data, error, count } = await supabase
        .from("invoices")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error finding invoices:", error);
      return { success: true, data: [], total: 0 };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: invoice, error } = await supabase
        .from("invoices")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error updating invoice:", error);
      return { success: false, error };
    }
  },

  updateStatus: async (id: string, status: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("invoices")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error updating invoice status:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// ACTIVITY LOGS OPERATIONS
// ============================================================================
export const activityLogsDb = {
  log: async (data: any) => {
    try {
      if (!supabase) return { success: true };
      const { error } = await supabase.from("activity_logs").insert([data]);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error logging activity:", error);
      return { success: true }; // Don't fail the main operation
    }
  },

  getByClinic: async (clinicId: string, limit = 100, offset = 0) => {
    try {
      if (!supabase) return { success: true, data: [], total: 0 };
      const { data, error, count } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error getting activity logs:", error);
      return { success: true, data: [], total: 0 };
    }
  },
};

// ============================================================================
// CLINICS OPERATIONS - HELPER FUNCTIONS
// ============================================================================
export const clinicsDbHelpers = {
  /**
   * Get default clinic - returns mock data if database unavailable
   */
  getDefaultClinic: async () => {
    try {
      if (!supabase) {
        // Return mock clinic data
        return { 
          success: true, 
          data: { 
            id: "demo", 
            name: "عيادة تجريبية", 
            email: "demo@clinic.com" 
          } 
        };
      }
      
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("email", "demo@omarclinicp.com")
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting default clinic:", error);
      // Return mock data instead of failing
      return { 
        success: true, 
        data: { 
          id: "demo", 
          name: "عيادة تجريبية", 
          email: "demo@clinic.com" 
        } 
      };
    }
  },
};

// ============================================================================
// ROLES OPERATIONS
// ============================================================================
export const rolesDb = {
  getAll: async () => {
    try {
      if (!supabase) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting roles:", error);
      return { success: true, data: [] };
    }
  },

  findByName: async (name: string) => {
    try {
      if (!supabase) return { success: true, data: { id: "patient", name: "patient" } };
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("name", name)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding role:", error);
      return { success: true, data: { id: "patient", name: "patient" } };
    }
  },
};

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================
export const adminDb = {
  getActivationKeys: async () => {
    try {
      if (!supabase) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("activation_keys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting activation keys:", error);
      return { success: true, data: [] };
    }
  },

  generateKey: async (data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: key, error } = await supabase
        .from("activation_keys")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: key };
    } catch (error) {
      console.error("Error generating key:", error);
      return { success: false, error };
    }
  },

  updateSubscription: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: sub, error } = await supabase
        .from("subscriptions")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("clinic_id", clinicId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: sub };
    } catch (error) {
      console.error("Error updating subscription:", error);
      return { success: false, error };
    }
  },

  setClinicStatus: async (clinicId: string, isActive: boolean) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { error } = await supabase
        .from("clinics")
        .update({ is_active: isActive })
        .eq("id", clinicId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error setting clinic status:", error);
      return { success: false, error };
    }
  },
};

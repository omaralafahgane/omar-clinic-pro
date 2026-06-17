// Supabase Client Configuration and Database Operations - REFACTORED
// Production-ready Supabase integration with unified helpers and relationship joins

import { createClient } from "@supabase/supabase-js";
// auth should not be imported here to avoid client/server component conflicts in Next.js 15
// Instead, pass userId as a parameter to functions that need it

// Initialize Supabase client (Anon key - for client-side operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables - database operations may fail");
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// SERVICE ROLE CLIENT - For server-side operations (webhooks, etc.)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : supabase;

// ============================================================================
// UNIFIED CLINIC HELPERS - Core of the system
// ============================================================================
export const clinicsDbHelpers = {
  // Get the current user's clinic (replaces getDefaultClinic)
  getCurrentClinic: async (userId: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      
      if (!userId) return { success: false, error: "User ID is required" };

      // Find user first to get their clinic_id
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("id", userId)
        .single();

      if (userError || !user?.clinic_id) {
        return { success: false, error: "No clinic associated with this user" };
      }

      // Find clinic associated with this user
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", user.clinic_id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        return { success: false, error: "No clinic found for this user" };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error getting current clinic:", error);
      return { success: false, error };
    }
  },

  // Get clinic by ID (with full relationships)
  getById: async (id: string) => {
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

  // Update clinic data
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

  // Create clinic (for new users)
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
};

// ============================================================================
// PATIENTS HELPERS - Unified with joins
// ============================================================================
export const patientsDbHelpers = {
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

  // Get all patients for a clinic (with relationships)
  findByClinic: async (clinicId: string, limit = 50, offset = 0) => {
    try {
      if (!supabase) return { success: true, data: [], total: 0 };
      const { data, error, count } = await supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId)
        .eq("is_active", true)
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

  delete: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { error } = await supabase
        .from("patients")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting patient:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// DOCTORS HELPERS - Unified with joins
// ============================================================================
export const doctorsDbHelpers = {
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

  findById: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding doctor:", error);
      return { success: false, error };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: doctor, error } = await supabase
        .from("doctors")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: doctor };
    } catch (error) {
      console.error("Error updating doctor:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// APPOINTMENTS HELPERS - Unified with full joins
// ============================================================================
export const appointmentsDbHelpers = {
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

  // Get appointments with full patient and doctor data (JOINS)
  findByClinic: async (clinicId: string, filters?: any) => {
    try {
      if (!supabase) return { success: true, data: [] };
      
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patients(*),
          doctors(*)
        `)
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

  findById: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(*),
          doctors(*)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding appointment:", error);
      return { success: false, error };
    }
  },

  // Check for appointment conflicts
  checkConflict: async (doctorId: string, startTime: string, endTime: string) => {
    try {
      if (!supabase) return { success: true, hasConflict: false };
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("status", "scheduled")
        .gte("end_time", startTime)
        .lt("start_time", endTime);

      if (error) throw error;
      return { success: true, hasConflict: (data?.length || 0) > 0 };
    } catch (error) {
      console.error("Error checking appointment conflict:", error);
      return { success: false, hasConflict: false };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: appointment, error } = await supabase
        .from("appointments")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(`
          *,
          patients(*),
          doctors(*)
        `)
        .single();
      if (error) throw error;
      return { success: true, data: appointment };
    } catch (error) {
      console.error("Error updating appointment:", error);
      return { success: false, error };
    }
  },

  delete: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// INVOICES HELPERS - Unified with full joins
// ============================================================================
export const invoicesDbHelpers = {
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

  // Get invoices with full patient data (JOINS)
  findByClinic: async (clinicId: string, filters?: any) => {
    try {
      if (!supabase) return { success: true, data: [], total: 0 };
      
      let query = supabase
        .from("invoices")
        .select(`
          *,
          patients(*)
        `, { count: "exact" })
        .eq("clinic_id", clinicId);

      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(0, 49);

      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error finding invoices:", error);
      return { success: true, data: [], total: 0 };
    }
  },

  findById: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          patients(*)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding invoice:", error);
      return { success: false, error };
    }
  },

  update: async (id: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: invoice, error } = await supabase
        .from("invoices")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(`
          *,
          patients(*)
        `)
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
        .select(`
          *,
          patients(*)
        `)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error updating invoice status:", error);
      return { success: false, error };
    }
  },

  delete: async (id: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// SUBSCRIPTION HELPERS - Unified
// ============================================================================
export const subscriptionDbHelpers = {
  getByClinic: async (clinicId: string) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("clinic_id", clinicId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting subscription:", error);
      return { success: false, error };
    }
  },

  create: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .insert([{ clinic_id: clinicId, ...data }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: subscription };
    } catch (error) {
      console.error("Error creating subscription:", error);
      return { success: false, error };
    }
  },

  update: async (clinicId: string, data: any) => {
    try {
      if (!supabase) return { success: false, error: "Database not configured" };
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("clinic_id", clinicId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: subscription };
    } catch (error) {
      console.error("Error updating subscription:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// ACTIVITY LOGS HELPERS
// ============================================================================
export const activityLogsDbHelpers = {
  log: async (data: any) => {
    try {
      if (!supabase) return { success: true };
      const { error } = await supabase.from("activity_logs").insert([data]);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error logging activity:", error);
      return { success: true };
    }
  },

  getByClinic: async (clinicId: string, limit = 100, offset = 0) => {
    try {
      if (!supabase) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting activity logs:", error);
      return { success: true, data: [] };
    }
  },
};

// ============================================================================
// BACKWARD COMPATIBILITY - Keep old names for now
// ============================================================================
export const patientsDb = patientsDbHelpers;
export const appointmentsDb = appointmentsDbHelpers;
export const invoicesDb = invoicesDbHelpers;
export const doctorsDb = doctorsDbHelpers;
export const clinicsDb = clinicsDbHelpers;

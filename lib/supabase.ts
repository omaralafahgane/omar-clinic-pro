// Supabase Client Configuration and Database Operations
// Production-ready Supabase integration for Omar Clinic Pro

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================================================
// USERS OPERATIONS
// ============================================================================
export const usersDb = {
  /**
   * Create a new user in the database
   * Synced from Clerk via webhook
   */
  create: async (data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    clinic_id?: string;
    role_id: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .insert([
          {
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            clinic_id: data.clinic_id,
            role_id: data.role_id,
            phone: data.phone,
            avatar_url: data.avatar_url,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: user };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error };
    }
  },

  /**
   * Get user by ID
   */
  findById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          role:roles(id, name, description, permissions),
          clinic:clinics(id, name, subscription_plan, subscription_status)
        `
        )
        .eq("id", id)
        .eq("deleted_at", null)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding user:", error);
      return { success: false, error };
    }
  },

  /**
   * Get user by email
   */
  findByEmail: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          role:roles(id, name, description, permissions),
          clinic:clinics(id, name, subscription_plan, subscription_status)
        `
        )
        .eq("email", email)
        .eq("deleted_at", null)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return { success: false, error };
    }
  },

  /**
   * Update user information
   */
  update: async (
    id: string,
    data: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      avatar_url?: string;
      clinic_id?: string;
      role_id?: string;
      is_active?: boolean;
    }
  ) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
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

  /**
   * Update last login timestamp
   */
  updateLastLogin: async (id: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error updating last login:", error);
      return { success: false, error };
    }
  },

  /**
   * Soft delete user
   */
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false,
        })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error };
    }
  },

  /**
   * Get all users in a clinic
   */
  getByClinic: async (clinicId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          role:roles(id, name, description, permissions)
        `
        )
        .eq("clinic_id", clinicId)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting clinic users:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// CLINICS OPERATIONS
// ============================================================================
export const clinicsDb = {
  /**
   * Create a new clinic
   */
  create: async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    owner_id: string;
  }) => {
    try {
      const { data: clinic, error } = await supabase
        .from("clinics")
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            country: data.country,
            subscription_plan: "basic",
            subscription_status: "trial",
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: clinic };
    } catch (error) {
      console.error("Error creating clinic:", error);
      return { success: false, error };
    }
  },

  /**
   * Get clinic by ID
   */
  findById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("clinics")
        .select(
          `
          *,
          subscription:subscriptions(id, plan, status, price, auto_renew),
          users:users(id, email, first_name, last_name, role_id)
        `
        )
        .eq("id", id)
        .eq("deleted_at", null)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding clinic:", error);
      return { success: false, error };
    }
  },

  /**
   * Update clinic information
   */
  update: async (
    id: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      logo_url?: string;
      website_url?: string;
    }
  ) => {
    try {
      const { data: clinic, error } = await supabase
        .from("clinics")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
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

  /**
   * Get all clinics (admin only)
   */
  getAll: async (limit = 50, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from("clinics")
        .select("*", { count: "exact" })
        .eq("deleted_at", null)
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
// PATIENTS OPERATIONS
// ============================================================================
export const patientsDb = {
  /**
   * Create a new patient
   */
  create: async (
    clinicId: string,
    data: {
      first_name: string;
      last_name: string;
      email?: string;
      phone: string;
      date_of_birth?: string;
      gender?: string;
      address?: string;
      city?: string;
      country?: string;
      medical_history?: string;
      allergies?: string;
    }
  ) => {
    try {
      const { data: patient, error } = await supabase
        .from("patients")
        .insert([
          {
            clinic_id: clinicId,
            ...data,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: patient };
    } catch (error) {
      console.error("Error creating patient:", error);
      return { success: false, error };
    }
  },

  /**
   * Get patient by ID
   */
  findById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("deleted_at", null)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding patient:", error);
      return { success: false, error };
    }
  },

  /**
   * Get all patients in a clinic
   */
  findByClinic: async (clinicId: string, limit = 50, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error finding clinic patients:", error);
      return { success: false, error };
    }
  },

  /**
   * Update patient information
   */
  update: async (id: string, data: any) => {
    try {
      const { data: patient, error } = await supabase
        .from("patients")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
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
  /**
   * Create a new appointment
   */
  create: async (
    clinicId: string,
    data: {
      patient_id: string;
      doctor_id: string;
      start_time: string;
      end_time: string;
      reason_for_visit: string;
      notes?: string;
      appointment_type?: string;
    }
  ) => {
    try {
      const { data: appointment, error } = await supabase
        .from("appointments")
        .insert([
          {
            clinic_id: clinicId,
            ...data,
            status: "scheduled",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: appointment };
    } catch (error) {
      console.error("Error creating appointment:", error);
      return { success: false, error };
    }
  },

  /**
   * Get appointments for a clinic
   */
  findByClinic: async (clinicId: string, filters?: any) => {
    try {
      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          patient:patients(id, first_name, last_name, email, phone),
          doctor:doctors(id, first_name, last_name, specialization)
        `
        )
        .eq("clinic_id", clinicId)
        .eq("deleted_at", null);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

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
      return { success: false, error };
    }
  },

  /**
   * Update appointment
   */
  update: async (id: string, data: any) => {
    try {
      const { data: appointment, error } = await supabase
        .from("appointments")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
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
// ACTIVITY LOGS OPERATIONS
// ============================================================================
export const activityLogsDb = {
  /**
   * Log an activity
   */
  log: async (data: {
    clinic_id: string;
    user_id?: string;
    entity_type: string;
    entity_id: string;
    action: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    status?: string;
    error_message?: string;
  }) => {
    try {
      const { error } = await supabase.from("activity_logs").insert([
        {
          clinic_id: data.clinic_id,
          user_id: data.user_id,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          action: data.action,
          old_values: data.old_values,
          new_values: data.new_values,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          status: data.status || "success",
          error_message: data.error_message,
        },
      ]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error logging activity:", error);
      return { success: false, error };
    }
  },

  /**
   * Get activity logs for a clinic
   */
  getByClinic: async (clinicId: string, limit = 100, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          user:users(id, email, first_name, last_name)
        `,
          { count: "exact" }
        )
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error getting activity logs:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// ROLES OPERATIONS
// ============================================================================
export const rolesDb = {
  /**
   * Get all roles
   */
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("deleted_at", null)
        .order("name");

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting roles:", error);
      return { success: false, error };
    }
  },

  /**
   * Get role by name
   */
  findByName: async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("name", name)
        .eq("deleted_at", null)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error finding role:", error);
      return { success: false, error };
    }
  },
};

// ============================================================================
// INVOICES OPERATIONS
// ============================================================================
export const invoicesDb = {
  /**
   * Create a new invoice
   */
  create: async (
    clinicId: string,
    data: {
      patient_id: string;
      appointment_id?: string;
      invoice_number: string;
      invoice_date: string;
      due_date: string;
      subtotal: number;
      tax_amount?: number;
      discount_amount?: number;
      total_amount: number;
      balance_due: number;
      status: string;
      notes?: string;
    }
  ) => {
    try {
      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert([
          {
            clinic_id: clinicId,
            ...data,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error creating invoice:", error);
      return { success: false, error };
    }
  },

  /**
   * Get invoices for a clinic
   */
  findByClinic: async (clinicId: string, limit = 50, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from("invoices")
        .select(`
          *,
          patient:patients(id, first_name, last_name, email, phone)
        `, { count: "exact" })
        .eq("clinic_id", clinicId)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, data, total: count };
    } catch (error) {
      console.error("Error finding invoices:", error);
      return { success: false, error };
    }
  },

  /**
   * Update invoice
   */
  update: async (id: string, data: any) => {
    try {
      const { data: invoice, error } = await supabase
        .from("invoices")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
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
};

// ============================================================================
// ADMIN OPERATIONS (SUPER ADMIN ONLY)
// ============================================================================
export const adminDb = {
  /**
   * Get all activation keys
   */
  getActivationKeys: async () => {
    try {
      const { data, error } = await supabase
        .from("activation_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error getting activation keys:", error);
      return { success: false, error };
    }
  },

  /**
   * Generate a new activation key
   */
  generateKey: async (data: {
    key: string;
    plan: string;
    duration_days: number;
  }) => {
    try {
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

  /**
   * Update clinic subscription manually
   */
  updateSubscription: async (clinicId: string, data: any) => {
    try {
      const { data: sub, error } = await supabase
        .from("subscriptions")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
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

  /**
   * Suspend or Activate clinic
   */
  setClinicStatus: async (clinicId: string, isActive: boolean) => {
    try {
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

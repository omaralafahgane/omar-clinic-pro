// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "clinic_owner" | "doctor" | "staff";
  clinicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Clinic Types
export interface Clinic {
  id: string;
  name: string;
  ownerId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logo?: string;
  subscription: "basic" | "advanced" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "trial";
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Types
export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: "M" | "F";
  address: string;
  city: string;
  country: string;
  medicalHistory?: string;
  allergies?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Doctor Types
export interface Doctor {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Types
export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Types
export interface Invoice {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Types
export interface Subscription {
  id: string;
  clinicId: string;
  plan: "basic" | "advanced" | "enterprise";
  status: "active" | "inactive" | "trial" | "cancelled";
  startDate: Date;
  endDate?: Date;
  price: number;
  currency: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

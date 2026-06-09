export interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address?: string
  city?: string
  country?: string
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  specialization: string
  license_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  reason?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

export interface PaginationParams {
  page: number
  limit: number
}

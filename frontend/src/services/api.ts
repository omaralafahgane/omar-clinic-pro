import axios, { AxiosInstance } from 'axios'
import { ApiResponse, Patient, Doctor, Appointment } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Patient APIs
export const patientApi = {
  getAll: () => api.get<ApiResponse<Patient[]>>('/patients'),
  getById: (id: number) => api.get<ApiResponse<Patient>>(`/patients/${id}`),
  create: (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<ApiResponse<Patient>>('/patients', data),
  update: (id: number, data: Partial<Patient>) =>
    api.put<ApiResponse<Patient>>(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
}

// Doctor APIs
export const doctorApi = {
  getAll: () => api.get<ApiResponse<Doctor[]>>('/doctors'),
  getById: (id: number) => api.get<ApiResponse<Doctor>>(`/doctors/${id}`),
  create: (data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<ApiResponse<Doctor>>('/doctors', data),
  update: (id: number, data: Partial<Doctor>) =>
    api.put<ApiResponse<Doctor>>(`/doctors/${id}`, data),
  delete: (id: number) => api.delete(`/doctors/${id}`),
}

// Appointment APIs
export const appointmentApi = {
  getAll: () => api.get<ApiResponse<Appointment[]>>('/appointments'),
  getById: (id: number) => api.get<ApiResponse<Appointment>>(`/appointments/${id}`),
  create: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<ApiResponse<Appointment>>('/appointments', data),
  update: (id: number, data: Partial<Appointment>) =>
    api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
}

// Health check
export const healthCheck = () => api.get('/health')

export default api

import { useEffect, useState } from 'react'
import { FiPlus, FiSearch, FiCalendar } from 'react-icons/fi'
import { appointmentApi } from '../services/api'
import { Appointment } from '../types'
import toast from 'react-hot-toast'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  useEffect(() => {
    fetchAppointments()
  }, [])
  
  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await appointmentApi.getAll()
      if (response.data.success && response.data.data) {
        setAppointments(response.data.data)
      }
    } catch (error) {
      toast.error('فشل تحميل بيانات المواعيد')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.reason?.includes(searchTerm) || apt.id.toString().includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'badge-info'
      case 'completed':
        return 'badge-success'
      case 'cancelled':
        return 'badge-danger'
      default:
        return 'badge-warning'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدول'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغى'
      default:
        return status
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المواعيد</h1>
          <p className="text-gray-600 mt-1">إدارة مواعيد المرضى</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          حجز موعد جديد
        </button>
      </div>
      
      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن موعد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'الكل' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد مواعيد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">الموعد #{appointment.id}</h3>
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">السبب:</span> {appointment.reason || 'لم يتم تحديده'}
                  </p>
                  
                  <p className="text-sm text-gray-500">
                    📅 {new Date(appointment.appointment_date).toLocaleString('ar-SA')}
                  </p>
                  
                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      <span className="font-medium">ملاحظات:</span> {appointment.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm">تعديل</button>
                  <button className="btn-danger text-sm">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { doctorApi } from '../services/api'
import { Doctor } from '../types'
import toast from 'react-hot-toast'

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    fetchDoctors()
  }, [])
  
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await doctorApi.getAll()
      if (response.data.success && response.data.data) {
        setDoctors(response.data.data)
      }
    } catch (error) {
      toast.error('فشل تحميل بيانات الأطباء')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredDoctors = doctors.filter(doctor =>
    doctor.first_name.includes(searchTerm) ||
    doctor.last_name.includes(searchTerm) ||
    doctor.specialization.includes(searchTerm)
  )
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الأطباء</h1>
          <p className="text-gray-600 mt-1">إدارة فريق الأطباء</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          إضافة طبيب جديد
        </button>
      </div>
      
      {/* Search */}
      <div className="card">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن طبيب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">لا توجد بيانات أطباء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {doctor.first_name[0]}{doctor.last_name[0]}
                  </span>
                </div>
                <span className={`badge ${doctor.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {doctor.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900">
                د. {doctor.first_name} {doctor.last_name}
              </h3>
              <p className="text-primary-600 font-medium mb-3">{doctor.specialization}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <p>📧 {doctor.email}</p>
                <p>📱 {doctor.phone}</p>
                <p>🎖️ {doctor.license_number}</p>
              </div>
              
              <button className="w-full btn-primary text-sm">عرض التفاصيل</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

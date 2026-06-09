import { useEffect, useState } from 'react'
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { patientApi } from '../services/api'
import { Patient } from '../types'
import toast from 'react-hot-toast'

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    fetchPatients()
  }, [])
  
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await patientApi.getAll()
      if (response.data.success && response.data.data) {
        setPatients(response.data.data)
      }
    } catch (error) {
      toast.error('فشل تحميل بيانات المرضى')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredPatients = patients.filter(patient =>
    patient.first_name.includes(searchTerm) ||
    patient.last_name.includes(searchTerm) ||
    patient.email.includes(searchTerm)
  )
  
  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      try {
        await patientApi.delete(id)
        setPatients(patients.filter(p => p.id !== id))
        toast.success('تم حذف المريض بنجاح')
      } catch (error) {
        toast.error('فشل حذف المريض')
      }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المرضى</h1>
          <p className="text-gray-600 mt-1">إدارة بيانات المرضى</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          إضافة مريض جديد
        </button>
      </div>
      
      {/* Search */}
      <div className="card">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن مريض..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="spinner"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">لا توجد بيانات مرضى</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الاسم</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الهاتف</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">تاريخ الميلاد</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.date_of_birth}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiEdit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

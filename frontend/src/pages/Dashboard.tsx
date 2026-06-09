import { useEffect, useState } from 'react'
import { FiUsers, FiCalendar, FiFileText, FiTrendingUp } from 'react-icons/fi'
import { healthCheck } from '../services/api'
import toast from 'react-hot-toast'

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

export default function Dashboard() {
  const [isHealthy, setIsHealthy] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck()
        setIsHealthy(true)
      } catch (error) {
        toast.error('فشل الاتصال بالخادم')
        setIsHealthy(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkHealth()
  }, [])
  
  const stats: StatCard[] = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      label: 'المرضى',
      value: '1,234',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      label: 'الأطباء',
      value: '45',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <FiCalendar className="w-8 h-8" />,
      label: 'المواعيد اليوم',
      value: '28',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      label: 'الإيرادات الشهرية',
      value: '45,000 ر.س',
      color: 'bg-orange-100 text-orange-600',
    },
  ]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">أهلاً وسهلاً بك في نظام إدارة العيادة</p>
      </div>
      
      {/* Status Alert */}
      {isHealthy && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <p className="text-green-800">الخادم يعمل بشكل صحيح</p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">آخر المواعيد</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">أحمد محمد</p>
                  <p className="text-sm text-gray-500">فحص عام - د. سارة أحمد</p>
                </div>
                <span className="badge badge-info">اليوم - 2:30 م</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الإحصائيات</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">معدل الحضور</span>
                <span className="text-sm font-bold text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">رضا المرضى</span>
                <span className="text-sm font-bold text-gray-900">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

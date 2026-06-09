import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiUsers, FiCalendar, FiFileText, FiSettings } from 'react-icons/fi'

export default function Sidebar() {
  const location = useLocation()
  
  const menuItems = [
    { icon: FiHome, label: 'لوحة التحكم', path: '/' },
    { icon: FiUsers, label: 'المرضى', path: '/patients' },
    { icon: FiUsers, label: 'الأطباء', path: '/doctors' },
    { icon: FiCalendar, label: 'المواعيد', path: '/appointments' },
    { icon: FiFileText, label: 'التقارير', path: '/reports' },
    { icon: FiSettings, label: 'الإعدادات', path: '/settings' },
  ]
  
  const isActive = (path: string) => location.pathname === path
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">OCP</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Omar Clinic</h2>
            <p className="text-xs text-gray-500">Pro Management</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm font-medium text-primary-900 mb-2">نسخة تجريبية</p>
          <p className="text-xs text-primary-700">نظام إدارة عيادة طبية متكامل</p>
        </div>
      </div>
    </aside>
  )
}

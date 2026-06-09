import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiMenu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-primary-600">Omar Clinic Pro</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiBell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">أحمد محمد</p>
              <p className="text-xs text-gray-500">مدير العيادة</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
            <FiLogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}

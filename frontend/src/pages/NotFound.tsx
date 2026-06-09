import { Link } from 'react-router-dom'
import { FiHome, FiArrowRight } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h2>
          <p className="text-gray-600 mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم حذفها.</p>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <FiHome className="w-5 h-5" />
          العودة إلى الرئيسية
          <FiArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}

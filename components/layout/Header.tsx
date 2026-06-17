'use client';

import { Bell, Search, Settings, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 right-64 left-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث سريع..."
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 mr-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <div className="absolute top-full mt-2 right-0 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 text-right">
            <p className="text-sm font-semibold text-gray-900 mb-2">الإشعارات</p>
            <div className="space-y-2 text-xs text-gray-600">
              <p>✓ موعد جديد تم حجزه</p>
              <p>✓ فاتورة جديدة تم إنشاؤها</p>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              ع
            </div>
            <span className="text-sm font-semibold hidden sm:inline">عمر</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', isProfileOpen && 'rotate-180')} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900">عمر الفهيقان</p>
                <p className="text-xs text-gray-500">مالك العيادة</p>
              </div>
              <nav className="p-2 space-y-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all text-right">
                  <User className="w-4 h-4" />
                  الملف الشخصي
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all text-right">
                  <Settings className="w-4 h-4" />
                  الإعدادات
                </button>
              </nav>
              <button className="w-full px-3 py-2 text-red-600 hover:bg-red-50 text-sm font-medium border-t border-gray-100 transition-all text-right">
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

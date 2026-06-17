'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  submenu?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'لوحة التحكم',
    href: '/dashboard/clinic',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'المرضى',
    href: '/dashboard/clinic/patients',
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'الأطباء',
    href: '/dashboard/clinic/doctors',
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    title: 'المواعيد',
    href: '/dashboard/clinic/appointments',
    icon: <Calendar className="w-5 h-5" />,
    submenu: [
      { title: 'قائمة المواعيد', href: '/dashboard/clinic/appointments', icon: <Calendar className="w-4 h-4" /> },
      { title: 'التقويم', href: '/dashboard/clinic/appointments/calendar', icon: <Calendar className="w-4 h-4" /> },
    ],
  },
  {
    title: 'الفوترة والمالية',
    href: '/dashboard/clinic/invoices',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: 'المخزون',
    href: '/dashboard/clinic/inventory',
    icon: <Package className="w-5 h-5" />,
  },
  {
    title: 'التقارير',
    href: '/dashboard/clinic/reports',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: 'الإعدادات',
    href: '/dashboard/clinic/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl overflow-y-auto z-40 border-l border-gray-700">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/dashboard/clinic" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
            <span className="text-white font-black text-lg">OCP</span>
          </div>
          <div>
            <p className="font-black text-sm">Omar Clinic</p>
            <p className="text-xs text-gray-400">Pro ERP</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isExpanded = expandedItems.includes(item.title);

          return (
            <div key={item.title}>
              <button
                onClick={() => item.submenu && toggleExpand(item.title)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                )}
              >
                <Link href={item.href} className="flex items-center gap-3 flex-1 text-right">
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
                {item.submenu && (
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </button>

              {/* Submenu */}
              {item.submenu && isExpanded && (
                <div className="mt-1 ml-4 space-y-1 border-r-2 border-gray-700 pr-2">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                        pathname === subitem.href
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                      )}
                    >
                      {subitem.icon}
                      <span>{subitem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900/50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-all font-semibold text-sm">
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}

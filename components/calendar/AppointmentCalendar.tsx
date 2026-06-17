'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  doctor: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({
  appointments,
  onDateSelect,
  onAppointmentClick
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const hasAppointment = (day: number) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return appointments.some(app => {
      const appDate = new Date(app.date);
      return (
        appDate.getDate() === day &&
        appDate.getMonth() === currentDate.getMonth() &&
        appDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getAppointmentsForDay = (day: number) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return (
        appDate.getDate() === day &&
        appDate.getMonth() === currentDate.getMonth() &&
        appDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const selectedDayAppointments = selectedDate
    ? getAppointmentsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center font-medium text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square p-2 rounded-lg text-sm font-medium transition-colors
                  ${!day ? 'bg-transparent cursor-default' : ''}
                  ${day && hasAppointment(day) ? 'bg-blue-100 text-blue-900 hover:bg-blue-200' : ''}
                  ${day && !hasAppointment(day) ? 'bg-gray-50 text-gray-900 hover:bg-gray-100' : ''}
                  ${selectedDate?.getDate() === day && day ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span className="text-gray-600">يوم به موعد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 rounded border border-gray-300"></div>
              <span className="text-gray-600">يوم بدون موعد</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments for selected day */}
      <div>
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'اختر يوماً'}
          </h3>

          {selectedDayAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedDayAppointments.map(appointment => (
                <button
                  key={appointment.id}
                  onClick={() => onAppointmentClick?.(appointment)}
                  className="w-full p-3 text-right border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{appointment.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {appointment.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    د. {appointment.doctor}
                  </p>
                  <div className="mt-2">
                    <span className={`
                      text-xs px-2 py-1 rounded
                      ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                      ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {appointment.status === 'scheduled' ? 'مجدول' : 
                       appointment.status === 'completed' ? 'مكتمل' : 'ملغى'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              {selectedDate ? 'لا توجد مواعيد في هذا اليوم' : 'لم تختر يوماً'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

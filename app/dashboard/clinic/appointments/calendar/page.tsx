'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string;
  status: string;
  patient: { first_name: string; last_name: string };
  doctor: { first_name: string; last_name: string };
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, view]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Calculate range based on view
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      
      if (view === 'day') end.setHours(23, 59, 59, 999);
      if (view === 'week') end.setDate(end.getDate() + 7);
      if (view === 'month') end.setMonth(end.getMonth() + 1);

      const response = await fetch(`/api/appointments/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      const result = await response.json();
      if (result.success) setAppointments(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() + 1);
    if (view === 'week') d.setDate(d.getDate() + 7);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const prev = () => {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() - 1);
    if (view === 'week') d.setDate(d.getDate() - 7);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقويم المواعيد</h1>
          <p className="text-gray-500 mt-1">إدارة مواعيد العيادة بشكل مرئي</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${view === 'day' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >يومي</button>
          <button 
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${view === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >أسبوعي</button>
          <button 
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${view === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >شهري</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {currentDate.toLocaleString('ar-SA', { month: 'long', year: 'numeric', day: view !== 'month' ? 'numeric' : undefined })}
          </h3>
          <div className="flex gap-2">
            <button onClick={prev} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">اليوم</button>
            <button onClick={next} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 
                      app.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {app.status === 'scheduled' ? 'مجدول' : app.status === 'completed' ? 'مكتمل' : app.status}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(app.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{app.patient.first_name} {app.patient.last_name}</h4>
                  <p className="text-sm text-gray-500 mb-3">{app.reason_for_visit}</p>
                  <div className="pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    د. {app.doctor.first_name} {app.doctor.last_name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>لا توجد مواعيد مجدولة في هذا النطاق</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

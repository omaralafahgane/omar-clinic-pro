'use client';

import { useState, useEffect } from 'react';
import { appointmentsDb, patientsDb, doctorsDb, clinicsDbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Modal, Alert, FormInput } from '@/components';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_id: '',
    start_time: '',
    end_time: '',
    reason_for_visit: '',
    appointment_type: 'in-person',
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, filterStatus]);

  const loadInitialData = async () => {
    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (clinicResult.success && clinicResult.data) {
        const clinicId = clinicResult.data.id;
        const [patientsRes, doctorsRes] = await Promise.all([
          patientsDb.findByClinic(clinicId),
          doctorsDb.findByClinic(clinicId)
        ]);
        if (patientsRes.success) setPatients(patientsRes.data || []);
        if (doctorsRes.success) setDoctors(doctorsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (clinicResult.success && clinicResult.data) {
        const filters: any = { date: selectedDate };
        if (filterStatus !== 'all') filters.status = filterStatus;
        
        const result = await appointmentsDb.findByClinic(clinicResult.data.id, filters);
        if (result.success) {
          setAppointments(result.data || []);
        }
      }
    } catch (err) {
      setError("فشل في تحميل المواعيد");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!newAppointment.patient_id || !newAppointment.doctor_id || !newAppointment.start_time || !newAppointment.end_time) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsSubmitting(false);
      return;
    }

    if (new Date(newAppointment.start_time) >= new Date(newAppointment.end_time)) {
      setError("وقت النهاية يجب أن يكون بعد وقت البداية");
      setIsSubmitting(false);
      return;
    }

    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (clinicResult.success && clinicResult.data) {
        // 1. Check for conflicts
        const conflictRes = await appointmentsDb.checkConflict(
          newAppointment.doctor_id,
          new Date(newAppointment.start_time).toISOString(),
          new Date(newAppointment.end_time).toISOString()
        );

        if (conflictRes.success && conflictRes.hasConflict) {
          throw new Error("يوجد تداخل في المواعيد لهذا الطبيب في هذا الوقت. يرجى اختيار وقت آخر.");
        }

        // 2. Generate a simple appointment number
        const appointmentNumber = `APT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const result = await appointmentsDb.create(clinicResult.data.id, {
          ...newAppointment,
          appointment_number: appointmentNumber
        } as any);

        if (result.success) {
          setSuccess("تم حجز الموعد بنجاح!");
          setTimeout(() => {
            setShowAddModal(false);
            setSuccess(null);
          }, 1500);
          loadAppointments();
          setNewAppointment({
            patient_id: '',
            doctor_id: '',
            start_time: '',
            end_time: '',
            reason_for_visit: '',
            appointment_type: 'in-person',
            notes: '',
          });
        } else {
          throw new Error("فشل في حفظ الموعد");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      'in-progress': "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    const labels: any = {
      scheduled: "مجدول",
      confirmed: "مؤكد",
      'in-progress': "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", styles[status] || styles.scheduled)}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">جدول المواعيد</h1>
          <p className="mt-1 text-sm text-gray-500">تنظيم وإدارة مواعيد المرضى والأطباء</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 active:scale-95"
        >
          <svg className="ml-2 -mr-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          حجز موعد جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 mr-1">تاريخ اليوم</label>
          <input
            type="date"
            className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2 px-3"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 mr-1">الحالة</label>
          <select
            className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2 px-3"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="scheduled">مجدول</option>
            <option value="confirmed">مؤكد</option>
            <option value="in-progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
          <span className="font-bold text-blue-700">{appointments.length}</span>
          <span className="text-blue-600">مواعيد اليوم</span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الوقت</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المريض</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الطبيب</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">السبب</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500 font-medium">جاري تحميل المواعيد...</span>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">لا توجد مواعيد محجوزة لهذا اليوم</span>
                      <button onClick={() => setShowAddModal(true)} className="text-blue-600 hover:underline text-sm font-bold">احجز أول موعد الآن</button>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(apt.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {Math.round((new Date(apt.end_time).getTime() - new Date(apt.start_time).getTime()) / 60000)} دقيقة
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-0">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {apt.patient?.first_name} {apt.patient?.last_name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">{apt.patient?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-medium">د. {apt.doctor?.first_name} {apt.doctor?.last_name}</div>
                      <div className="text-[10px] text-gray-400">{apt.doctor?.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {apt.reason_for_visit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-4">
                        <button className="text-blue-600 hover:text-blue-800 transition-all">تعديل</button>
                        <button className="text-gray-400 hover:text-gray-600 transition-all">التفاصيل</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="حجز موعد جديد"
        size="lg"
      >
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <form onSubmit={handleAddAppointment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient & Doctor Selection */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المريض *</label>
                  <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    value={newAppointment.patient_id}
                    onChange={(e) => setNewAppointment({...newAppointment, patient_id: e.target.value})}
                    required
                  >
                    <option value="">اختر المريض...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.phone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الطبيب *</label>
                  <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    value={newAppointment.doctor_id}
                    onChange={(e) => setNewAppointment({...newAppointment, doctor_id: e.target.value})}
                    required
                  >
                    <option value="">اختر الطبيب...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>د. {d.first_name} {d.last_name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <FormInput 
              label="وقت البداية" type="datetime-local" required
              value={newAppointment.start_time}
              onChange={(e) => setNewAppointment({...newAppointment, start_time: e.target.value})}
            />
            <FormInput 
              label="وقت النهاية" type="datetime-local" required
              value={newAppointment.end_time}
              onChange={(e) => setNewAppointment({...newAppointment, end_time: e.target.value})}
            />

            {/* Appointment Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع الموعد</label>
                  <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    value={newAppointment.appointment_type}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_type: e.target.value})}
                  >
                    <option value="in-person">حضوري</option>
                    <option value="virtual">عن بعد (فيديو)</option>
                    <option value="phone">هاتف</option>
                  </select>
                </div>
                <FormInput 
                  label="سبب الزيارة *" placeholder="مثال: فحص دوري، ألم في الأسنان..."
                  value={newAppointment.reason_for_visit}
                  onChange={(e) => setNewAppointment({...newAppointment, reason_for_visit: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات إضافية</label>
                <textarea 
                  rows={2}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                  placeholder="أي معلومات إضافية يحتاجها الطبيب..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button 
              type="button" 
              onClick={() => setShowAddModal(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-10 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                "تأكيد الحجز"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

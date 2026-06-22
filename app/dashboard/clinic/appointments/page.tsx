'use client';

import { useState, useEffect } from 'react';
import { appointmentsDbHelpers, patientsDbHelpers, doctorsDbHelpers, clinicsDbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Modal, Alert, FormInput } from '@/components';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clinicId, setClinicId] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    start_time: '',
    end_time: '',
    reason_for_visit: '',
    appointment_type: 'in-person',
    notes: '',
  });

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadAppointments();
    }
  }, [selectedDate, filterStatus, clinicId]);

  const initializeData = async () => {
    try {
      const clinicResult = await clinicsDbHelpers.getCurrentClinic();
      if (!clinicResult.success || !clinicResult.data) {
        throw new Error("فشل في استرجاع بيانات العيادة");
      }
      
      setClinicId(clinicResult.data.id);
      
      const [patientsRes, doctorsRes] = await Promise.all([
        patientsDbHelpers.findByClinic(clinicResult.data.id),
        doctorsDbHelpers.findByClinic(clinicResult.data.id)
      ]);
      
      if (patientsRes.success) setPatients(patientsRes.data || []);
      if (doctorsRes.success) setDoctors(doctorsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      // If calendar view, we might want to load more than just one day
      const filters: any = viewMode === 'table' ? { date: selectedDate } : {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      
      const result = await appointmentsDbHelpers.findByClinic(clinicId, filters);
      if (result.success) {
        setAppointments(result.data || []);
      }
    } catch (err) {
      setError("فشل في تحميل المواعيد");
    } finally {
      setLoading(false);
    }
  };

  const checkConflict = async (doctorId: string, startTime: string, endTime: string, excludeId?: string) => {
    try {
      const result = await appointmentsDbHelpers.checkConflict(doctorId, startTime, endTime);
      if (result.success && result.hasConflict) {
        if (excludeId && result.conflictId === excludeId) {
          return false;
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.patient_id || !formData.doctor_id || !formData.start_time || !formData.end_time) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsSubmitting(false);
      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setError("وقت النهاية يجب أن يكون بعد وقت البداية");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check for conflicts
      const hasConflict = await checkConflict(formData.doctor_id, formData.start_time, formData.end_time);
      if (hasConflict) {
        setError("الطبيب مشغول في هذا الوقت. يرجى اختيار وقت آخر");
        setIsSubmitting(false);
        return;
      }

      const result = await appointmentsDbHelpers.create(clinicId, formData);
      if (result.success) {
        setSuccess("تم حجز الموعد بنجاح!");
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess(null);
        }, 1500);
        loadAppointments();
        resetForm();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.patient_id || !formData.doctor_id || !formData.start_time || !formData.end_time) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check for conflicts (excluding current appointment)
      const hasConflict = await checkConflict(formData.doctor_id, formData.start_time, formData.end_time, selectedAppointment.id);
      if (hasConflict) {
        setError("الطبيب مشغول في هذا الوقت. يرجى اختيار وقت آخر");
        setIsSubmitting(false);
        return;
      }

      const result = await appointmentsDbHelpers.update(selectedAppointment.id, formData);
      if (result.success) {
        setSuccess("تم تحديث الموعد بنجاح!");
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess(null);
        }, 1500);
        loadAppointments();
        resetForm();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await appointmentsDbHelpers.delete(selectedAppointment.id);
      if (result.success) {
        setSuccess("تم حذف الموعد بنجاح!");
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setSuccess(null);
        }, 1500);
        loadAppointments();
        setSelectedAppointment(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await appointmentsDbHelpers.update(selectedAppointment.id, { status: newStatus });
      if (result.success) {
        setSuccess("تم تحديث حالة الموعد بنجاح!");
        setTimeout(() => {
          setShowStatusModal(false);
          setSuccess(null);
        }, 1500);
        loadAppointments();
        setSelectedAppointment(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      reason_for_visit: appointment.reason_for_visit || '',
      appointment_type: appointment.appointment_type || 'in-person',
      notes: appointment.notes || '',
    });
    setShowEditModal(true);
  };

  const openStatusModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setShowStatusModal(true);
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      start_time: '',
      end_time: '',
      reason_for_visit: '',
      appointment_type: 'in-person',
      notes: '',
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">جدول المواعيد</h1>
          <p className="mt-1 text-sm text-gray-500">تنظيم وإدارة مواعيد المرضى والأطباء</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          <svg className="ml-2 -mr-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          حجز موعد جديد
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
      {success && <div className="mb-6"><Alert type="success" message={success} /></div>}

      {/* View Switcher & Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start">
          <button 
            onClick={() => setViewMode('table')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              viewMode === 'table' ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            )}
          >
            عرض الجدول
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              viewMode === 'calendar' ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            )}
          >
            عرض التقويم
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">تاريخ اليوم</label>
          <input
            type="date"
            className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border py-2 px-3"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">الحالة</label>
          <select
            className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border py-2 px-3"
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

      {/* Appointments Content */}
      {viewMode === 'calendar' ? (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <AppointmentCalendar 
            appointments={appointments} 
            onDateSelect={(date) => setSelectedDate(date.toISOString().split('T')[0])}
            onAppointmentClick={(apt) => openEditModal(apt)}
          />
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الوقت</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">المريض</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الطبيب</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">السبب</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
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
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="font-medium text-gray-500">لا توجد مواعيد محجوزة لهذا اليوم</span>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/20 transition-colors">
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
                      <div className="text-sm font-bold text-gray-900">
                        {apt.patients?.first_name} {apt.patients?.last_name}
                      </div>
                      <div className="text-[10px] text-gray-400">{apt.patients?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-medium">د. {apt.doctors?.first_name} {apt.doctors?.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {apt.reason_for_visit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => openStatusModal(apt)}
                          className="text-blue-600 hover:text-blue-900 font-bold text-xs bg-blue-50 px-2 py-1 rounded"
                        >
                          تحديث الحالة
                        </button>
                        <button 
                          onClick={() => {
                            const message = `مرحباً ${apt.patients?.first_name} ${apt.patients?.last_name}، نود تذكيرك بموعدك في Omar Clinic Pro يوم ${new Date(apt.start_time).toLocaleDateString('ar-SA')} الساعة ${new Date(apt.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} مع د. ${apt.doctors?.first_name} ${apt.doctors?.last_name}. نتمنى لك السلامة.`;
                            const phone = apt.patients?.phone.replace(/\D/g, '');
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="text-green-600 hover:text-green-900 font-bold text-xs bg-green-50 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.735-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                          واتساب
                        </button>
                        <button 
                          onClick={() => openEditModal(apt)}
                          className="text-blue-600 hover:text-blue-800 transition-all font-bold text-xs"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-all font-bold text-xs"
                        >
                          حذف
                        </button>
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
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">المريض *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={formData.patient_id}
                onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                required
              >
                <option value="">اختر المريض...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الطبيب *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={formData.doctor_id}
                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                required
              >
                <option value="">اختر الطبيب...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>د. {d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">نوع الموعد *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={formData.appointment_type}
                onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
              >
                <option value="in-person">حضوري</option>
                <option value="online">أونلاين</option>
              </select>
            </div>

            <FormInput 
              label="وقت البداية *" type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              required
            />

            <FormInput 
              label="وقت النهاية *" type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              required
            />

            <div className="md:col-span-2">
              <FormInput 
                label="سبب الزيارة" placeholder="الفحص الدوري، علاج..."
                value={formData.reason_for_visit}
                onChange={(e) => setFormData({...formData, reason_for_visit: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات</label>
              <textarea 
                placeholder="ملاحظات إضافية..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : "حجز الموعد"}
          </button>
        </form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="تعديل الموعد"
        size="lg"
      >
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <form onSubmit={handleEditAppointment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">المريض *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={formData.patient_id}
                onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                required
              >
                <option value="">اختر المريض...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الطبيب *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={formData.doctor_id}
                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                required
              >
                <option value="">اختر الطبيب...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>د. {d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">نوع الموعد *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={formData.appointment_type}
                onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
              >
                <option value="in-person">حضوري</option>
                <option value="online">أونلاين</option>
              </select>
            </div>

            <FormInput 
              label="وقت البداية *" type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              required
            />

            <FormInput 
              label="وقت النهاية *" type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              required
            />

            <div className="md:col-span-2">
              <FormInput 
                label="سبب الزيارة" placeholder="الفحص الدوري، علاج..."
                value={formData.reason_for_visit}
                onChange={(e) => setFormData({...formData, reason_for_visit: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات</label>
              <textarea 
                placeholder="ملاحظات إضافية..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : "تحديث الموعد"}
          </button>
        </form>
      </Modal>

      {/* Status Change Modal */}
      <Modal 
        isOpen={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
        title="تغيير حالة الموعد"
      >
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">الحالة الجديدة *</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="scheduled">مجدول</option>
              <option value="confirmed">مؤكد</option>
              <option value="in-progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <button
            onClick={handleChangeStatus}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري التحديث..." : "تحديث الحالة"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        title="تأكيد الحذف"
      >
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <div className="space-y-6">
          <p className="text-gray-600">
            هل أنت متأكد من حذف هذا الموعد؟
            <br />
            <span className="text-red-600 text-sm">هذا الإجراء لا يمكن التراجع عنه.</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleDeleteAppointment}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "جاري الحذف..." : "حذف نهائياً"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-400 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

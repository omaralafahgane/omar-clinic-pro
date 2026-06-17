'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { patientsDbHelpers, appointmentsDbHelpers, invoicesDbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Alert } from '@/components';

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'invoices'>('info');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const patientResult = await patientsDbHelpers.findById(patientId);
      if (!patientResult.success || !patientResult.data) {
        throw new Error("فشل في تحميل بيانات المريض");
      }
      
      setPatient(patientResult.data);

      // Load appointments for this patient
      const appointmentsResult = await appointmentsDbHelpers.findByClinic(patientResult.data.clinic_id);
      if (appointmentsResult.success) {
        const patientAppointments = (appointmentsResult.data || []).filter((apt: any) => apt.patient_id === patientId);
        setAppointments(patientAppointments);
      }

      // Load invoices for this patient
      const invoicesResult = await invoicesDbHelpers.findByClinic(patientResult.data.clinic_id);
      if (invoicesResult.success) {
        const patientInvoices = (invoicesResult.data || []).filter((inv: any) => inv.patient_id === patientId);
        setInvoices(patientInvoices);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
        <Alert type="error" message="لم يتم العثور على المريض" />
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          العودة
        </button>
      </div>
    );
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-lg transition-all"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">ملف المريض</h1>
          <p className="text-sm text-gray-500 mt-1">{patient.first_name} {patient.last_name}</p>
        </div>
      </div>

      {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

      {/* Patient Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">الاسم الكامل</p>
            <p className="text-lg font-bold text-gray-900">{patient.first_name} {patient.last_name}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">العمر</p>
            <p className="text-lg font-bold text-gray-900">{calculateAge(patient.date_of_birth)} سنة</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">الجنس</p>
            <p className="text-lg font-bold text-gray-900">{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">رقم الهاتف</p>
            <p className="text-lg font-bold text-blue-600 font-mono">{patient.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">البريد الإلكتروني</p>
            <p className="text-gray-700">{patient.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">العنوان</p>
            <p className="text-gray-700">{patient.address || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">جهة الاتصال الطارئة</p>
            <p className="text-gray-700">{patient.emergency_contact || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">هاتف الاتصال الطارئ</p>
            <p className="text-gray-700">{patient.emergency_contact_phone || '-'}</p>
          </div>
        </div>

        {patient.medical_history && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">التاريخ الطبي</p>
            <p className="text-gray-700 whitespace-pre-wrap">{patient.medical_history}</p>
          </div>
        )}

        {patient.allergies && (
          <div className="mt-6">
            <p className="text-xs font-bold text-red-600 uppercase mb-2">⚠️ الحساسيات</p>
            <p className="text-gray-700 whitespace-pre-wrap">{patient.allergies}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn(
              "flex-1 px-6 py-4 font-bold text-sm transition-all",
              activeTab === 'info' 
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            المعلومات
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={cn(
              "flex-1 px-6 py-4 font-bold text-sm transition-all",
              activeTab === 'appointments' 
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            المواعيد ({appointments.length})
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={cn(
              "flex-1 px-6 py-4 font-bold text-sm transition-all",
              activeTab === 'invoices' 
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            الفواتير ({invoices.length})
          </button>
        </div>

        <div className="p-8">
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد مواعيد محجوزة</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">د. {apt.doctors?.first_name} {apt.doctors?.last_name}</p>
                          <p className="text-sm text-gray-600 mt-1">{apt.reason_for_visit}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(apt.start_time).toLocaleString('ar-SA')}
                          </p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          apt.status === 'completed' ? "bg-green-100 text-green-800" :
                          apt.status === 'confirmed' ? "bg-blue-100 text-blue-800" :
                          apt.status === 'cancelled' ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {apt.status === 'completed' ? 'مكتمل' :
                           apt.status === 'confirmed' ? 'مؤكد' :
                           apt.status === 'cancelled' ? 'ملغي' :
                           'مجدول'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              {invoices.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد فواتير</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">رقم الفاتورة</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">المبلغ</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm text-gray-900">{inv.invoice_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(inv.created_at).toLocaleDateString('ar-SA')}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{(inv.final_amount || 0).toLocaleString()} ر.س</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-bold",
                              inv.status === 'paid' ? "bg-green-100 text-green-800" :
                              inv.status === 'partially_paid' ? "bg-blue-100 text-blue-800" :
                              inv.status === 'cancelled' ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            )}>
                              {inv.status === 'paid' ? 'مدفوعة' :
                               inv.status === 'partially_paid' ? 'مدفوعة جزئياً' :
                               inv.status === 'cancelled' ? 'ملغاة' :
                               'قيد الانتظار'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">ملخص المريض</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-500 font-bold mb-1">عدد المواعيد</p>
                    <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-xs text-gray-500 font-bold mb-1">الفواتير المدفوعة</p>
                    <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.status === 'paid').length}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-xs text-gray-500 font-bold mb-1">المبالغ المعلقة</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {invoices.filter(i => i.status === 'pending').reduce((acc, inv) => acc + (inv.final_amount || 0), 0).toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

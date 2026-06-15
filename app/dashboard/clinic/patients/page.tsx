'use client';

import { useState, useEffect } from 'react';
import { patientsDb, clinicsDbHelpers } from '@/lib/supabase';
import { cn, isValidEmail, isValidPhoneNumber } from '@/lib/utils';
import { Modal, Alert, FormInput } from '@/components';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'M',
    date_of_birth: '',
    address: '',
    city: '',
    medical_history: '',
    allergies: '',
  });

  // Fetch patients on load
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (!clinicResult.success || !clinicResult.data) {
        throw new Error("فشل في استرجاع بيانات العيادة. تأكد من إعداد قاعدة البيانات بشكل صحيح.");
      }
      
      const result = await patientsDb.findByClinic(clinicResult.data.id);
      if (result.success) {
        setPatients(result.data || []);
      } else {
        throw new Error("فشل في تحميل قائمة المرضى");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Advanced Validation
    if (!isValidPhoneNumber(newPatient.phone)) {
      setError("رقم الهاتف غير صحيح. يجب أن يتكون من 9-10 أرقام (مثال: 05xxxxxxx)");
      setIsSubmitting(false);
      return;
    }

    if (newPatient.email && !isValidEmail(newPatient.email)) {
      setError("البريد الإلكتروني غير صحيح");
      setIsSubmitting(false);
      return;
    }

    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (!clinicResult.success || !clinicResult.data) {
        throw new Error("فشل في استرجاع بيانات العيادة");
      }

      const result = await patientsDb.create(clinicResult.data.id, newPatient);
      if (result.success) {
        setSuccess("تمت إضافة المريض بنجاح!");
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess(null);
        }, 1500);
        loadPatients();
        setNewPatient({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'M',
          date_of_birth: '',
          address: '',
          city: '',
          medical_history: '',
          allergies: '',
        });
      } else {
        throw new Error("حدث خطأ أثناء إضافة المريض في قاعدة البيانات");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">إدارة المرضى</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة سجلات المرضى وتاريخهم الطبي في عيادتك</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 active:scale-95"
        >
          <svg className="ml-2 -mr-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          إضافة مريض جديد
        </button>
      </div>

      {/* Stats & Search Bar */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FormInput
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-bold text-blue-700">{filteredPatients.length}</span>
          <span className="text-blue-600">مرضى مسجلين</span>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم الكامل</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الجوال</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الجنس</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500 font-medium">جاري تحميل سجلات المرضى...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">لا يوجد مرضى مسجلين حالياً</span>
                      <button onClick={() => setShowAddModal(true)} className="text-blue-600 hover:underline text-sm font-bold">أضف أول مريض الآن</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {patient.first_name[0]}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.first_name} {patient.last_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">ID: {patient.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium" dir="ltr">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-full border",
                        patient.gender === 'M' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-pink-50 text-pink-700 border-pink-100"
                      )}>
                        {patient.gender === 'M' ? 'ذكر' : 'أنثى'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.email || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-4">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          تعديل
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          التفاصيل
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

      {/* Enhanced Add Patient Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="إضافة ملف مريض جديد"
        size="xl"
      >
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <form onSubmit={handleAddPatient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">المعلومات الأساسية</h4>
              <FormInput 
                label="الاسم الأول" required placeholder="أحمد"
                value={newPatient.first_name}
                onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
              />
              <FormInput 
                label="اسم العائلة" required placeholder="الغامدي"
                value={newPatient.last_name}
                onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">الجنس *</label>
                  <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                  >
                    <option value="M">ذكر</option>
                    <option value="F">أنثى</option>
                  </select>
                </div>
                <FormInput 
                  label="تاريخ الميلاد" type="date"
                  value={newPatient.date_of_birth}
                  onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                />
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">معلومات التواصل</h4>
              <FormInput 
                label="رقم الجوال" required placeholder="05xxxxxxxx"
                hint="يجب أن يتكون من 9-10 أرقام"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              />
              <FormInput 
                label="البريد الإلكتروني" type="email" placeholder="example@mail.com"
                value={newPatient.email}
                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
              />
              <FormInput 
                label="العنوان" placeholder="الحي، المدينة"
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
              />
            </div>

            {/* Medical Info Section */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">المعلومات الطبية</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ المرضي</label>
                  <textarea 
                    rows={3}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    placeholder="أي أمراض مزمنة أو عمليات سابقة..."
                    value={newPatient.medical_history}
                    onChange={(e) => setNewPatient({...newPatient, medical_history: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الحساسية</label>
                  <textarea 
                    rows={3}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    placeholder="حساسية من أدوية أو أطعمة معينة..."
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                  ></textarea>
                </div>
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
                "حفظ ملف المريض"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

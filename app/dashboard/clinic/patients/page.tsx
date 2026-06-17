'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { patientsDbHelpers, clinicsDbHelpers } from '@/lib/supabase';
import { cn, isValidEmail, isValidPhoneNumber } from '@/lib/utils';
import { Modal, Alert, FormInput } from '@/components';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'male',
    date_of_birth: '',
    address: '',
    city: '',
    medical_history: '',
    allergies: '',
    emergency_contact: '',
    emergency_contact_phone: '',
  });

  // Fetch patients on load
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const clinicResult = await clinicsDbHelpers.getCurrentClinic();
      if (!clinicResult.success || !clinicResult.data) {
        throw new Error("فشل في استرجاع بيانات العيادة. تأكد من إعداد قاعدة البيانات بشكل صحيح.");
      }
      
      setClinicId(clinicResult.data.id);
      loadPatients(clinicResult.data.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadPatients = async (cId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await patientsDbHelpers.findByClinic(cId);
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
    if (!isValidPhoneNumber(formData.phone)) {
      setError("رقم الهاتف غير صحيح. يجب أن يتكون من 9-10 أرقام (مثال: 05xxxxxxx)");
      setIsSubmitting(false);
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError("البريد الإلكتروني غير صحيح");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await patientsDbHelpers.create(clinicId, formData);
      if (result.success) {
        setSuccess("تمت إضافة المريض بنجاح!");
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess(null);
        }, 1500);
        loadPatients(clinicId);
        resetForm();
      } else {
        throw new Error("حدث خطأ أثناء إضافة المريض في قاعدة البيانات");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isValidPhoneNumber(formData.phone)) {
      setError("رقم الهاتف غير صحيح");
      setIsSubmitting(false);
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError("البريد الإلكتروني غير صحيح");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await patientsDbHelpers.update(selectedPatient.id, formData);
      if (result.success) {
        setSuccess("تم تحديث بيانات المريض بنجاح!");
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess(null);
        }, 1500);
        loadPatients(clinicId);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await patientsDbHelpers.delete(selectedPatient.id);
      if (result.success) {
        setSuccess("تم حذف المريض بنجاح!");
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setSuccess(null);
        }, 1500);
        loadPatients(clinicId);
        setSelectedPatient(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email || '',
      phone: patient.phone,
      gender: patient.gender || 'male',
      date_of_birth: patient.date_of_birth || '',
      address: patient.address || '',
      city: patient.city || '',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'male',
      date_of_birth: '',
      address: '',
      city: '',
      medical_history: '',
      allergies: '',
      emergency_contact: '',
      emergency_contact_phone: '',
    });
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
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
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
                          <Link href={`/dashboard/clinic/patients/${patient.id}`}>
                            <div className="text-sm font-bold text-blue-600 group-hover:text-blue-800 transition-colors cursor-pointer">{patient.first_name} {patient.last_name}</div>
                          </Link>
                          <div className="text-[10px] text-gray-400 font-mono">ID: {patient.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium" dir="ltr">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-full border",
                        patient.gender === 'male' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-pink-50 text-pink-700 border-pink-100"
                      )}>
                        {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.email || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => openEditModal(patient)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          تعديل
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          حذف
                        </button>
                        <Link href={`/dashboard/clinic/patients/${patient.id}`}>
                          <button className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            التفاصيل
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
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
            <div className="space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">المعلومات الأساسية</h4>
              <FormInput 
                label="الاسم الأول *" required placeholder="أحمد"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
              <FormInput 
                label="اسم العائلة *" required placeholder="الغامدي"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">الجنس *</label>
                  <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <FormInput 
                  label="تاريخ الميلاد" type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">معلومات التواصل</h4>
              <FormInput 
                label="رقم الجوال *" required placeholder="05xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <FormInput 
                label="البريد الإلكتروني" type="email" placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <FormInput 
                label="العنوان" placeholder="الحي، المدينة"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-green-600 text-sm uppercase tracking-wider border-r-4 border-green-600 pr-2">المعلومات الطبية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ الطبي</label>
                <textarea 
                  placeholder="أمراض مزمنة، عمليات سابقة..."
                  value={formData.medical_history}
                  onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الحساسيات</label>
                <textarea 
                  placeholder="أدوية، طعام، مواد كيميائية..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-red-600 text-sm uppercase tracking-wider border-r-4 border-red-600 pr-2">جهات الاتصال الطارئة</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput 
                label="اسم جهة الاتصال" placeholder="اسم المتصل"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
              />
              <FormInput 
                label="رقم الهاتف" placeholder="05xxxxxxxx"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : "إضافة المريض"}
          </button>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="تعديل بيانات المريض"
        size="xl"
      >
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <form onSubmit={handleEditPatient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">المعلومات الأساسية</h4>
              <FormInput 
                label="الاسم الأول *" required placeholder="أحمد"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
              <FormInput 
                label="اسم العائلة *" required placeholder="الغامدي"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">الجنس *</label>
                  <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <FormInput 
                  label="تاريخ الميلاد" type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-blue-600 text-sm uppercase tracking-wider border-r-4 border-blue-600 pr-2">معلومات التواصل</h4>
              <FormInput 
                label="رقم الجوال *" required placeholder="05xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <FormInput 
                label="البريد الإلكتروني" type="email" placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <FormInput 
                label="العنوان" placeholder="الحي، المدينة"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-green-600 text-sm uppercase tracking-wider border-r-4 border-green-600 pr-2">المعلومات الطبية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ الطبي</label>
                <textarea 
                  placeholder="أمراض مزمنة، عمليات سابقة..."
                  value={formData.medical_history}
                  onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الحساسيات</label>
                <textarea 
                  placeholder="أدوية، طعام، مواد كيميائية..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : "تحديث البيانات"}
          </button>
        </form>
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
            هل أنت متأكد من حذف المريض <strong>{selectedPatient?.first_name} {selectedPatient?.last_name}</strong>؟ 
            <br />
            <span className="text-red-600 text-sm">هذا الإجراء لا يمكن التراجع عنه.</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleDeletePatient}
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

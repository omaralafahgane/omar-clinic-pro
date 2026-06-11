'use client';

import { useState, useEffect } from 'react';
import { patientsDb } from '@/lib/supabase';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'M',
  });

  // Fetch patients on load
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    // Note: clinicId should come from context/auth
    const clinicId = "demo-clinic-id"; 
    const result = await patientsDb.findByClinic(clinicId);
    if (result.success) {
      setPatients(result.data || []);
    }
    setLoading(false);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const clinicId = "demo-clinic-id";
    const result = await patientsDb.create(clinicId, newPatient);
    if (result.success) {
      setShowAddModal(false);
      loadPatients();
      setNewPatient({ first_name: '', last_name: '', email: '', phone: '', gender: 'M' });
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المرضى</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          إضافة مريض جديد
        </button>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجنس</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العمليات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا يوجد مرضى حالياً</td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.first_name} {patient.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.gender === 'M' ? 'ذكر' : 'أنثى'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600 cursor-pointer">تعديل</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">إضافة مريض</h2>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <input 
                type="text" placeholder="الاسم الأول" required
                className="w-full border p-2 rounded"
                value={newPatient.first_name}
                onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
              />
              <input 
                type="text" placeholder="اسم العائلة" required
                className="w-full border p-2 rounded"
                value={newPatient.last_name}
                onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
              />
              <input 
                type="tel" placeholder="رقم الهاتف" required
                className="w-full border p-2 rounded"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              />
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

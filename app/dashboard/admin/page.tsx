'use client';

import { useState, useEffect } from 'react';
import { adminDb, clinicsDb } from '@/lib/supabase';

export default function SuperAdminDashboard() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clinics' | 'keys'>('clinics');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState({ plan: 'basic', duration_days: 30 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const clinicsRes = await clinicsDb.getAll();
    const keysRes = await adminDb.getActivationKeys();
    
    if (clinicsRes.success) setClinics(clinicsRes.data || []);
    if (keysRes.success) setKeys(keysRes.data || []);
    setLoading(false);
  };

  const handleGenerateKey = async () => {
    const keyString = 'KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const result = await adminDb.generateKey({
      key: keyString,
      plan: newKey.plan,
      duration_days: newKey.duration_days
    });
    
    if (result.success) {
      setShowKeyModal(false);
      loadData();
    }
  };

  const toggleClinicStatus = async (clinicId: string, currentStatus: boolean) => {
    const result = await adminDb.setClinicStatus(clinicId, !currentStatus);
    if (result.success) loadData();
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">لوحة تحكم SUPER_ADMIN</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 space-x-reverse mb-6 border-b">
        <button 
          onClick={() => setActiveTab('clinics')}
          className={`pb-2 px-4 ${activeTab === 'clinics' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
        >
          إدارة العيادات
        </button>
        <button 
          onClick={() => setActiveTab('keys')}
          className={`pb-2 px-4 ${activeTab === 'keys' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
        >
          مفاتيح التفعيل (Activation Keys)
        </button>
      </div>

      {loading ? (
        <p>جاري تحميل البيانات...</p>
      ) : (
        <>
          {activeTab === 'clinics' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العيادة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخطة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العمليات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clinics.map((clinic) => (
                    <tr key={clinic.id}>
                      <td className="px-6 py-4">{clinic.name}</td>
                      <td className="px-6 py-4">{clinic.email}</td>
                      <td className="px-6 py-4">{clinic.subscription_plan}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${clinic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {clinic.is_active ? 'نشط' : 'موقف'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2 space-x-reverse">
                        <button onClick={() => toggleClinicStatus(clinic.id, clinic.is_active)} className="text-blue-600 hover:underline">
                          {clinic.is_active ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <button className="text-gray-600 hover:underline">تجديد</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'keys' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowKeyModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">إنشاء مفتاح جديد</button>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المفتاح</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخطة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {keys.map((k) => (
                      <tr key={k.id}>
                        <td className="px-6 py-4 font-mono">{k.key}</td>
                        <td className="px-6 py-4">{k.plan}</td>
                        <td className="px-6 py-4">{k.duration_days} يوم</td>
                        <td className="px-6 py-4">
                          {k.is_used ? (
                            <span className="text-red-600">مستخدم</span>
                          ) : (
                            <span className="text-green-600">جاهز</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal for Key Generation */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">إنشاء مفتاح تفعيل جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الخطة</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={newKey.plan}
                  onChange={(e) => setNewKey({...newKey, plan: e.target.value})}
                >
                  <option value="basic">أساسي (Basic)</option>
                  <option value="advanced">متقدم (Advanced)</option>
                  <option value="enterprise">مؤسسي (Enterprise)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المدة (بالأيام)</label>
                <input 
                  type="number" className="w-full border p-2 rounded"
                  value={newKey.duration_days}
                  onChange={(e) => setNewKey({...newKey, duration_days: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-gray-600">إلغاء</button>
                <button onClick={handleGenerateKey} className="px-4 py-2 bg-blue-600 text-white rounded">إنشاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { invoicesDb, patientsDb, clinicsDbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Modal, Alert, FormInput } from '@/components';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newInvoice, setNewInvoice] = useState({
    patient_id: '',
    total_amount: '',
    discount_amount: '0',
    tax_amount: '0',
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [filterStatus]);

  const loadInitialData = async () => {
    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (clinicResult.success && clinicResult.data) {
        const patientsRes = await patientsDb.findByClinic(clinicResult.data.id);
        if (patientsRes.success) setPatients(patientsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (clinicResult.success && clinicResult.data) {
        const filters: any = {};
        if (filterStatus !== 'all') filters.status = filterStatus;
        
        const result = await invoicesDb.findByClinic(clinicResult.data.id, filters);
        if (result.success) {
          setInvoices(result.data || []);
        }
      }
    } catch (err) {
      setError("فشل في تحميل الفواتير");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!newInvoice.patient_id || !newInvoice.total_amount) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsSubmitting(false);
      return;
    }

    try {
      const clinicResult = await clinicsDbHelpers.getDefaultClinic();
      if (clinicResult.success && clinicResult.data) {
        const invoiceNumber = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const total = parseFloat(newInvoice.total_amount);
        const discount = parseFloat(newInvoice.discount_amount || '0');
        const tax = parseFloat(newInvoice.tax_amount || '0');
        const finalAmount = total + tax - discount;

        const result = await invoicesDb.create(clinicResult.data.id, {
          ...newInvoice,
          invoice_number: invoiceNumber,
          total_amount: total,
          discount_amount: discount,
          tax_amount: tax,
          final_amount: finalAmount,
          status: 'pending'
        } as any);

        if (result.success) {
          setSuccess("تم إنشاء الفاتورة بنجاح!");
          setTimeout(() => {
            setShowAddModal(false);
            setSuccess(null);
          }, 1500);
          loadInvoices();
          setNewInvoice({
            patient_id: '',
            total_amount: '',
            discount_amount: '0',
            tax_amount: '0',
            notes: '',
          });
        } else {
          throw new Error("فشل في حفظ الفاتورة");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await invoicesDb.updateStatus(id, newStatus);
      if (result.success) {
        loadInvoices();
      }
    } catch (err) {
      setError("فشل في تحديث حالة الفاتورة");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      partially_paid: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      overdue: "bg-orange-100 text-orange-800 border-orange-200",
    };
    const labels: any = {
      pending: "قيد الانتظار",
      paid: "مدفوعة",
      partially_paid: "مدفوعة جزئياً",
      cancelled: "ملغاة",
      overdue: "متأخرة",
    };
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", styles[status] || styles.pending)}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">الفواتير والمالية</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة المدفوعات وإصدار الفواتير للمرضى</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105 active:scale-95"
        >
          <svg className="ml-2 -mr-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          إصدار فاتورة جديدة
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500">إجمالي المحصل</p>
            <p className="text-xl font-black text-gray-900">
              {invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (curr.final_amount || 0), 0).toLocaleString()} ر.س
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500">مبالغ معلقة</p>
            <p className="text-xl font-black text-gray-900">
              {invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + (curr.final_amount || 0), 0).toLocaleString()} ر.س
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500">عدد الفواتير</p>
            <p className="text-xl font-black text-gray-900">{invoices.length}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 mr-1">تصفية حسب الحالة</label>
          <select
            className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2 px-3"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="paid">مدفوعة</option>
            <option value="partially_paid">مدفوعة جزئياً</option>
            <option value="cancelled">ملغاة</option>
            <option value="overdue">متأخرة</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المريض</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المبلغ الإجمالي</th>
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
                      <span className="text-gray-500 font-medium">جاري تحميل البيانات المالية...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">لا توجد فواتير مسجلة حالياً</span>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 font-mono">{inv.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{inv.patient?.first_name} {inv.patient?.last_name}</div>
                      <div className="text-[10px] text-gray-400">{inv.patient?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inv.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900">{(inv.final_amount || 0).toLocaleString()} ر.س</div>
                      {inv.discount_amount > 0 && <div className="text-[10px] text-red-500">خصم: {inv.discount_amount} ر.س</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        {inv.status !== 'paid' && (
                          <button 
                            onClick={() => handleUpdateStatus(inv.id, 'paid')}
                            className="text-green-600 hover:text-green-800 transition-all font-bold"
                          >
                            تم الدفع
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-800 transition-all">تحميل PDF</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="إصدار فاتورة جديدة"
        size="lg"
      >
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <form onSubmit={handleAddInvoice} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">المريض *</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                value={newInvoice.patient_id}
                onChange={(e) => setNewInvoice({...newInvoice, patient_id: e.target.value})}
                required
              >
                <option value="">اختر المريض...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.phone}</option>
                ))}
              </select>
            </div>

            <FormInput 
              label="المبلغ الأساسي (ر.س) *" type="number" step="0.01" required
              value={newInvoice.total_amount}
              onChange={(e) => setNewInvoice({...newInvoice, total_amount: e.target.value})}
            />
            <FormInput 
              label="مبلغ الخصم (ر.س)" type="number" step="0.01"
              value={newInvoice.discount_amount}
              onChange={(e) => setNewInvoice({...newInvoice, discount_amount: e.target.value})}
            />
            <FormInput 
              label="الضريبة (ر.س)" type="number" step="0.01"
              value={newInvoice.tax_amount}
              onChange={(e) => setNewInvoice({...newInvoice, tax_amount: e.target.value})}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات الفاتورة</label>
              <textarea 
                rows={2}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
                placeholder="تفاصيل الخدمات المقدمة..."
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
              ></textarea>
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
                "px-10 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                "إصدار الفاتورة"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

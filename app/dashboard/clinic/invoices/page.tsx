'use client';

import { useState, useEffect } from 'react';
import { invoicesDbHelpers, patientsDbHelpers, clinicsDbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Modal, Alert, FormInput } from '@/components';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [clinicId, setClinicId] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [newInvoice, setNewInvoice] = useState({
    patient_id: '',
    total_amount: '',
    discount_amount: '0',
    tax_amount: '0',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount_paid: 0,
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadInvoices();
    }
  }, [filterStatus, clinicId]);

  const initializeData = async () => {
    try {
      const clinicResult = await clinicsDbHelpers.getCurrentClinic();
      if (!clinicResult.success || !clinicResult.data) {
        throw new Error("فشل في استرجاع بيانات العيادة");
      }
      
      setClinicId(clinicResult.data.id);
      
      const patientsRes = await patientsDbHelpers.findByClinic(clinicResult.data.id);
      if (patientsRes.success) setPatients(patientsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== 'all') filters.payment_status = filterStatus;
      
      const result = await invoicesDbHelpers.findByClinic(clinicId, filters);
      if (result.success) {
        setInvoices(result.data || []);
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
      const invoiceNumber = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const total = parseFloat(newInvoice.total_amount);
      const discount = parseFloat(newInvoice.discount_amount || '0');
      const tax = parseFloat(newInvoice.tax_amount || '0');
      const finalAmount = total + tax - discount;

      const result = await invoicesDbHelpers.create(clinicId, {
        ...newInvoice,
        invoice_number: invoiceNumber,
        total_amount: total,
        discount_amount: discount,
        tax_amount: tax,
        final_amount: finalAmount,
        payment_status: 'unpaid'
      });

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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newStatus = selectedInvoice.final_amount === paymentData.amount_paid ? 'paid' : 'partial';
      
      const result = await invoicesDbHelpers.update(selectedInvoice.id, {
        payment_status: newStatus,
        amount_paid: (selectedInvoice.amount_paid || 0) + paymentData.amount_paid,
      });

      if (result.success) {
        setSuccess("تم تسجيل الدفع بنجاح!");
        setTimeout(() => {
          setShowPaymentModal(false);
          setSuccess(null);
        }, 1500);
        loadInvoices();
        setSelectedInvoice(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      unpaid: "bg-red-100 text-red-800 border-red-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    const labels: any = {
      unpaid: "غير مدفوعة",
      paid: "مدفوعة",
      partial: "مدفوعة جزئياً",
      cancelled: "ملغاة",
    };
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", styles[status] || styles.unpaid)}>
        {labels[status] || status}
      </span>
    );
  };

  const totalCollected = invoices.filter(i => i.payment_status === 'paid').reduce((acc, curr) => acc + (curr.final_amount || 0), 0);
  const totalPending = invoices.filter(i => i.payment_status === 'unpaid').reduce((acc, curr) => acc + (curr.final_amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">الفواتير والمالية</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة المدفوعات وإصدار الفواتير للمرضى</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105"
        >
          <svg className="ml-2 -mr-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          إصدار فاتورة جديدة
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
      {success && <div className="mb-6"><Alert type="success" message={success} /></div>}

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
            <p className="text-xl font-black text-gray-900">{totalCollected.toLocaleString()} ر.س</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500">مبالغ معلقة</p>
            <p className="text-xl font-black text-gray-900">{totalPending.toLocaleString()} ر.س</p>
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

      {/* Filters */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">تصفية حسب الحالة</label>
          <select
            className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 border py-2 px-3"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="unpaid">غير مدفوعة</option>
            <option value="paid">مدفوعة</option>
            <option value="partial">مدفوعة جزئياً</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">رقم الفاتورة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">المريض</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">المبلغ</th>
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
                      <span className="text-gray-500 font-medium">جاري تحميل البيانات...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <span className="font-medium text-gray-500">لا توجد فواتير مسجلة حالياً</span>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 font-mono">{inv.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{inv.patients?.first_name} {inv.patients?.last_name}</div>
                      <div className="text-[10px] text-gray-400">{inv.patients?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inv.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900">{(inv.final_amount || 0).toLocaleString()} ر.س</div>
                      {inv.discount_amount > 0 && <div className="text-[10px] text-red-500">خصم: {inv.discount_amount} ر.س</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        {inv.payment_status !== 'paid' && (
                          <button 
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPaymentModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 transition-all font-bold text-xs"
                          >
                            دفع
                          </button>
                        )}
                        <button className="text-purple-600 hover:text-purple-800 transition-all font-bold text-xs">PDF</button>
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
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>

            <FormInput 
              label="المبلغ الأساسي *" type="number" step="0.01"
              value={newInvoice.total_amount}
              onChange={(e) => setNewInvoice({...newInvoice, total_amount: e.target.value})}
              required
            />

            <FormInput 
              label="الخصم" type="number" step="0.01"
              value={newInvoice.discount_amount}
              onChange={(e) => setNewInvoice({...newInvoice, discount_amount: e.target.value})}
            />

            <FormInput 
              label="الضريبة" type="number" step="0.01"
              value={newInvoice.tax_amount}
              onChange={(e) => setNewInvoice({...newInvoice, tax_amount: e.target.value})}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">ملاحظات</label>
              <textarea 
                placeholder="ملاحظات إضافية..."
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
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
            {isSubmitting ? "جاري الحفظ..." : "إنشاء الفاتورة"}
          </button>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        title="تسجيل دفع"
      >
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-gray-600">
              <div>الإجمالي: <span className="font-bold text-blue-900">{selectedInvoice?.final_amount} ر.س</span></div>
              <div>المدفوع: <span className="font-bold text-blue-900">{selectedInvoice?.amount_paid || 0} ر.س</span></div>
              <div>المتبقي: <span className="font-bold text-red-600">{(selectedInvoice?.final_amount - (selectedInvoice?.amount_paid || 0))} ر.س</span></div>
            </div>
          </div>

          <FormInput 
            label="المبلغ المدفوع *" type="number" step="0.01"
            value={paymentData.amount_paid}
            onChange={(e) => setPaymentData({...paymentData, amount_paid: parseFloat(e.target.value)})}
            required
          />

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">طريقة الدفع</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5 text-sm"
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
            >
              <option value="cash">نقداً</option>
              <option value="card">بطاقة ائتمان</option>
              <option value="transfer">تحويل بنكي</option>
              <option value="check">شيك</option>
            </select>
          </div>

          <FormInput 
            label="تاريخ الدفع" type="date"
            value={paymentData.payment_date}
            onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
          />

          <button
            onClick={handleRecordPayment}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري التسجيل..." : "تسجيل الدفع"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

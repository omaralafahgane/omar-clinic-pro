'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  current_stock_level: number;
  min_stock_level: number;
  unit: string;
  unit_price: number;
  expiry_date: string;
  is_active: boolean;
}

export default function InventoryPage() {
  const { isLoaded, userId } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'medicine',
    sku: '',
    current_stock_level: 0,
    min_stock_level: 10,
    unit: 'piece',
    unit_price: 0,
    expiry_date: ''
  });
  const [showTransaction, setShowTransaction] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState({
    quantity: 0,
    type: 'in' as 'in' | 'out',
    reason: ''
  });

  useEffect(() => {
    if (isLoaded && userId) {
      fetchItems();
    }
  }, [isLoaded, userId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('فشل تحميل المخزون');
      const data = await response.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/inventory/${editingId}` : '/api/inventory';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('فشل حفظ البيانات');
      
      toast.success(editingId ? 'تم تحديث الصنف بنجاح' : 'تم إضافة الصنف بنجاح');
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  const handleTransaction = async (itemId: string) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) throw new Error('فشل تسجيل العملية');
      
      toast.success('تم تسجيل العملية بنجاح');
      setShowTransaction(null);
      setTransactionData({ quantity: 0, type: 'in', reason: '' });
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      sku: item.sku,
      current_stock_level: item.current_stock_level,
      min_stock_level: item.min_stock_level,
      unit: item.unit,
      unit_price: item.unit_price,
      expiry_date: item.expiry_date
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
    
    try {
      const response = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل حذف الصنف');
      toast.success('تم حذف الصنف بنجاح');
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'medicine', sku: '', current_stock_level: 0, min_stock_level: 10, unit: 'piece', unit_price: 0, expiry_date: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  const lowStockItems = items.filter(item => item.current_stock_level <= item.min_stock_level);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-gray-500 mt-2">إدارة الأدوية والمستلزمات الطبية والإدخال والإخراج</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة صنف جديد
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">تنبيه: أصناف قليلة في المخزون</p>
                <p className="text-sm text-yellow-800">{lowStockItems.length} صنف تحت الحد الأدنى للمخزون</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{editingId ? 'تعديل الصنف' : 'إضافة صنف جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الصنف *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الفئة *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="medicine">دواء</option>
                    <option value="supply">مستلزم</option>
                    <option value="equipment">معدات</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">رمز SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوحدة *</label>
                  <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="piece">قطعة</option>
                    <option value="box">صندوق</option>
                    <option value="ml">مل</option>
                    <option value="mg">ملغ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الكمية الحالية *</label>
                  <input type="number" value={formData.current_stock_level} onChange={(e) => setFormData({...formData, current_stock_level: parseInt(e.target.value)})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الحد الأدنى *</label>
                  <input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value)})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السعر *</label>
                  <input type="number" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">حفظ</button>
                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد أصناف في المخزون حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className={`hover:shadow-lg transition-shadow ${item.current_stock_level <= item.min_stock_level ? 'border-yellow-200 bg-yellow-50' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category === 'medicine' ? 'دواء' : item.category === 'supply' ? 'مستلزم' : 'معدات'}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>📦 SKU: {item.sku}</span>
                      <span>💰 {item.unit_price} د.ا</span>
                      {item.expiry_date && <span>📅 {new Date(item.expiry_date).toLocaleDateString('ar-SA')}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{item.current_stock_level}</div>
                    <p className="text-sm text-gray-500">{item.unit}</p>
                    <Badge variant={item.current_stock_level > item.min_stock_level ? "default" : "destructive"} className="mt-2">
                      {item.current_stock_level > item.min_stock_level ? 'متوفر' : 'قليل'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 border-t pt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowTransaction(item.id)} className="gap-1">
                    <TrendingUp className="w-4 h-4" /> إدخال
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setShowTransaction(item.id); setTransactionData({...transactionData, type: 'out'}); }} className="gap-1">
                    <TrendingDown className="w-4 h-4" /> إخراج
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                {showTransaction === item.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">الكمية *</label>
                        <input type="number" value={transactionData.quantity} onChange={(e) => setTransactionData({...transactionData, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">السبب</label>
                        <input type="text" value={transactionData.reason} onChange={(e) => setTransactionData({...transactionData, reason: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="مثال: شراء جديد، استخدام في العيادة" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleTransaction(item.id)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">تأكيد</button>
                        <button onClick={() => setShowTransaction(null)} className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">إلغاء</button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

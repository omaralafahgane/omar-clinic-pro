'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  license_number: string;
  is_active: boolean;
  created_at: string;
}

export default function DoctorsPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    license_number: ''
  });

  useEffect(() => {
    if (isLoaded && userId) {
      fetchDoctors();
    }
  }, [isLoaded, userId]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctors');
      if (!response.ok) throw new Error('فشل تحميل الأطباء');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.data || []);
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
      const url = editingId ? `/api/doctors/${editingId}` : '/api/doctors';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('فشل حفظ البيانات');
      
      toast.success(editingId ? 'تم تحديث الطبيب بنجاح' : 'تم إضافة الطبيب بنجاح');
      setFormData({ first_name: '', last_name: '', email: '', phone: '', specialization: '', license_number: '' });
      setEditingId(null);
      setShowForm(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setFormData({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      license_number: doctor.license_number
    });
    setEditingId(doctor.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
    
    try {
      const response = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل حذف الطبيب');
      toast.success('تم حذف الطبيب بنجاح');
      fetchDoctors();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأطباء</h1>
          <p className="text-gray-500 mt-2">إضافة وتعديل بيانات الأطباء في العيادة</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة طبيب جديد
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{editingId ? 'تعديل الطبيب' : 'إضافة طبيب جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم الأول *</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم الأخير *</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">البريد الإلكتروني *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رقم الهاتف *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">التخصص *</label>
                  <input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" placeholder="مثال: طب الأسنان" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رقم الترخيص *</label>
                  <input type="text" value={formData.license_number} onChange={(e) => setFormData({...formData, license_number: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">حفظ</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin" /></div>
      ) : doctors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد أطباء مسجلين حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{doctor.first_name} {doctor.last_name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>📧 {doctor.email}</span>
                      <span>📱 {doctor.phone}</span>
                      <span>🔖 {doctor.license_number}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={doctor.is_active ? "default" : "secondary"}>{doctor.is_active ? 'نشط' : 'غير نشط'}</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(doctor.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

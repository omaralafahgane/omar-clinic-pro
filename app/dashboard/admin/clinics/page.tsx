'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Clinic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

export default function ClinicsPage() {
  const { isLoaded, userId } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchClinics();
    }
  }, [isLoaded, userId]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/clinics');
      if (!response.ok) throw new Error('فشل تحميل العيادات');
      const data = await response.json();
      if (data.success) {
        setClinics(data.data || []);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/clinics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      if (!response.ok) throw new Error('فشل تحديث الحالة');
      toast.success('تم تحديث حالة العيادة بنجاح');
      fetchClinics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العيادة؟')) return;
    try {
      const response = await fetch(`/api/admin/clinics/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل حذف العيادة');
      toast.success('تم حذف العيادة بنجاح');
      fetchClinics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ ما');
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">إدارة العيادات</h1>
        <p className="text-gray-500 mt-2">عرض وإدارة جميع العيادات المسجلة في النظام</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin" /></div>
      ) : clinics.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد عيادات مسجلة حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{clinic.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>📧 {clinic.email}</span>
                      <span>📱 {clinic.phone}</span>
                      <span>📄 {clinic.city}, {clinic.country}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{clinic.address}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={clinic.is_active ? "default" : "secondary"}>
                      {clinic.is_active ? 'نشطة' : 'معطلة'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleActive(clinic.id, clinic.is_active)}
                      >
                        {clinic.is_active ? 'تعطيل' : 'تفعيل'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(clinic.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

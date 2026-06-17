'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowRight, MapPin, Clock, User } from 'lucide-react';

interface AppointmentDetail {
  id: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string;
  status: string;
  notes: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialization: string;
  };
  clinic: {
    name: string;
    address: string;
    phone: string;
  };
}

export default function AppointmentDetailPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/appointments/${appointmentId}`);
        
        if (!response.ok) {
          throw new Error('فشل تحميل بيانات الموعد');
        }

        const result = await response.json();
        if (result.success) {
          setAppointment(result.data);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ ما');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [isLoaded, userId, appointmentId]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              خطأ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على الموعد</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.start_time);
  const endDate = new Date(appointment.end_time);
  const isUpcoming = appointmentDate > new Date();
  const isPast = appointmentDate < new Date();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى المواعيد
        </Button>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{appointment.reason_for_visit}</CardTitle>
                <CardDescription className="mt-2">
                  تفاصيل موعدك الطبي
                </CardDescription>
              </div>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status === 'scheduled' ? 'مجدول' : 
                 appointment.status === 'completed' ? 'مكتمل' : 
                 appointment.status === 'cancelled' ? 'ملغى' : appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">الطبيب</p>
                <p className="font-bold text-gray-900">
                  د. {appointment.doctor.first_name} {appointment.doctor.last_name}
                </p>
                <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">التاريخ والوقت</p>
                  <p className="font-bold text-gray-900">
                    {appointmentDate.toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointmentDate.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {endDate.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">المدة</p>
                  <p className="font-bold text-gray-900">
                    {Math.round((endDate.getTime() - appointmentDate.getTime()) / (1000 * 60))} دقيقة
                  </p>
                </div>
              </div>
            </div>

            {/* Clinic Location */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">مكان الموعد</p>
                <p className="font-bold text-gray-900">{appointment.clinic.name}</p>
                <p className="text-sm text-gray-600">{appointment.clinic.address}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>الهاتف:</strong> {appointment.clinic.phone}
                </p>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">ملاحظات</p>
                <p className="text-gray-900">{appointment.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {isUpcoming && (
                <>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    تأكيد الحضور
                  </Button>
                  <Button variant="outline" className="flex-1">
                    طلب تأجيل
                  </Button>
                </>
              )}
              {isPast && appointment.status === 'completed' && (
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  تحميل الوصفة الطبية
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reminders */}
        {isUpcoming && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-blue-900">
                💡 <strong>تذكير:</strong> يرجى الحضور قبل 10 دقائق من موعد الالتقاء
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

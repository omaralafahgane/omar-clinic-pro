'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowRight, Download, Eye } from 'lucide-react';

interface MedicalFileDetail {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number;
  description: string;
  created_at: string;
  uploaded_by: string;
}

export default function MedicalFileDetailPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const fileId = params.id as string;

  const [file, setFile] = useState<MedicalFileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchFile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/files/${fileId}`);
        
        if (!response.ok) {
          throw new Error('فشل تحميل بيانات الملف');
        }

        const result = await response.json();
        if (result.success) {
          setFile(result.data);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ ما');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [isLoaded, userId, fileId]);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'image':
      case 'jpg':
      case 'png':
      case 'jpeg':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

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

  if (!file) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على الملف</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isImage = file.file_type.toLowerCase().includes('image');
  const isPDF = file.file_type.toLowerCase().includes('pdf');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى الملفات
        </Button>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <span className="text-3xl">{getFileIcon(file.file_type)}</span>
              {file.file_name}
            </CardTitle>
            <CardDescription>
              تم الرفع في {new Date(file.created_at).toLocaleDateString('ar-SA')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">نوع الملف</p>
                <p className="font-bold text-gray-900">{file.file_type}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">حجم الملف</p>
                <p className="font-bold text-gray-900">{formatFileSize(file.file_size)}</p>
              </div>
            </div>

            {/* Description */}
            {file.description && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">الوصف</p>
                <p className="text-gray-900">{file.description}</p>
              </div>
            )}

            {/* File Preview */}
            {isImage && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <img
                  src={file.file_url}
                  alt={file.file_name}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            )}

            {isPDF && (
              <div className="border rounded-lg overflow-hidden bg-white p-4">
                <iframe
                  src={file.file_url}
                  className="w-full h-96"
                  title={file.file_name}
                />
              </div>
            )}

            {!isImage && !isPDF && (
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <p className="text-gray-600 mb-4">لا يمكن عرض معاينة لهذا النوع من الملفات</p>
                <p className="text-sm text-gray-500">يمكنك تحميل الملف لعرضه على جهازك</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <a
                href={file.file_url}
                download={file.file_name}
                className="flex-1"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الملف
                </Button>
              </a>
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض في نافذة جديدة
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* File Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الملف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">معرّف الملف:</span>
                <span className="font-mono text-sm text-gray-900">{file.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الرفع:</span>
                <span className="text-gray-900">
                  {new Date(file.created_at).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رفع بواسطة:</span>
                <span className="text-gray-900">{file.uploaded_by}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

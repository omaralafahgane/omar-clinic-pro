'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav'
];

const FILE_TYPE_LABELS: { [key: string]: string } = {
  'application/pdf': 'PDF',
  'image/jpeg': 'صورة (JPEG)',
  'image/png': 'صورة (PNG)',
  'image/gif': 'صورة (GIF)',
  'image/webp': 'صورة (WebP)',
  'video/mp4': 'فيديو (MP4)',
  'video/quicktime': 'فيديو (MOV)',
  'audio/mpeg': 'صوت (MP3)',
  'audio/wav': 'صوت (WAV)'
};

export default function FileUploadPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`نوع الملف ${file.name} غير مدعوم`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(`حجم الملف ${file.name} كبير جداً (الحد الأقصى 50MB)`);
        return false;
      }
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.file === uploadedFile.file
            ? { ...f, status: 'uploading' as const }
            : f
        )
      );

      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('description', description);
      formData.append('fileType', selectedType || FILE_TYPE_LABELS[uploadedFile.file.type]);

      const response = await fetch('/api/patients/files', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('فشل رفع الملف');
      }

      setUploadedFiles(prev =>
        prev.map(f =>
          f.file === uploadedFile.file
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      );
    } catch (error) {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.file === uploadedFile.file
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'خطأ غير معروف'
              }
            : f
        )
      );
    }
  };

  const handleUploadAll = async () => {
    if (!selectedType) {
      alert('يرجى اختيار نوع الملف');
      return;
    }

    const filesToUpload = uploadedFiles.filter(f => f.status === 'pending');
    for (const file of filesToUpload) {
      await uploadFile(file);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setDescription('');
    setSelectedType('');
  };

  const allUploaded = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status !== 'pending' && f.status !== 'uploading');

  if (!isLoaded || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">رفع ملفات طبية</h1>
          <p className="text-gray-600 mt-2">أضف أشعات، تحاليل، أو وثائق طبية أخرى</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                اسحب الملفات هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-600 mb-4">
                الأنواع المدعومة: PDF، الصور، الفيديو، الصوت
              </p>
              <p className="text-xs text-gray-500">الحد الأقصى لحجم الملف: 50MB</p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                accept={ALLOWED_TYPES.join(',')}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <span>اختر الملفات</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* File Type Selection */}
        {uploadedFiles.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>نوع الملف</CardTitle>
              <CardDescription>اختر نوع الملف الذي تريد رفعه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- اختر نوع الملف --</option>
                <option value="X-Ray">أشعة سينية</option>
                <option value="CT Scan">أشعة مقطعية</option>
                <option value="Ultrasound">موجات فوق صوتية</option>
                <option value="Lab Test">تحليل دم</option>
                <option value="Prescription">وصفة طبية</option>
                <option value="Report">تقرير طبي</option>
                <option value="Other">أخرى</option>
              </select>

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أضف وصفاً اختيارياً للملفات (مثل: أشعة الصدر من تاريخ...)"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </CardContent>
          </Card>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>الملفات المختارة ({uploadedFiles.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadedFile.status === 'error' && (
                      <p className="text-sm text-red-600 mt-1">{uploadedFile.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {uploadedFile.status === 'pending' && (
                      <span className="text-sm text-gray-600">جاهز</span>
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    )}
                    {uploadedFile.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {uploadedFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {uploadedFiles.length > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={handleUploadAll}
              disabled={!selectedType || allUploaded}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 ml-2" />
              رفع الملفات
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              className="flex-1"
            >
              مسح الكل
            </Button>
          </div>
        )}

        {/* Success Message */}
        {allUploaded && uploadedFiles.some(f => f.status === 'success') && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">تم رفع الملفات بنجاح!</p>
                  <p className="text-sm text-green-800 mt-1">
                    يمكنك الآن عرض الملفات في صفحة الملفات الطبية
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/portal')}
                className="mt-4 w-full bg-green-600 hover:bg-green-700"
              >
                العودة إلى البوابة
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-900 text-sm">
              💡 <strong>ملاحظة:</strong> جميع الملفات المرفوعة محمية وآمنة. يمكن فقط لك والعاملين في العيادة الوصول إليها.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

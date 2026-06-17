'use client';

import { useState } from 'react';
import { Modal, FormInput, FormSelect } from '@/components';

interface Props {
  patientId: string;
  onUploadSuccess: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalFileUpload({ patientId, onUploadSuccess, isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('image');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('description', description);
      formData.append('fileType', fileType);

      const response = await fetch('/api/patients/files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
        onClose();
        setFile(null);
        setDescription('');
      } else {
        alert('فشل رفع الملف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الرفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="رفع ملف طبي جديد">
      <div className="space-y-6" dir="rtl">
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput')?.click()}>
          <input 
            id="fileInput"
            type="file" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="text-blue-600 font-bold">{file.name}</div>
          ) : (
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              اضغط هنا أو اسحب الملف لرفعه
            </div>
          )}
        </div>

        <FormSelect 
          label="نوع الملف"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          options={[
            { label: 'صورة (Image)', value: 'image' },
            { label: 'تقرير PDF', value: 'pdf' },
            { label: 'أشعة (X-Ray)', value: 'x-ray' },
            { label: 'نتائج مخبرية (Lab Result)', value: 'lab-result' },
          ]}
        />

        <FormInput 
          label="وصف الملف"
          placeholder="مثلاً: صورة أشعة للصدر"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'جاري الرفع...' : 'بدء الرفع'}
        </button>
      </div>
    </Modal>
  );
}

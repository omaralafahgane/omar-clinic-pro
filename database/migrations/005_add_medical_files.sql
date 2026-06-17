-- Omar Clinic Pro - Add Medical Files Table
-- Migration: 005_add_medical_files.sql
-- Description: Create table for managing patient medical files (PDF, Images, X-Ray)

CREATE TABLE medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- 'image', 'pdf', 'x-ray', 'lab-result'
  file_url TEXT NOT NULL,
  file_size INT,
  description TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_medical_files_clinic_id ON medical_files(clinic_id);
CREATE INDEX idx_medical_files_patient_id ON medical_files(patient_id);
CREATE INDEX idx_medical_files_file_type ON medical_files(file_type);
CREATE INDEX idx_medical_files_deleted_at ON medical_files(deleted_at);

-- Add comment to the table
COMMENT ON TABLE medical_files IS 'Stores metadata for medical files uploaded to Supabase Storage/S3';

-- Create storage buckets for medical files
-- This file sets up the storage infrastructure for the clinic system

-- ============================================================================
-- MEDICAL FILES BUCKET
-- ============================================================================

-- Create the medical-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'medical-files', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR MEDICAL FILES
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Patients can upload their own files
CREATE POLICY "Patients can upload their own medical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Patients can view their own files
CREATE POLICY "Patients can view their own medical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Clinic staff can view all files in their clinic
CREATE POLICY "Clinic staff can view all medical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.clinic_id = (storage.foldername(name))[2]::uuid
  )
);

-- Policy 4: Clinic staff can delete files
CREATE POLICY "Clinic staff can delete medical files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-files' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.clinic_id = (storage.foldername(name))[2]::uuid
  )
);

-- ============================================================================
-- INVOICES BUCKET (optional, for storing invoice PDFs)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Patients can view their own invoices
CREATE POLICY "Patients can view their own invoice PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Clinic staff can view all invoices
CREATE POLICY "Clinic staff can view all invoice PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.clinic_id = (storage.foldername(name))[2]::uuid
  )
);

-- ============================================================================
-- CLINIC DOCUMENTS BUCKET (for clinic branding, forms, etc.)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-documents', 'clinic-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Only clinic staff can access clinic documents
CREATE POLICY "Clinic staff can access clinic documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'clinic-documents' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.clinic_id = (storage.foldername(name))[1]::uuid
  )
);

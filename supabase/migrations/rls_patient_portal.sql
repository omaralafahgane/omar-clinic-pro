-- Enable RLS on patient-related tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPOINTMENTS RLS POLICIES
-- ============================================================================

-- Patients can view their own appointments
CREATE POLICY "Patients can view their own appointments"
ON appointments FOR SELECT
USING (
  auth.uid() IN (
    SELECT clerk_id FROM patients WHERE id = patient_id
  )
);

-- Doctors can view appointments for their patients
CREATE POLICY "Doctors can view their appointments"
ON appointments FOR SELECT
USING (
  auth.uid() IN (
    SELECT clerk_id FROM doctors WHERE id = doctor_id
  )
);

-- Clinic staff can view all appointments in their clinic
CREATE POLICY "Clinic staff can view clinic appointments"
ON appointments FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM users WHERE id = auth.uid()
  )
);

-- ============================================================================
-- MEDICAL FILES RLS POLICIES
-- ============================================================================

-- Patients can view their own medical files
CREATE POLICY "Patients can view their own files"
ON medical_files FOR SELECT
USING (
  auth.uid() IN (
    SELECT clerk_id FROM patients WHERE id = patient_id
  )
);

-- Doctors can view their patients' files
CREATE POLICY "Doctors can view patient files"
ON medical_files FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patients WHERE clinic_id IN (
      SELECT clinic_id FROM doctors WHERE clerk_id = auth.uid()
    )
  )
);

-- Clinic staff can view all files in their clinic
CREATE POLICY "Clinic staff can view clinic files"
ON medical_files FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM users WHERE id = auth.uid()
  )
);

-- Patients can upload their own files
CREATE POLICY "Patients can upload files"
ON medical_files FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT clerk_id FROM patients WHERE id = patient_id
  )
);

-- ============================================================================
-- INVOICES RLS POLICIES
-- ============================================================================

-- Patients can view their own invoices
CREATE POLICY "Patients can view their own invoices"
ON invoices FOR SELECT
USING (
  auth.uid() IN (
    SELECT clerk_id FROM patients WHERE id = patient_id
  )
);

-- Clinic staff can view all invoices in their clinic
CREATE POLICY "Clinic staff can view clinic invoices"
ON invoices FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM users WHERE id = auth.uid()
  )
);

-- ============================================================================
-- PRESCRIPTIONS RLS POLICIES
-- ============================================================================

-- Patients can view their own prescriptions
CREATE POLICY "Patients can view their own prescriptions"
ON prescriptions FOR SELECT
USING (
  auth.uid() IN (
    SELECT clerk_id FROM patients WHERE id = patient_id
  )
);

-- Doctors can view their patients' prescriptions
CREATE POLICY "Doctors can view patient prescriptions"
ON prescriptions FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patients WHERE clinic_id IN (
      SELECT clinic_id FROM doctors WHERE clerk_id = auth.uid()
    )
  )
);

-- ============================================================================
-- STORAGE POLICIES FOR MEDICAL FILES
-- ============================================================================

-- Patients can upload to their own folder
CREATE POLICY "Patients can upload medical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Patients can view their own files
CREATE POLICY "Patients can view medical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Clinic staff can view all files in their clinic
CREATE POLICY "Clinic staff can view all medical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files'
);

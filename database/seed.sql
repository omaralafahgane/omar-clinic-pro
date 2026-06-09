-- Omar Clinic Pro - Sample Data

-- Insert sample patients
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, city, country) VALUES
('أحمد', 'محمد', 'ahmad.mohammed@example.com', '+966501234567', '1990-01-15', 'M', 'شارع النيل', 'الرياض', 'السعودية'),
('فاطمة', 'علي', 'fatima.ali@example.com', '+966509876543', '1995-05-20', 'F', 'شارع الملك', 'جدة', 'السعودية'),
('محمود', 'حسن', 'mahmoud.hassan@example.com', '+966555555555', '1988-03-10', 'M', 'شارع الأمير', 'الدمام', 'السعودية'),
('نور', 'أحمد', 'noor.ahmed@example.com', '+966555555556', '1992-07-25', 'F', 'شارع الملك فهد', 'الرياض', 'السعودية'),
('سارة', 'محمود', 'sarah.mahmoud@example.com', '+966555555557', '1998-11-30', 'F', 'شارع الملك عبدالعزيز', 'مكة', 'السعودية');

-- Insert sample doctors
INSERT INTO doctors (first_name, last_name, email, phone, specialization, license_number, is_active) VALUES
('محمد', 'حسن', 'dr.hassan@example.com', '+966555555560', 'طب عام', 'LIC001', TRUE),
('سارة', 'أحمد', 'dr.sarah@example.com', '+966555555561', 'طب الأسنان', 'LIC002', TRUE),
('علي', 'محمد', 'dr.ali@example.com', '+966555555562', 'أمراض العيون', 'LIC003', TRUE),
('ليلى', 'حسين', 'dr.layla@example.com', '+966555555563', 'طب الأطفال', 'LIC004', TRUE),
('إبراهيم', 'فارس', 'dr.ibrahim@example.com', '+966555555564', 'الجراحة', 'LIC005', TRUE);

-- Insert sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status, notes) VALUES
(1, 1, '2026-06-10 09:00:00', 'فحص عام', 'scheduled', 'المريض يشكو من صداع متكرر'),
(2, 2, '2026-06-10 10:00:00', 'تنظيف الأسنان', 'scheduled', 'فحص دوري'),
(3, 3, '2026-06-10 11:00:00', 'فحص العيون', 'completed', 'تم وصف نظارة طبية'),
(4, 4, '2026-06-10 14:00:00', 'فحص صحي للطفل', 'scheduled', 'متابعة دورية'),
(5, 1, '2026-06-11 09:30:00', 'فحص متابعة', 'scheduled', 'متابعة الحالة السابقة');

-- Insert sample medical records
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment, prescription, notes) VALUES
(1, 1, 1, 'صداع نصفي', 'راحة وتناول الأدوية', 'أسبرين 500 ملغ مرتين يومياً', 'المريض يحتاج إلى متابعة'),
(2, 2, 2, 'تسوس بسيط', 'حشو الأسنان', 'غسول الفم مرتين يومياً', 'تم حشو السن بنجاح'),
(3, 3, 3, 'قصر النظر', 'نظارة طبية', 'نظارة بقوة -2', 'تم وصف النظارة الطبية');

-- Insert sample invoices
INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, tax_amount, total_amount, status, payment_date, payment_method, notes) VALUES
(1, 1, 'INV-2026-001', 100.00, 15.00, 115.00, 'paid', '2026-06-10 09:30:00', 'cash', 'دفع نقداً'),
(2, 2, 'INV-2026-002', 150.00, 22.50, 172.50, 'paid', '2026-06-10 10:30:00', 'card', 'دفع بالبطاقة'),
(3, 3, 'INV-2026-003', 80.00, 12.00, 92.00, 'paid', '2026-06-10 11:30:00', 'cash', 'دفع نقداً'),
(4, 4, 'INV-2026-004', 120.00, 18.00, 138.00, 'pending', NULL, NULL, 'في انتظار الدفع'),
(5, 5, 'INV-2026-005', 100.00, 15.00, 115.00, 'pending', NULL, NULL, 'في انتظار الدفع');

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) VALUES
('admin', 'admin@omarclnic.com', '$2b$12$...', 'أحمد', 'المدير', 'admin', TRUE),
('receptionist1', 'receptionist@omarclnic.com', '$2b$12$...', 'فاطمة', 'الموظفة', 'receptionist', TRUE),
('nurse1', 'nurse@omarclnic.com', '$2b$12$...', 'سارة', 'الممرضة', 'nurse', TRUE);

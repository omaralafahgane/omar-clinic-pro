-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Clinic staff can view audit logs for their clinic
CREATE POLICY "Clinic staff can view audit logs"
ON audit_logs FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM users WHERE id = auth.uid()
  )
);

-- Only clinic admins can delete audit logs
CREATE POLICY "Only admins can delete audit logs"
ON audit_logs FOR DELETE
USING (
  clinic_id IN (
    SELECT clinic_id FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_audit_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_updated_at_trigger
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION update_audit_logs_updated_at();

-- Create function to log actions
CREATE OR REPLACE FUNCTION log_audit_action(
  p_clinic_id UUID,
  p_user_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    clinic_id,
    user_id,
    action,
    entity_type,
    entity_id,
    changes,
    ip_address,
    user_agent,
    status,
    error_message
  ) VALUES (
    p_clinic_id,
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_changes,
    p_ip_address,
    p_user_agent,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get audit logs for a specific period
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_clinic_id UUID,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  changes JSONB,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.changes,
    al.status,
    al.created_at,
    CONCAT(u.first_name, ' ', u.last_name) as user_name
  FROM audit_logs al
  LEFT JOIN users u ON al.user_id = u.id
  WHERE al.clinic_id = p_clinic_id
  AND al.created_at >= NOW() - INTERVAL '1 day' * p_days
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

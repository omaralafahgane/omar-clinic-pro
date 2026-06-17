import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'DOWNLOAD' | 'LOGIN' | 'LOGOUT' | 'PAYMENT';

export type AuditEntity = 
  | 'PATIENT' | 'APPOINTMENT' | 'INVOICE' | 'FILE' | 'CLINIC' | 'USER' | 'SUBSCRIPTION';

export async function logAction(data: {
  userId: string;
  clinicId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert([
        {
          user_id: data.userId,
          clinic_id: data.clinicId,
          action: data.action,
          entity_type: data.entity,
          entity_id: data.entityId,
          details: data.details || {},
          ip_address: data.ipAddress || 'unknown',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Audit Log Error:', err);
    return { success: false, error: err };
  }
}

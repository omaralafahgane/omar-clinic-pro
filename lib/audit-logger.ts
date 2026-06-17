import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'UPLOAD'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'SEND_NOTIFICATION';

export type AuditEntity =
  | 'patient'
  | 'appointment'
  | 'medical_file'
  | 'invoice'
  | 'prescription'
  | 'user'
  | 'clinic'
  | 'subscription'
  | 'report';

interface AuditLogPayload {
  clinicId: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogResult {
  success: boolean;
  logId?: string;
  error?: string;
}

export class AuditLogger {
  /**
   * Log an action to the audit trail
   */
  static async log(payload: AuditLogPayload): Promise<AuditLogResult> {
    try {
      const { clinicId, userId, action, entityType, entityId, changes, ipAddress, userAgent } = payload;

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          clinic_id: clinicId,
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          changes,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'success'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Audit log error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, logId: data?.id };
    } catch (error: any) {
      console.error('Failed to log audit action:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log a failed action
   */
  static async logError(
    payload: AuditLogPayload,
    errorMessage: string
  ): Promise<AuditLogResult> {
    try {
      const { clinicId, userId, action, entityType, entityId, ipAddress, userAgent } = payload;

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          clinic_id: clinicId,
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'error',
          error_message: errorMessage
        })
        .select('id')
        .single();

      if (error) {
        console.error('Audit log error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, logId: data?.id };
    } catch (error: any) {
      console.error('Failed to log audit error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit logs for a clinic
   */
  static async getLogs(
    clinicId: string,
    options?: {
      days?: number;
      limit?: number;
      offset?: number;
      action?: AuditAction;
      entityType?: AuditEntity;
      userId?: string;
    }
  ) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (options?.days) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - options.days);
        query = query.gte('created_at', daysAgo.toISOString());
      }

      if (options?.action) {
        query = query.eq('action', options.action);
      }

      if (options?.entityType) {
        query = query.eq('entity_type', options.entityType);
      }

      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit log statistics
   */
  static async getStats(clinicId: string, days: number = 30) {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, entity_type, status')
        .eq('clinic_id', clinicId)
        .gte('created_at', daysAgo.toISOString());

      if (error) {
        throw error;
      }

      const stats = {
        totalActions: data?.length || 0,
        byAction: {} as Record<string, number>,
        byEntity: {} as Record<string, number>,
        successCount: 0,
        errorCount: 0
      };

      data?.forEach(log => {
        // Count by action
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

        // Count by entity
        stats.byEntity[log.entity_type] = (stats.byEntity[log.entity_type] || 0) + 1;

        // Count successes and errors
        if (log.status === 'success') {
          stats.successCount++;
        } else if (log.status === 'error') {
          stats.errorCount++;
        }
      });

      return { success: true, stats };
    } catch (error: any) {
      console.error('Failed to fetch audit stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export audit logs as CSV
   */
  static async exportLogs(clinicId: string, days: number = 30): Promise<string> {
    try {
      const result = await this.getLogs(clinicId, { days, limit: 10000 });

      if (!result.success || !result.data) {
        throw new Error('Failed to fetch logs');
      }

      const headers = ['التاريخ', 'المستخدم', 'الإجراء', 'نوع الكيان', 'معرّف الكيان', 'الحالة'];
      const rows = result.data.map(log => [
        new Date(log.created_at).toLocaleString('ar-SA'),
        log.user_id || 'نظام',
        log.action,
        log.entity_type,
        log.entity_id || '-',
        log.status
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csv;
    } catch (error: any) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  }
}

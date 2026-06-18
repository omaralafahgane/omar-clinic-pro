/**
 * Advanced Monitoring and Logging System for Omar Clinic Pro
 * Handles performance tracking, error logging, and operational metrics
 */

import { supabaseAdmin } from './supabase';

// ============================================================================
// METRIC TYPES
// ============================================================================

export enum MetricType {
  API_RESPONSE_TIME = 'api_response_time',
  DB_QUERY_TIME = 'db_query_time',
  JOB_PROCESSING_TIME = 'job_processing_time',
  USER_LOGIN_SUCCESS = 'user_login_success',
  USER_LOGIN_FAILURE = 'user_login_failure',
  ERROR_RATE = 'error_rate',
  ACTIVE_USERS = 'active_users',
  STORAGE_USAGE = 'storage_usage',
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// ============================================================================
// DATABASE SCHEMA MIGRATION
// ============================================================================

/**
 * Create monitoring tables
 */
export const createMonitoringTables = async (): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        -- Metrics table
        CREATE TABLE IF NOT EXISTS system_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
          metric_name VARCHAR(100) NOT NULL,
          metric_value FLOAT NOT NULL,
          unit VARCHAR(20),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_metrics_name ON system_metrics(metric_name);
        CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON system_metrics(created_at);
        CREATE INDEX IF NOT EXISTS idx_metrics_clinic_id ON system_metrics(clinic_id);

        -- Error logs table
        CREATE TABLE IF NOT EXISTS error_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          error_message TEXT NOT NULL,
          error_stack TEXT,
          error_code VARCHAR(50),
          log_level VARCHAR(20) DEFAULT 'error',
          context JSONB DEFAULT '{}',
          url TEXT,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_errors_level ON error_logs(log_level);
        CREATE INDEX IF NOT EXISTS idx_errors_created_at ON error_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_errors_clinic_id ON error_logs(clinic_id);
      `,
    });

    if (error) throw error;
    console.log('✅ Monitoring tables created');
  } catch (error) {
    console.error('Error creating monitoring tables:', error);
  }
};

// ============================================================================
// MONITORING SERVICE
// ============================================================================

export const monitoringService = {
  /**
   * Record a system metric
   */
  recordMetric: async (
    name: MetricType | string,
    value: number,
    unit?: string,
    clinicId?: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      const { error } = await supabaseAdmin.from('system_metrics').insert({
        clinic_id: clinicId,
        metric_name: name,
        metric_value: value,
        unit,
        metadata: metadata || {},
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  },

  /**
   * Log an error
   */
  logError: async (
    error: Error | string,
    context?: Record<string, any>,
    level: LogLevel = LogLevel.ERROR,
    clinicId?: string,
    userId?: string
  ): Promise<void> => {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorStack = typeof error === 'string' ? null : error.stack;

      const { error: logError } = await supabaseAdmin.from('error_logs').insert({
        clinic_id: clinicId,
        user_id: userId,
        error_message: errorMessage,
        error_stack: errorStack,
        log_level: level,
        context: context || {},
        url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      if (logError) throw logError;

      // If critical, trigger alert
      if (level === LogLevel.CRITICAL) {
        await monitoringService.triggerAlert(`CRITICAL ERROR: ${errorMessage}`, context);
      }
    } catch (err) {
      console.error('Error logging to database:', err);
    }
  },

  /**
   * Trigger an alert (e.g., via email, Slack, PagerDuty)
   */
  triggerAlert: async (message: string, context?: any): Promise<void> => {
    try {
      console.error(`🚨 ALERT TRIGGERED: ${message}`, context);
      // TODO: Integrate with Slack/Discord webhooks or PagerDuty
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  },

  /**
   * Middleware to track API performance
   */
  trackApiPerformance: async (
    apiName: string,
    fn: () => Promise<any>,
    clinicId?: string
  ): Promise<any> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      await monitoringService.recordMetric(MetricType.API_RESPONSE_TIME, duration, 'ms', clinicId, {
        api_name: apiName,
        status: 'success',
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      await monitoringService.recordMetric(MetricType.API_RESPONSE_TIME, duration, 'ms', clinicId, {
        api_name: apiName,
        status: 'error',
      });
      await monitoringService.logError(error as Error, { api_name: apiName }, LogLevel.ERROR, clinicId);
      throw error;
    }
  },

  /**
   * Get health status of the system
   */
  getSystemHealth: async (): Promise<any> => {
    try {
      const { data: errorCount, error: err1 } = await supabaseAdmin
        .from('error_logs')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

      if (err1) throw err1;

      return {
        status: errorCount.length > 50 ? 'degraded' : 'healthy',
        errors_last_hour: errorCount.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return { status: 'unknown', error: (error as Error).message };
    }
  },
};

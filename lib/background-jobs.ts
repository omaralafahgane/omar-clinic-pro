/**
 * Background Jobs Queue System for Omar Clinic Pro
 * Handles asynchronous task processing with retries and monitoring
 */

import { supabase, supabaseAdmin } from './supabase';
import { consentService } from './consent-management';

// ============================================================================
// JOB TYPES & CONSTANTS
// ============================================================================

export enum JobType {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  SEND_WHATSAPP = 'send_whatsapp',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  GENERATE_REPORT = 'generate_report',
  EXPORT_DATA = 'export_data',
  CLEANUP_LOGS = 'cleanup_logs',
  BACKUP_DATABASE = 'backup_database',
  SYNC_EXTERNAL_API = 'sync_external_api',
  PROCESS_PAYMENT = 'process_payment',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
}

export interface JobPayload {
  type: JobType;
  clinicId: string;
  userId?: string;
  data: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  retryCount?: number;
  maxRetries?: number;
  delayMs?: number;
}

// ============================================================================
// DATABASE SCHEMA MIGRATION
// ============================================================================

/**
 * Create background jobs tables
 * Run this during database initialization
 */
export const createJobsTables = async (): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS background_jobs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          job_type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying', 'cancelled')),
          payload JSONB NOT NULL,
          result JSONB,
          error_message TEXT,
          retry_count INT DEFAULT 0,
          max_retries INT DEFAULT 3,
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          scheduled_for TIMESTAMP WITH TIME ZONE,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          next_retry_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_jobs_clinic_id ON background_jobs(clinic_id);
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON background_jobs(status);
        CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON background_jobs(job_type);
        CREATE INDEX IF NOT EXISTS idx_jobs_priority ON background_jobs(priority);
        CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_for ON background_jobs(scheduled_for);
        CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON background_jobs(created_at);
        CREATE INDEX IF NOT EXISTS idx_jobs_status_priority ON background_jobs(status, priority, scheduled_for);

        -- Create job execution log table
        CREATE TABLE IF NOT EXISTS job_execution_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          job_id UUID NOT NULL REFERENCES background_jobs(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          message TEXT,
          duration_ms INT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_job_log_job_id ON job_execution_log(job_id);
        CREATE INDEX IF NOT EXISTS idx_job_log_created_at ON job_execution_log(created_at);
      `,
    });

    if (error) throw error;
    console.log('✅ Background jobs tables created');
  } catch (error) {
    console.error('Error creating jobs tables:', error);
    throw error;
  }
};

// ============================================================================
// JOB QUEUE SERVICE
// ============================================================================

export const jobQueueService = {
  /**
   * Enqueue a new job
   */
  enqueue: async (job: JobPayload): Promise<string> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('background_jobs')
        .insert({
          clinic_id: job.clinicId,
          user_id: job.userId,
          job_type: job.type,
          payload: job.data,
          priority: job.priority || 'medium',
          max_retries: job.maxRetries || 3,
          scheduled_for: job.delayMs
            ? new Date(Date.now() + job.delayMs).toISOString()
            : new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      console.log(`✅ Job enqueued: ${job.type} (ID: ${data.id})`);
      return data.id;
    } catch (error) {
      console.error('Error enqueuing job:', error);
      throw error;
    }
  },

  /**
   * Get next pending job for processing
   */
  getNextJob: async (): Promise<any | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('background_jobs')
        .select('*')
        .in('status', ['pending', 'retrying'])
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data || null;
    } catch (error) {
      console.error('Error fetching next job:', error);
      return null;
    }
  },

  /**
   * Mark job as processing
   */
  markProcessing: async (jobId: string): Promise<void> => {
    try {
      const { error } = await supabaseAdmin
        .from('background_jobs')
        .update({
          status: JobStatus.PROCESSING,
          started_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking job as processing:', error);
    }
  },

  /**
   * Mark job as completed
   */
  markCompleted: async (jobId: string, result?: any): Promise<void> => {
    try {
      const { error } = await supabaseAdmin
        .from('background_jobs')
        .update({
          status: JobStatus.COMPLETED,
          completed_at: new Date().toISOString(),
          result: result || {},
        })
        .eq('id', jobId);

      if (error) throw error;

      await jobQueueService.logExecution(jobId, JobStatus.COMPLETED, 'Job completed successfully');
    } catch (error) {
      console.error('Error marking job as completed:', error);
    }
  },

  /**
   * Mark job as failed and schedule retry
   */
  markFailed: async (jobId: string, errorMessage: string): Promise<void> => {
    try {
      // Get current job
      const { data: job, error: fetchError } = await supabaseAdmin
        .from('background_jobs')
        .select('retry_count, max_retries')
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;

      const retryCount = (job.retry_count || 0) + 1;
      const shouldRetry = retryCount < (job.max_retries || 3);

      if (shouldRetry) {
        // Schedule retry with exponential backoff
        const delayMs = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s, etc.
        const nextRetryAt = new Date(Date.now() + delayMs).toISOString();

        const { error } = await supabaseAdmin
          .from('background_jobs')
          .update({
            status: JobStatus.RETRYING,
            retry_count: retryCount,
            error_message: errorMessage,
            next_retry_at: nextRetryAt,
          })
          .eq('id', jobId);

        if (error) throw error;
        console.log(`🔄 Job ${jobId} scheduled for retry (attempt ${retryCount}/${job.max_retries})`);
      } else {
        // Max retries exceeded
        const { error } = await supabaseAdmin
          .from('background_jobs')
          .update({
            status: JobStatus.FAILED,
            retry_count: retryCount,
            error_message: errorMessage,
          })
          .eq('id', jobId);

        if (error) throw error;
        console.error(`❌ Job ${jobId} failed after ${retryCount} retries`);
      }

      await jobQueueService.logExecution(jobId, JobStatus.FAILED, errorMessage);
    } catch (error) {
      console.error('Error marking job as failed:', error);
    }
  },

  /**
   * Log job execution
   */
  logExecution: async (jobId: string, status: JobStatus, message: string): Promise<void> => {
    try {
      const { error } = await supabaseAdmin.from('job_execution_log').insert({
        job_id: jobId,
        status,
        message,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging job execution:', error);
    }
  },

  /**
   * Get job status
   */
  getJobStatus: async (jobId: string): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('background_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching job status:', error);
      return null;
    }
  },

  /**
   * Cancel a job
   */
  cancelJob: async (jobId: string): Promise<void> => {
    try {
      const { error } = await supabaseAdmin
        .from('background_jobs')
        .update({ status: JobStatus.CANCELLED })
        .eq('id', jobId);

      if (error) throw error;
      console.log(`✅ Job ${jobId} cancelled`);
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  },

  /**
   * Get job history
   */
  getJobHistory: async (
    clinicId: string,
    jobType?: JobType,
    limit: number = 50
  ): Promise<any[]> => {
    try {
      let query = supabase
        .from('background_jobs')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job history:', error);
      return [];
    }
  },

  /**
   * Get job statistics
   */
  getJobStats: async (clinicId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.rpc('get_job_statistics', {
        clinic_id: clinicId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching job stats:', error);
      return null;
    }
  },
};

// ============================================================================
// JOB PROCESSORS
// ============================================================================

export const jobProcessors = {
  /**
   * Process send email job
   */
  processSendEmail: async (job: any): Promise<void> => {
    try {
      const { to, subject, template, data } = job.payload;

      // Check consent before sending
      const hasConsent = await consentService.canReceiveCommunication(
        job.clinic_id,
        job.user_id,
        'email'
      );

      if (!hasConsent) {
        throw new Error('User has not consented to email communications');
      }

      // TODO: Integrate with Resend or email service
      console.log(`📧 Sending email to ${to}: ${subject}`);

      await jobQueueService.markCompleted(job.id, { sent_at: new Date().toISOString() });
    } catch (error) {
      await jobQueueService.markFailed(job.id, (error as Error).message);
      throw error;
    }
  },

  /**
   * Process send SMS job
   */
  processSendSMS: async (job: any): Promise<void> => {
    try {
      const { phone, message } = job.payload;

      // Check consent before sending
      const hasConsent = await consentService.canReceiveCommunication(
        job.clinic_id,
        job.user_id,
        'sms'
      );

      if (!hasConsent) {
        throw new Error('User has not consented to SMS communications');
      }

      // TODO: Integrate with Twilio or SMS service
      console.log(`📱 Sending SMS to ${phone}: ${message}`);

      await jobQueueService.markCompleted(job.id, { sent_at: new Date().toISOString() });
    } catch (error) {
      await jobQueueService.markFailed(job.id, (error as Error).message);
      throw error;
    }
  },

  /**
   * Process appointment reminder job
   */
  processAppointmentReminder: async (job: any): Promise<void> => {
    try {
      const { appointmentId } = job.payload;

      // Fetch appointment details
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('*, patients(*), doctors(*)')
        .eq('id', appointmentId)
        .single();

      if (error) throw error;

      // Check consent
      const hasConsent = await consentService.hasConsent(
        job.clinic_id,
        appointment.patient_id,
        'appointment_reminders'
      );

      if (!hasConsent) {
        console.log(`⏭️  Skipping reminder for patient ${appointment.patient_id} - no consent`);
        await jobQueueService.markCompleted(job.id);
        return;
      }

      // TODO: Send reminder via email/SMS
      console.log(`🔔 Sending appointment reminder for appointment ${appointmentId}`);

      // Mark reminder as sent in appointments table
      await supabaseAdmin
        .from('appointments')
        .update({
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      await jobQueueService.markCompleted(job.id);
    } catch (error) {
      await jobQueueService.markFailed(job.id, (error as Error).message);
      throw error;
    }
  },

  /**
   * Process generate report job
   */
  processGenerateReport: async (job: any): Promise<void> => {
    try {
      const { reportType, dateRange } = job.payload;

      // TODO: Generate report based on type
      console.log(`📊 Generating ${reportType} report for ${dateRange}`);

      await jobQueueService.markCompleted(job.id, {
        report_url: '/reports/generated-report.pdf',
      });
    } catch (error) {
      await jobQueueService.markFailed(job.id, (error as Error).message);
      throw error;
    }
  },

  /**
   * Process cleanup logs job
   */
  processCleanupLogs: async (job: any): Promise<void> => {
    try {
      const { daysToKeep = 90 } = job.payload;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabaseAdmin
        .from('activity_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      console.log(`🧹 Cleaned up logs older than ${daysToKeep} days`);
      await jobQueueService.markCompleted(job.id);
    } catch (error) {
      await jobQueueService.markFailed(job.id, (error as Error).message);
      throw error;
    }
  },
};

// ============================================================================
// JOB PROCESSOR WORKER
// ============================================================================

/**
 * Main job processor worker
 * Should be run periodically (e.g., every 10 seconds) via a cron job or scheduler
 */
export const processJobs = async (): Promise<void> => {
  try {
    let processedCount = 0;

    while (true) {
      const job = await jobQueueService.getNextJob();
      if (!job) break;

      try {
        await jobQueueService.markProcessing(job.id);

        // Route to appropriate processor
        switch (job.job_type) {
          case JobType.SEND_EMAIL:
            await jobProcessors.processSendEmail(job);
            break;
          case JobType.SEND_SMS:
            await jobProcessors.processSendSMS(job);
            break;
          case JobType.APPOINTMENT_REMINDER:
            await jobProcessors.processAppointmentReminder(job);
            break;
          case JobType.GENERATE_REPORT:
            await jobProcessors.processGenerateReport(job);
            break;
          case JobType.CLEANUP_LOGS:
            await jobProcessors.processCleanupLogs(job);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }

        processedCount++;
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        // Error already logged by processor
      }
    }

    if (processedCount > 0) {
      console.log(`✅ Processed ${processedCount} jobs`);
    }
  } catch (error) {
    console.error('Error in job processor:', error);
  }
};

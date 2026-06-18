/**
 * Consent Management Module for Omar Clinic Pro
 * Handles user consent tracking for GDPR/CCPA compliance
 * Tracks consent for email, SMS, marketing, data processing, etc.
 */

import { supabase, supabaseAdmin } from './supabase';
import { logEncryptionOperation } from './encryption';

// ============================================================================
// CONSENT TYPES & CONSTANTS
// ============================================================================

export enum ConsentType {
  EMAIL_MARKETING = 'email_marketing',
  SMS_MARKETING = 'sms_marketing',
  APPOINTMENT_REMINDERS = 'appointment_reminders',
  HEALTH_UPDATES = 'health_updates',
  NEWSLETTER = 'newsletter',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  DATA_PROCESSING = 'data_processing',
  ANALYTICS = 'analytics',
  COOKIES = 'cookies',
}

export enum ConsentStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

// ============================================================================
// DATABASE SCHEMA MIGRATION
// ============================================================================

/**
 * Create consent management tables
 * Run this during database initialization
 */
export const createConsentTables = async (): Promise<void> => {
  try {
    // Create consent_types table
    const { error: error1 } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS consent_types (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          category VARCHAR(50) NOT NULL, -- 'marketing', 'essential', 'analytics', 'third_party'
          is_mandatory BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_consent_types_name ON consent_types(name);
        CREATE INDEX IF NOT EXISTS idx_consent_types_category ON consent_types(category);
      `,
    });

    if (error1) throw error1;

    // Create user_consents table
    const { error: error2 } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_consents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          consent_type_id UUID NOT NULL REFERENCES consent_types(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
          accepted_at TIMESTAMP WITH TIME ZONE,
          rejected_at TIMESTAMP WITH TIME ZONE,
          withdrawn_at TIMESTAMP WITH TIME ZONE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(clinic_id, user_id, consent_type_id)
        );

        CREATE INDEX IF NOT EXISTS idx_user_consents_clinic_id ON user_consents(clinic_id);
        CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_consents_status ON user_consents(status);
        CREATE INDEX IF NOT EXISTS idx_user_consents_created_at ON user_consents(created_at);
        CREATE INDEX IF NOT EXISTS idx_user_consents_clinic_user ON user_consents(clinic_id, user_id);
      `,
    });

    if (error2) throw error2;

    // Create consent_audit_log table
    const { error: error3 } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS consent_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          action VARCHAR(50) NOT NULL, -- 'accepted', 'rejected', 'withdrawn', 'requested'
          consent_type_id UUID REFERENCES consent_types(id) ON DELETE SET NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_consent_audit_clinic_id ON consent_audit_log(clinic_id);
        CREATE INDEX IF NOT EXISTS idx_consent_audit_user_id ON consent_audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_consent_audit_action ON consent_audit_log(action);
        CREATE INDEX IF NOT EXISTS idx_consent_audit_created_at ON consent_audit_log(created_at);
      `,
    });

    if (error3) throw error3;

    console.log('✅ Consent management tables created');
  } catch (error) {
    console.error('Error creating consent tables:', error);
    throw error;
  }
};

// ============================================================================
// CONSENT SERVICE
// ============================================================================

export const consentService = {
  /**
   * Initialize default consent types
   */
  initializeConsentTypes: async (): Promise<void> => {
    try {
      const defaultConsents = [
        {
          name: ConsentType.EMAIL_MARKETING,
          description: 'Receive marketing emails about clinic services',
          category: 'marketing',
          is_mandatory: false,
        },
        {
          name: ConsentType.SMS_MARKETING,
          description: 'Receive SMS marketing messages',
          category: 'marketing',
          is_mandatory: false,
        },
        {
          name: ConsentType.APPOINTMENT_REMINDERS,
          description: 'Receive appointment reminders via email and SMS',
          category: 'essential',
          is_mandatory: true,
        },
        {
          name: ConsentType.HEALTH_UPDATES,
          description: 'Receive health updates and medical information',
          category: 'essential',
          is_mandatory: true,
        },
        {
          name: ConsentType.NEWSLETTER,
          description: 'Receive clinic newsletter',
          category: 'marketing',
          is_mandatory: false,
        },
        {
          name: ConsentType.THIRD_PARTY_SHARING,
          description: 'Allow sharing data with third-party healthcare providers',
          category: 'third_party',
          is_mandatory: false,
        },
        {
          name: ConsentType.DATA_PROCESSING,
          description: 'Allow processing of personal data for clinic operations',
          category: 'essential',
          is_mandatory: true,
        },
        {
          name: ConsentType.ANALYTICS,
          description: 'Allow analytics tracking for service improvement',
          category: 'analytics',
          is_mandatory: false,
        },
        {
          name: ConsentType.COOKIES,
          description: 'Allow non-essential cookies',
          category: 'analytics',
          is_mandatory: false,
        },
      ];

      for (const consent of defaultConsents) {
        const { error } = await supabaseAdmin.from('consent_types').upsert(
          {
            name: consent.name,
            description: consent.description,
            category: consent.category,
            is_mandatory: consent.is_mandatory,
          },
          { onConflict: 'name' }
        );

        if (error) throw error;
      }

      console.log('✅ Default consent types initialized');
    } catch (error) {
      console.error('Error initializing consent types:', error);
    }
  },

  /**
   * Get user's current consent status
   */
  getUserConsents: async (
    clinicId: string,
    userId: string
  ): Promise<Record<string, ConsentStatus>> => {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('consent_type_id, status, consent_types(name)')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId);

      if (error) throw error;

      const consents: Record<string, ConsentStatus> = {};
      data?.forEach((record: any) => {
        const consentType = record.consent_types?.name || record.consent_type_id;
        consents[consentType] = record.status;
      });

      return consents;
    } catch (error) {
      console.error('Error fetching user consents:', error);
      return {};
    }
  },

  /**
   * Check if user has given consent for a specific type
   */
  hasConsent: async (
    clinicId: string,
    userId: string,
    consentType: ConsentType
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('status')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .eq('consent_types.name', consentType)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

      return data?.status === ConsentStatus.ACCEPTED;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  },

  /**
   * Update user consent
   */
  updateConsent: async (
    clinicId: string,
    userId: string,
    consentType: ConsentType,
    status: ConsentStatus,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> => {
    try {
      // Get consent type ID
      const { data: consentTypeData, error: typeError } = await supabaseAdmin
        .from('consent_types')
        .select('id')
        .eq('name', consentType)
        .single();

      if (typeError) throw typeError;

      // Update or insert consent
      const consentData = {
        clinic_id: clinicId,
        user_id: userId,
        consent_type_id: consentTypeData.id,
        status,
        accepted_at: status === ConsentStatus.ACCEPTED ? new Date().toISOString() : null,
        rejected_at: status === ConsentStatus.REJECTED ? new Date().toISOString() : null,
        withdrawn_at: status === ConsentStatus.WITHDRAWN ? new Date().toISOString() : null,
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      const { error } = await supabaseAdmin.from('user_consents').upsert(consentData, {
        onConflict: 'clinic_id,user_id,consent_type_id',
      });

      if (error) throw error;

      // Log to audit trail
      await consentService.logConsentAction(
        clinicId,
        userId,
        status.toLowerCase(),
        consentType,
        ipAddress,
        userAgent
      );
    } catch (error) {
      console.error('Error updating consent:', error);
      throw error;
    }
  },

  /**
   * Log consent action for audit trail
   */
  logConsentAction: async (
    clinicId: string,
    userId: string,
    action: string,
    consentType: ConsentType,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> => {
    try {
      const { error } = await supabaseAdmin.from('consent_audit_log').insert({
        clinic_id: clinicId,
        user_id: userId,
        action,
        consent_type_id: (
          await supabaseAdmin
            .from('consent_types')
            .select('id')
            .eq('name', consentType)
            .single()
        ).data?.id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging consent action:', error);
    }
  },

  /**
   * Get consent history for a user
   */
  getConsentHistory: async (
    clinicId: string,
    userId: string,
    limit: number = 50
  ): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('consent_audit_log')
        .select('*, consent_types(name)')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consent history:', error);
      return [];
    }
  },

  /**
   * Withdraw all consents for a user (GDPR right to be forgotten)
   */
  withdrawAllConsents: async (
    clinicId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> => {
    try {
      const { error } = await supabaseAdmin
        .from('user_consents')
        .update({
          status: ConsentStatus.WITHDRAWN,
          withdrawn_at: new Date().toISOString(),
        })
        .eq('clinic_id', clinicId)
        .eq('user_id', userId);

      if (error) throw error;

      // Log the action
      await consentService.logConsentAction(
        clinicId,
        userId,
        'withdrawn_all',
        ConsentType.DATA_PROCESSING,
        ipAddress,
        userAgent
      );

      console.log(`✅ All consents withdrawn for user ${userId}`);
    } catch (error) {
      console.error('Error withdrawing all consents:', error);
      throw error;
    }
  },

  /**
   * Export user's consent data (GDPR data portability)
   */
  exportConsentData: async (clinicId: string, userId: string): Promise<any> => {
    try {
      const [consents, history] = await Promise.all([
        consentService.getUserConsents(clinicId, userId),
        consentService.getConsentHistory(clinicId, userId, 1000),
      ]);

      return {
        exported_at: new Date().toISOString(),
        current_consents: consents,
        consent_history: history,
      };
    } catch (error) {
      console.error('Error exporting consent data:', error);
      throw error;
    }
  },

  /**
   * Check if user can receive a specific type of communication
   */
  canReceiveCommunication: async (
    clinicId: string,
    userId: string,
    communicationType: 'email' | 'sms' | 'marketing' | 'health_updates'
  ): Promise<boolean> => {
    try {
      const consentMap: Record<string, ConsentType> = {
        email: ConsentType.EMAIL_MARKETING,
        sms: ConsentType.SMS_MARKETING,
        marketing: ConsentType.EMAIL_MARKETING,
        health_updates: ConsentType.HEALTH_UPDATES,
      };

      const consentType = consentMap[communicationType];
      if (!consentType) return false;

      return await consentService.hasConsent(clinicId, userId, consentType);
    } catch (error) {
      console.error('Error checking communication consent:', error);
      return false;
    }
  },

  /**
   * Get compliance report for a clinic
   */
  getComplianceReport: async (clinicId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.rpc('get_consent_compliance_report', {
        clinic_id: clinicId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return null;
    }
  },
};

// ============================================================================
// MIDDLEWARE FOR CONSENT CHECKING
// ============================================================================

/**
 * Middleware to check consent before sending communications
 */
export const consentCheckMiddleware = async (
  clinicId: string,
  userId: string,
  communicationType: 'email' | 'sms' | 'marketing' | 'health_updates'
): Promise<boolean> => {
  try {
    const canReceive = await consentService.canReceiveCommunication(
      clinicId,
      userId,
      communicationType
    );

    if (!canReceive) {
      console.warn(
        `User ${userId} has not consented to ${communicationType} communications`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in consent check middleware:', error);
    // Fail open - if we can't check consent, don't send
    return false;
  }
};

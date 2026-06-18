/**
 * Encryption Module for Omar Clinic Pro
 * Handles encryption/decryption of sensitive data fields
 * Supports both database-level (pgcrypto) and application-level encryption
 */

import crypto from 'crypto';
import { supabase, supabaseAdmin } from './supabase';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_ENCODING = 'hex';

// Sensitive fields that should be encrypted in the database
export const SENSITIVE_FIELDS = {
  patients: ['medical_history', 'allergies', 'current_medications', 'insurance_policy_number'],
  doctors: ['bio', 'qualification'],
  users: ['phone'],
  appointments: ['notes'],
  treatments: ['diagnosis', 'treatment_plan', 'follow_up_notes'],
  prescriptions: ['diagnosis', 'instructions', 'notes'],
};

// ============================================================================
// APPLICATION-LEVEL ENCRYPTION (for extra security)
// ============================================================================

export const encryptionService = {
  /**
   * Encrypt a string using AES-256-GCM
   * Returns encrypted data with IV and auth tag
   */
  encrypt: (plaintext: string): string => {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
        iv
      );

      let encrypted = cipher.update(plaintext, 'utf8', ENCRYPTION_ENCODING);
      encrypted += cipher.final(ENCRYPTION_ENCODING);

      const authTag = cipher.getAuthTag();
      const combined = iv.toString(ENCRYPTION_ENCODING) + ':' + authTag.toString(ENCRYPTION_ENCODING) + ':' + encrypted;

      return combined;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  },

  /**
   * Decrypt a string encrypted with encrypt()
   */
  decrypt: (encrypted: string): string => {
    try {
      const parts = encrypted.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], ENCRYPTION_ENCODING);
      const authTag = Buffer.from(parts[1], ENCRYPTION_ENCODING);
      const encryptedData = parts[2];

      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
        iv
      );

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, ENCRYPTION_ENCODING, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  },

  /**
   * Hash a string (for one-way encryption like passwords)
   */
  hash: (plaintext: string): string => {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
  },

  /**
   * Generate a random encryption key
   */
  generateKey: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },
};

// ============================================================================
// DATABASE-LEVEL ENCRYPTION (using pgcrypto)
// ============================================================================

/**
 * Enable pgcrypto extension in Supabase
 * Run this once during database initialization
 */
export const enablePgcrypto = async (): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.rpc('enable_pgcrypto', {});
    if (error) throw error;
    console.log('✅ pgcrypto extension enabled');
  } catch (error) {
    console.error('Error enabling pgcrypto:', error);
  }
};

/**
 * Encrypt sensitive data at the database level using pgcrypto
 * This is called via Supabase RPC function
 */
export const encryptFieldInDatabase = async (
  tableName: string,
  fieldName: string,
  encryptionPassword: string
): Promise<void> => {
  try {
    const query = `
      UPDATE ${tableName}
      SET ${fieldName} = pgp_sym_encrypt(${fieldName}, '${encryptionPassword}')
      WHERE ${fieldName} IS NOT NULL
    `;

    const { error } = await supabaseAdmin.rpc('execute_sql', { sql: query });
    if (error) throw error;
    console.log(`✅ Encrypted ${fieldName} in ${tableName}`);
  } catch (error) {
    console.error(`Error encrypting ${fieldName}:`, error);
  }
};

/**
 * Decrypt sensitive data at the database level using pgcrypto
 */
export const decryptFieldInDatabase = async (
  tableName: string,
  fieldName: string,
  encryptionPassword: string
): Promise<void> => {
  try {
    const query = `
      UPDATE ${tableName}
      SET ${fieldName} = pgp_sym_decrypt(${fieldName}, '${encryptionPassword}')
      WHERE ${fieldName} IS NOT NULL
    `;

    const { error } = await supabaseAdmin.rpc('execute_sql', { sql: query });
    if (error) throw error;
    console.log(`✅ Decrypted ${fieldName} in ${tableName}`);
  } catch (error) {
    console.error(`Error decrypting ${fieldName}:`, error);
  }
};

// ============================================================================
// FIELD-LEVEL ENCRYPTION HELPERS
// ============================================================================

/**
 * Encrypt an object's sensitive fields
 */
export const encryptSensitiveFields = (
  data: Record<string, any>,
  tableName: keyof typeof SENSITIVE_FIELDS
): Record<string, any> => {
  const encrypted = { ...data };
  const fieldsToEncrypt = SENSITIVE_FIELDS[tableName] || [];

  fieldsToEncrypt.forEach((field) => {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptionService.encrypt(encrypted[field]);
    }
  });

  return encrypted;
};

/**
 * Decrypt an object's sensitive fields
 */
export const decryptSensitiveFields = (
  data: Record<string, any>,
  tableName: keyof typeof SENSITIVE_FIELDS
): Record<string, any> => {
  const decrypted = { ...data };
  const fieldsToDecrypt = SENSITIVE_FIELDS[tableName] || [];

  fieldsToDecrypt.forEach((field) => {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = encryptionService.decrypt(decrypted[field]);
      } catch (error) {
        console.warn(`Could not decrypt ${field}:`, error);
        // Keep encrypted value if decryption fails
      }
    }
  });

  return decrypted;
};

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrate all sensitive fields in a table to encrypted format
 * This should be run as a one-time migration
 */
export const migrateTableToEncryption = async (
  tableName: keyof typeof SENSITIVE_FIELDS
): Promise<void> => {
  try {
    console.log(`🔄 Starting encryption migration for ${tableName}...`);

    const { data, error } = await supabaseAdmin.from(tableName).select('*');

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log(`No records found in ${tableName}`);
      return;
    }

    const fieldsToEncrypt = SENSITIVE_FIELDS[tableName] || [];
    const updates = data.map((record) => {
      const encrypted = { ...record };
      fieldsToEncrypt.forEach((field) => {
        if (encrypted[field] && typeof encrypted[field] === 'string' && !encrypted[field].includes(':')) {
          // Only encrypt if not already encrypted (check for IV:TAG:DATA format)
          encrypted[field] = encryptionService.encrypt(encrypted[field]);
        }
      });
      return encrypted;
    });

    // Batch update in chunks of 100
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      const { error: updateError } = await supabaseAdmin.from(tableName).upsert(batch);

      if (updateError) throw updateError;
      console.log(`✅ Encrypted ${Math.min(i + 100, updates.length)}/${updates.length} records`);
    }

    console.log(`✅ Migration complete for ${tableName}`);
  } catch (error) {
    console.error(`Error migrating ${tableName}:`, error);
    throw error;
  }
};

// ============================================================================
// AUDIT LOGGING FOR ENCRYPTION OPERATIONS
// ============================================================================

/**
 * Log encryption/decryption operations for audit trail
 */
export const logEncryptionOperation = async (
  operation: 'encrypt' | 'decrypt' | 'key_rotation',
  tableName: string,
  fieldName: string,
  userId?: string,
  clinicId?: string
): Promise<void> => {
  try {
    await supabaseAdmin.from('activity_logs').insert({
      action: `ENCRYPTION_${operation.toUpperCase()}`,
      entity_type: tableName,
      entity_id: fieldName,
      user_id: userId,
      clinic_id: clinicId,
      new_values: {
        operation,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging encryption operation:', error);
  }
};

// ============================================================================
// KEY ROTATION
// ============================================================================

/**
 * Rotate encryption key (re-encrypt all data with new key)
 * WARNING: This is a destructive operation and should be done carefully
 */
export const rotateEncryptionKey = async (
  tableName: keyof typeof SENSITIVE_FIELDS,
  newEncryptionKey: string
): Promise<void> => {
  try {
    console.log(`🔄 Starting key rotation for ${tableName}...`);

    // 1. Decrypt all data with old key
    const { data, error } = await supabaseAdmin.from(tableName).select('*');
    if (error) throw error;
    if (!data) return;

    // 2. Re-encrypt with new key
    const fieldsToEncrypt = SENSITIVE_FIELDS[tableName] || [];
    const oldKey = ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = newEncryptionKey;

    const updates = data.map((record) => {
      const updated = { ...record };
      fieldsToEncrypt.forEach((field) => {
        if (updated[field] && typeof updated[field] === 'string') {
          try {
            // Decrypt with old key
            const decrypted = encryptionService.decrypt(updated[field]);
            // Re-encrypt with new key
            updated[field] = encryptionService.encrypt(decrypted);
          } catch (error) {
            console.warn(`Could not rotate key for ${field}:`, error);
          }
        }
      });
      return updated;
    });

    // 3. Update database
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      const { error: updateError } = await supabaseAdmin.from(tableName).upsert(batch);
      if (updateError) throw updateError;
    }

    console.log(`✅ Key rotation complete for ${tableName}`);
  } catch (error) {
    // Restore old key on error
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY;
    console.error(`Error rotating key for ${tableName}:`, error);
    throw error;
  }
};

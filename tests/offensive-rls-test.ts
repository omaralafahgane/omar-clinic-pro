/**
 * Offensive RLS Testing Suite for Omar Clinic Pro
 * Simulates attacks to verify data isolation and security policies
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabase';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ============================================================================
// TEST UTILITIES
// ============================================================================

const createTestClient = (jwt?: string) => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    },
  });
};

// ============================================================================
// OFFENSIVE RLS TESTS
// ============================================================================

export const offensiveRLSTests = {
  /**
   * Test Cross-Clinic Data Access (The most critical test)
   * Scenario: User from Clinic A tries to access data from Clinic B
   */
  testCrossClinicAccess: async (
    userAJwt: string,
    clinicBId: string,
    patientBId: string
  ): Promise<any> => {
    console.log('🧪 Testing Cross-Clinic Data Access...');
    const client = createTestClient(userAJwt);

    const results = {
      patients: false,
      appointments: false,
      invoices: false,
    };

    // 1. Try to read patient from another clinic
    const { data: patientData, error: patientError } = await client
      .from('patients')
      .select('*')
      .eq('id', patientBId)
      .single();

    results.patients = !patientData && !!patientError;
    console.log(`   - Patient access blocked: ${results.patients}`);

    // 2. Try to read appointments from another clinic
    const { data: appointmentData, error: appointmentError } = await client
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicBId);

    results.appointments = (!appointmentData || appointmentData.length === 0);
    console.log(`   - Appointment access blocked: ${results.appointments}`);

    // 3. Try to read invoices from another clinic
    const { data: invoiceData, error: invoiceError } = await client
      .from('invoices')
      .select('*')
      .eq('clinic_id', clinicBId);

    results.invoices = (!invoiceData || invoiceData.length === 0);
    console.log(`   - Invoice access blocked: ${results.invoices}`);

    return results;
  },

  /**
   * Test Unauthorized Write Operations
   * Scenario: User tries to insert/update data in another clinic
   */
  testUnauthorizedWrites: async (
    userAJwt: string,
    clinicBId: string
  ): Promise<any> => {
    console.log('🧪 Testing Unauthorized Write Operations...');
    const client = createTestClient(userAJwt);

    const results = {
      insert: false,
      update: false,
      delete: false,
    };

    // 1. Try to insert patient into another clinic
    const { error: insertError } = await client.from('patients').insert({
      clinic_id: clinicBId,
      first_name: 'Hacker',
      last_name: 'Patient',
      phone: '0000000000',
    });

    results.insert = !!insertError;
    console.log(`   - Unauthorized insert blocked: ${results.insert}`);

    // 2. Try to update another clinic's data
    const { error: updateError } = await client
      .from('clinics')
      .update({ name: 'Hacked Clinic' })
      .eq('id', clinicBId);

    results.update = !!updateError;
    console.log(`   - Unauthorized update blocked: ${results.update}`);

    return results;
  },

  /**
   * Test Role Escalation
   * Scenario: Staff user tries to perform Admin-only operations
   */
  testRoleEscalation: async (staffJwt: string): Promise<any> => {
    console.log('🧪 Testing Role Escalation...');
    const client = createTestClient(staffJwt);

    const results = {
      deleteClinic: false,
      updateRoles: false,
      accessAuditLogs: false,
    };

    // 1. Try to delete a clinic (Admin only)
    const { error: deleteError } = await client
      .from('clinics')
      .delete()
      .eq('id', 'some-id');

    results.deleteClinic = !!deleteError;
    console.log(`   - Admin-only delete blocked: ${results.deleteClinic}`);

    // 2. Try to update own role to admin
    const { error: roleError } = await client
      .from('users')
      .update({ role_id: 'admin-role-id' })
      .eq('id', 'my-id');

    results.updateRoles = !!roleError;
    console.log(`   - Role escalation blocked: ${results.updateRoles}`);

    return results;
  },

  /**
   * Test SQL Injection via RLS
   * Scenario: Try to bypass RLS using malicious filters
   */
  testSQLInjection: async (userJwt: string): Promise<any> => {
    console.log('🧪 Testing SQL Injection via RLS...');
    const client = createTestClient(userJwt);

    // Try to use OR 1=1 in filters
    const { data, error } = await client
      .from('patients')
      .select('*')
      .or('id.eq.00000000-0000-0000-0000-000000000000,id.neq.00000000-0000-0000-0000-000000000000');

    // If data contains patients from other clinics, it's a failure
    // But RLS should still filter by clinic_id automatically
    const isSecure = !data || data.every(p => p.clinic_id === 'my-clinic-id');
    console.log(`   - SQL Injection attempt blocked: ${isSecure}`);

    return isSecure;
  },

  /**
   * Test Unauthenticated Access
   * Scenario: Access data without any JWT
   */
  testUnauthenticatedAccess: async (): Promise<any> => {
    console.log('🧪 Testing Unauthenticated Access...');
    const client = createTestClient();

    const { data, error } = await client.from('patients').select('*');

    const isBlocked = (!data || data.length === 0) && !!error;
    console.log(`   - Unauthenticated access blocked: ${isBlocked}`);

    return isBlocked;
  },
};

/**
 * Run all offensive tests and generate a report
 */
export const runFullSecurityAudit = async (
  userAJwt: string,
  clinicBId: string,
  patientBId: string,
  staffJwt: string
): Promise<void> => {
  console.log('🛡️ Starting Full Security Audit...');

  const report = {
    timestamp: new Date().toISOString(),
    results: {
      crossClinic: await offensiveRLSTests.testCrossClinicAccess(userAJwt, clinicBId, patientBId),
      unauthorizedWrites: await offensiveRLSTests.testUnauthorizedWrites(userAJwt, clinicBId),
      roleEscalation: await offensiveRLSTests.testRoleEscalation(staffJwt),
      sqlInjection: await offensiveRLSTests.testSQLInjection(userAJwt),
      unauthenticated: await offensiveRLSTests.testUnauthenticatedAccess(),
    },
  };

  console.log('📊 Security Audit Report:', JSON.stringify(report, null, 2));

  // Log report to activity_logs for record keeping
  await supabaseAdmin.from('activity_logs').insert({
    action: 'SECURITY_AUDIT_COMPLETED',
    entity_type: 'system',
    new_values: report,
  });
};

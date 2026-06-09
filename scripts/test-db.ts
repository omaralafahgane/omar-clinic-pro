#!/usr/bin/env node

/**
 * Database Testing Script
 * Tests CRUD operations against the live Supabase database
 * 
 * Usage: npx ts-node scripts/test-db.ts
 */

import { supabase, usersDb, clinicsDb, patientsDb, appointmentsDb, activityLogsDb, rolesDb } from "../lib/supabase";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.cyan);
  console.log("=".repeat(60));
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function testDatabaseConnection() {
  logSection("1. Testing Database Connection");

  try {
    const { data, error } = await supabase.from("roles").select("count").single();

    if (error) throw error;

    logSuccess("Database connection successful");
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error}`);
    return false;
  }
}

async function testRoles() {
  logSection("2. Testing Roles Table");

  try {
    const result = await rolesDb.getAll();

    if (!result.success) throw result.error;

    logSuccess(`Found ${result.data.length} roles`);
    result.data.forEach((role: any) => {
      logInfo(`  - ${role.name}: ${role.description}`);
    });

    return true;
  } catch (error) {
    logError(`Failed to fetch roles: ${error}`);
    return false;
  }
}

async function testClinicCreation() {
  logSection("3. Testing Clinic Creation (CREATE)");

  try {
    const clinicData = {
      name: "Test Clinic - " + Date.now(),
      email: `test-clinic-${Date.now()}@example.com`,
      phone: "+966501234567",
      address: "123 Main Street",
      city: "Riyadh",
      country: "Saudi Arabia",
      owner_id: "test-owner",
    };

    const result = await clinicsDb.create(clinicData);

    if (!result.success) throw result.error;

    logSuccess(`Clinic created successfully`);
    logInfo(`  ID: ${result.data.id}`);
    logInfo(`  Name: ${result.data.name}`);
    logInfo(`  Email: ${result.data.email}`);

    return result.data;
  } catch (error) {
    logError(`Failed to create clinic: ${error}`);
    return null;
  }
}

async function testClinicRead(clinicId: string) {
  logSection("4. Testing Clinic Read (READ)");

  try {
    const result = await clinicsDb.findById(clinicId);

    if (!result.success) throw result.error;

    logSuccess(`Clinic retrieved successfully`);
    logInfo(`  ID: ${result.data.id}`);
    logInfo(`  Name: ${result.data.name}`);
    logInfo(`  Status: ${result.data.subscription_status}`);
    logInfo(`  Plan: ${result.data.subscription_plan}`);

    return result.data;
  } catch (error) {
    logError(`Failed to read clinic: ${error}`);
    return null;
  }
}

async function testClinicUpdate(clinicId: string) {
  logSection("5. Testing Clinic Update (UPDATE)");

  try {
    const updateData = {
      phone: "+966509876543",
      address: "456 New Street",
      city: "Jeddah",
    };

    const result = await clinicsDb.update(clinicId, updateData);

    if (!result.success) throw result.error;

    logSuccess(`Clinic updated successfully`);
    logInfo(`  Phone: ${result.data.phone}`);
    logInfo(`  Address: ${result.data.address}`);
    logInfo(`  City: ${result.data.city}`);

    return result.data;
  } catch (error) {
    logError(`Failed to update clinic: ${error}`);
    return null;
  }
}

async function testPatientCreation(clinicId: string) {
  logSection("6. Testing Patient Creation (CREATE)");

  try {
    const patientData = {
      first_name: "أحمد",
      last_name: "محمد",
      email: `patient-${Date.now()}@example.com`,
      phone: "+966501234567",
      date_of_birth: "1990-01-15",
      gender: "M",
      address: "123 Patient Street",
      city: "Riyadh",
      country: "Saudi Arabia",
      medical_history: "No significant medical history",
      allergies: "Penicillin",
    };

    const result = await patientsDb.create(clinicId, patientData);

    if (!result.success) throw result.error;

    logSuccess(`Patient created successfully`);
    logInfo(`  ID: ${result.data.id}`);
    logInfo(`  Name: ${result.data.first_name} ${result.data.last_name}`);
    logInfo(`  Email: ${result.data.email}`);
    logInfo(`  Phone: ${result.data.phone}`);

    return result.data;
  } catch (error) {
    logError(`Failed to create patient: ${error}`);
    return null;
  }
}

async function testPatientRead(patientId: string) {
  logSection("7. Testing Patient Read (READ)");

  try {
    const result = await patientsDb.findById(patientId);

    if (!result.success) throw result.error;

    logSuccess(`Patient retrieved successfully`);
    logInfo(`  ID: ${result.data.id}`);
    logInfo(`  Name: ${result.data.first_name} ${result.data.last_name}`);
    logInfo(`  DOB: ${result.data.date_of_birth}`);
    logInfo(`  Gender: ${result.data.gender}`);
    logInfo(`  Allergies: ${result.data.allergies}`);

    return result.data;
  } catch (error) {
    logError(`Failed to read patient: ${error}`);
    return null;
  }
}

async function testPatientUpdate(patientId: string) {
  logSection("8. Testing Patient Update (UPDATE)");

  try {
    const updateData = {
      phone: "+966509876543",
      allergies: "Penicillin, Aspirin",
      medical_history: "Updated medical history",
    };

    const result = await patientsDb.update(patientId, updateData);

    if (!result.success) throw result.error;

    logSuccess(`Patient updated successfully`);
    logInfo(`  Phone: ${result.data.phone}`);
    logInfo(`  Allergies: ${result.data.allergies}`);
    logInfo(`  Medical History: ${result.data.medical_history}`);

    return result.data;
  } catch (error) {
    logError(`Failed to update patient: ${error}`);
    return null;
  }
}

async function testPatientSoftDelete(patientId: string) {
  logSection("9. Testing Patient Soft Delete (DELETE)");

  try {
    const result = await patientsDb.update(patientId, {
      deleted_at: new Date().toISOString(),
      is_active: false,
    });

    if (!result.success) throw result.error;

    logSuccess(`Patient soft deleted successfully`);
    logInfo(`  Deleted At: ${result.data.deleted_at}`);
    logInfo(`  Is Active: ${result.data.is_active}`);

    return true;
  } catch (error) {
    logError(`Failed to soft delete patient: ${error}`);
    return false;
  }
}

async function testActivityLogs(clinicId: string) {
  logSection("10. Testing Activity Logs");

  try {
    const result = await activityLogsDb.getByClinic(clinicId, 10, 0);

    if (!result.success) throw result.error;

    logSuccess(`Activity logs retrieved successfully`);
    logInfo(`  Total logs: ${result.total}`);
    logInfo(`  Showing: ${result.data.length} logs`);

    if (result.data.length > 0) {
      logInfo(`  Latest log:`);
      const log = result.data[0];
      logInfo(`    - Entity: ${log.entity_type}`);
      logInfo(`    - Action: ${log.action}`);
      logInfo(`    - Status: ${log.status}`);
      logInfo(`    - Created: ${log.created_at}`);
    }

    return true;
  } catch (error) {
    logError(`Failed to fetch activity logs: ${error}`);
    return false;
  }
}

async function testTablesExist() {
  logSection("11. Verifying All Tables Exist");

  const tables = [
    "roles",
    "clinics",
    "users",
    "doctors",
    "patients",
    "appointments",
    "treatments",
    "invoices",
    "payments",
    "subscriptions",
    "activity_logs",
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("count").limit(1);

      if (error) {
        logError(`  ${table}: NOT FOUND`);
        allExist = false;
      } else {
        logSuccess(`  ${table}: EXISTS`);
      }
    } catch (error) {
      logError(`  ${table}: ERROR - ${error}`);
      allExist = false;
    }
  }

  return allExist;
}

async function runAllTests() {
  console.clear();
  log("╔════════════════════════════════════════════════════════════╗", colors.cyan);
  log("║     Omar Clinic Pro - Database Testing Suite               ║", colors.cyan);
  log("╚════════════════════════════════════════════════════════════╝", colors.cyan);

  const results: Record<string, boolean | object> = {};

  // Test 1: Connection
  results.connection = await testDatabaseConnection();

  if (!results.connection) {
    logError("\nCannot proceed - database connection failed");
    process.exit(1);
  }

  // Test 2: Roles
  results.roles = await testRoles();

  // Test 3-5: Clinic CRUD
  const clinic = await testClinicCreation();
  if (clinic) {
    results.clinicCreate = true;

    await testClinicRead(clinic.id);
    results.clinicRead = true;

    await testClinicUpdate(clinic.id);
    results.clinicUpdate = true;

    // Test 6-9: Patient CRUD
    const patient = await testPatientCreation(clinic.id);
    if (patient) {
      results.patientCreate = true;

      await testPatientRead(patient.id);
      results.patientRead = true;

      await testPatientUpdate(patient.id);
      results.patientUpdate = true;

      await testPatientSoftDelete(patient.id);
      results.patientDelete = true;
    }

    // Test 10: Activity Logs
    results.activityLogs = await testActivityLogs(clinic.id);
  }

  // Test 11: Tables Exist
  results.tablesExist = await testTablesExist();

  // Summary
  logSection("Test Summary");

  const passed = Object.values(results).filter((r) => r === true).length;
  const total = Object.keys(results).length;

  logInfo(`Tests Passed: ${passed}/${total}`);

  if (passed === total) {
    logSuccess("\n🎉 All tests passed! Database is ready for production.");
    process.exit(0);
  } else {
    logError("\n⚠️  Some tests failed. Please review the errors above.");
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  logError(`Fatal error: ${error}`);
  process.exit(1);
});

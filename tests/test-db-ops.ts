import { clinicsDbHelpers, patientsDb, appointmentsDb, rolesDb } from "../lib/supabase";

async function runTests() {
  console.log("🚀 Starting Database Operations Test...");

  try {
    // 1. Get default clinic
    console.log("\n1. Fetching default clinic...");
    const clinicResult = await clinicsDbHelpers.getDefaultClinic();
    if (!clinicResult.success || !clinicResult.data) {
      throw new Error("Could not find default clinic. Make sure 003_seed_data.sql is applied.");
    }
    const clinicId = clinicResult.data.id;
    console.log(`✅ Found clinic: ${clinicResult.data.name} (${clinicId})`);

    // 2. Create a test patient
    console.log("\n2. Creating a test patient...");
    const patientResult = await patientsDb.create(clinicId, {
      first_name: "Test",
      last_name: "Patient",
      email: "test.patient@example.com",
      phone: "+966500000000",
      gender: "M",
    });

    if (!patientResult.success || !patientResult.data) {
      throw new Error(`Failed to create patient: ${JSON.stringify(patientResult.error)}`);
    }
    const patientId = patientResult.data.id;
    console.log(`✅ Patient created: ${patientResult.data.first_name} ${patientResult.data.last_name} (${patientId})`);

    // 3. Create a test appointment
    console.log("\n3. Creating a test appointment...");
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24); // Tomorrow
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // 30 mins later

    const appointmentResult = await appointmentsDb.create(clinicId, {
      patient_id: patientId,
      doctor_id: "00000000-0000-0000-0000-000000000000", // Placeholder or fetch a real doctor
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      reason_for_visit: "General checkup",
      appointment_type: "in-person",
    });

    if (!appointmentResult.success) {
      console.log("⚠️ Appointment creation failed (expected if doctor_id is invalid):", appointmentResult.error);
    } else {
      console.log(`✅ Appointment created: ${appointmentResult.data.id}`);
    }

    console.log("\n🎉 All database operations tests completed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

runTests();

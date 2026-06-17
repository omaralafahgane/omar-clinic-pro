import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Get the patient record associated with this Clerk User ID
    // Note: In this system, we assume patients are also Clerk users with role 'patient'
    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('clerk_id', userId) // Assuming we added clerk_id to patients table
      .single();

    if (!patient) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });

    // 2. Fetch all related data for this specific patient
    const [appointments, files, invoices] = await Promise.all([
      supabase.from('appointments').select('*, doctor:doctors(first_name, last_name)').eq('patient_id', patient.id).is('deleted_at', null).order('start_time', { ascending: false }),
      supabase.from('medical_files').select('*').eq('patient_id', patient.id).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('patient_id', patient.id).is('deleted_at', null).order('created_at', { ascending: false })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        appointments: appointments.data || [],
        files: files.data || [],
        invoices: invoices.data || [],
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

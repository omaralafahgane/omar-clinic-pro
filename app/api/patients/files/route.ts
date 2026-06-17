import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from "@/lib/api-permissions";
import { PERMISSIONS } from "@/lib/roles";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const GET = requirePermission(PERMISSIONS.PATIENT_READ)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });

    // Get user's clinic_id
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const { data: files, error } = await supabase
      .from('medical_files')
      .select('*')
      .eq('clinic_id', user.clinic_id)
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = requirePermission(PERMISSIONS.PATIENT_CREATE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const patientId = formData.get('patientId') as string;
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const fileType = formData.get('fileType') as string;

    if (!patientId || !file) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    // Get user's clinic_id
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.clinic_id}/${patientId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medical-files')
      .getPublicUrl(filePath);

    // Save metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('medical_files')
      .insert([
        {
          clinic_id: user.clinic_id,
          patient_id: patientId,
          file_name: file.name,
          file_type: fileType || 'other',
          file_url: publicUrl,
          file_size: file.size,
          description: description || '',
          uploaded_by: userId
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, data: fileRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

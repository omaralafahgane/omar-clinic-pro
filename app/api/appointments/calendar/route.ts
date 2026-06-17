import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from "@/lib/api-permissions";
import { PERMISSIONS } from "@/lib/roles";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const GET = requirePermission(PERMISSIONS.APPOINTMENT_READ)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) return NextResponse.json({ error: 'Start and End dates are required' }, { status: 400 });

    // Get user's clinic_id
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        reason_for_visit,
        status,
        patient:patients(first_name, last_name),
        doctor:doctors(first_name, last_name)
      `)
      .eq('clinic_id', user.clinic_id)
      .gte('start_time', start)
      .lte('start_time', end)
      .is('deleted_at', null);

    if (error) throw error;

    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

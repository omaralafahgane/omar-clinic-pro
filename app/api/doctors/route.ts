import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/api-permissions';
import { PERMISSIONS } from '@/lib/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const GET = requirePermission(PERMISSIONS.DOCTORS_READ)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('clinic_id', user.clinic_id)
      .is('deleted_at', null)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = requirePermission(PERMISSIONS.DOCTORS_CREATE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { first_name, last_name, email, phone, specialization, license_number } = body;

    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('doctors')
      .insert([{
        clinic_id: user.clinic_id,
        first_name,
        last_name,
        email,
        phone,
        specialization,
        license_number,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

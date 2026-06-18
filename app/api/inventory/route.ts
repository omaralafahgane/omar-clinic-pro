import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/api-permissions';
import { PERMISSIONS } from '@/lib/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const GET = requirePermission(PERMISSIONS.INVENTORY_READ)(async (request: NextRequest) => {
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
      .from('inventory_items')
      .select('*')
      .eq('clinic_id', user.clinic_id)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = requirePermission(PERMISSIONS.INVENTORY_CREATE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        clinic_id: user.clinic_id,
        ...body,
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

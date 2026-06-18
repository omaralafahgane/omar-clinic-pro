import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { requirePermission } from '@/lib/api-permissions';
import { PERMISSIONS } from '@/lib/roles';



export const PATCH = requirePermission(PERMISSIONS.DOCTORS_UPDATE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const id = request.nextUrl.pathname.split('/').pop();

    const { data, error } = await supabase
      .from('doctors')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = requirePermission(PERMISSIONS.DOCTORS_DELETE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = request.nextUrl.pathname.split('/').pop();

    const { error } = await supabase
      .from('doctors')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

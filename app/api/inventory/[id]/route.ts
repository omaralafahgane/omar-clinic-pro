import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { requirePermission } from '@/lib/api-permissions';
import { PERMISSIONS } from '@/lib/roles';



export const PATCH = requirePermission(PERMISSIONS.INVENTORY_UPDATE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const id = request.nextUrl.pathname.split('/')[4];

    const { data, error } = await supabase
      .from('inventory_items')
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

export const DELETE = requirePermission(PERMISSIONS.INVENTORY_DELETE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = request.nextUrl.pathname.split('/')[4];

    const { error } = await supabase
      .from('inventory_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/api-permissions';
import { PERMISSIONS } from '@/lib/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const POST = requirePermission(PERMISSIONS.INVENTORY_UPDATE)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const id = request.nextUrl.pathname.split('/')[4];
    const { quantity, type, reason } = body;

    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    // 1. Create transaction record
    const { error: transError } = await supabase
      .from('inventory_transactions')
      .insert([{
        clinic_id: user.clinic_id,
        item_id: id,
        transaction_type: type,
        quantity: quantity,
        reason: reason,
        performed_by: userId
      }]);

    if (transError) throw transError;

    // 2. Get current stock level
    const { data: item } = await supabase
      .from('inventory_items')
      .select('current_stock_level')
      .eq('id', id)
      .single();

    // 3. Calculate new stock level
    const currentStock = item?.current_stock_level || 0;
    let newStock = currentStock;
    
    if (type === 'in') {
      newStock = currentStock + quantity;
    } else if (type === 'out') {
      newStock = Math.max(0, currentStock - quantity);
    } else if (type === 'adjustment') {
      newStock = quantity;
    }

    // 4. Update inventory item
    const { data: updatedItem, error: updateError } = await supabase
      .from('inventory_items')
      .update({ 
        current_stock_level: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

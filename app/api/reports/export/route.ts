import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from "@/lib/api-permissions";
import { PERMISSIONS } from "@/lib/roles";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const GET = requirePermission(PERMISSIONS.REPORTS_READ)(async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'patients';
    const format = searchParams.get('format') || 'pdf';

    // Get user's clinic_id from users table
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    const clinicId = user.clinic_id;

    if (type === 'patients') {
      const { data: patients } = await supabase
        .from('patients')
        .select('first_name, last_name, email, phone, created_at')
        .eq('clinic_id', clinicId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (format === 'excel') {
        // Create CSV content (Excel compatible)
        const headers = ['الاسم الأول', 'اسم العائلة', 'البريد الإلكتروني', 'الهاتف', 'تاريخ الإضافة'];
        const rows = patients?.map((p: any) => [
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          new Date(p.created_at).toLocaleDateString('ar-SA')
        ]) || [];

        const csv = "\ufeff" + [headers, ...rows]
          .map(row => row.map(cell => `"${cell || ''}"`).join(','))
          .join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=patients-report-${new Date().toISOString().split('T')[0]}.csv`
          }
        });
      } else {
        // PDF export (simplified text format for this environment)
        const content = `
تقرير المرضى - Omar Clinic Pro
===============================
تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}
إجمالي المرضى: ${patients?.length || 0}

قائمة المرضى:
${patients?.map((p: any, idx: number) => `
${idx + 1}. ${p.first_name} ${p.last_name}
   البريد: ${p.email || 'غير متوفر'}
   الهاتف: ${p.phone}
   تاريخ الانضمام: ${new Date(p.created_at).toLocaleDateString('ar-SA')}
`).join('\n')}
        `;

        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename=patients-report-${new Date().toISOString().split('T')[0]}.txt`
          }
        });
      }
    } else if (type === 'financial') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_number, total_amount, paid_amount, balance_due, status, created_at')
        .eq('clinic_id', clinicId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (format === 'excel') {
        const headers = ['رقم الفاتورة', 'المبلغ الإجمالي', 'المبلغ المدفوع', 'المتبقي', 'الحالة', 'التاريخ'];
        const rows = invoices?.map((inv: any) => [
          inv.invoice_number,
          inv.total_amount,
          inv.paid_amount,
          inv.balance_due,
          inv.status,
          new Date(inv.created_at).toLocaleDateString('ar-SA')
        ]) || [];

        const csv = "\ufeff" + [headers, ...rows]
          .map(row => row.map(cell => `"${cell || ''}"`).join(','))
          .join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.csv`
          }
        });
      } else {
        const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0) || 0;
        const totalPaid = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.paid_amount), 0) || 0;
        const totalDebt = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.balance_due), 0) || 0;

        const content = `
التقرير المالي - Omar Clinic Pro
===============================
تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}

ملخص مالي:
إجمالي الإيرادات: ${totalRevenue.toLocaleString()} ر.س
إجمالي المحصل: ${totalPaid.toLocaleString()} ر.س
إجمالي الديون: ${totalDebt.toLocaleString()} ر.س

تفاصيل الفواتير:
${invoices?.map((inv: any, idx: number) => `
${idx + 1}. فاتورة رقم: ${inv.invoice_number}
   المبلغ: ${inv.total_amount} ر.س
   المدفوع: ${inv.paid_amount} ر.س
   المتبقي: ${inv.balance_due} ر.س
   الحالة: ${inv.status}
   التاريخ: ${new Date(inv.created_at).toLocaleDateString('ar-SA')}
`).join('\n')}
        `;

        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.txt`
          }
        });
      }
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export report' },
      { status: 500 }
    );
  }
});

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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'patients';
    const format = searchParams.get('format') || 'pdf';

    // Get user's clinic
    const { data: user } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('clerk_id', userId)
      .single();

    if (!user?.clinic_id) {
      return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
    }

    const clinicId = user.clinic_id;

    if (type === 'patients') {
      const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (format === 'excel') {
        // Create CSV content
        const headers = ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'تاريخ الميلاد', 'المرض', 'تاريخ الإضافة'];
        const rows = patients?.map((p: any) => [
          p.name,
          p.email,
          p.phone,
          p.date_of_birth,
          p.disease,
          new Date(p.created_at).toLocaleDateString('ar-SA')
        ]) || [];

        const csv = [headers, ...rows]
          .map(row => row.map(cell => `"${cell || ''}"`).join(','))
          .join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename=patients-report.csv'
          }
        });
      } else {
        // PDF export (simplified text format)
        const pdf = `
تقرير المرضى
================
تاريخ: ${new Date().toLocaleDateString('ar-SA')}
إجمالي المرضى: ${patients?.length || 0}

قائمة المرضى:
${patients?.map((p: any, idx: number) => `
${idx + 1}. ${p.name}
   البريد: ${p.email}
   الهاتف: ${p.phone}
   المرض: ${p.disease}
   تاريخ الإضافة: ${new Date(p.created_at).toLocaleDateString('ar-SA')}
`).join('\n')}
        `;

        return new NextResponse(pdf, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename=patients-report.txt'
          }
        });
      }
    } else if (type === 'financial') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (format === 'excel') {
        const headers = ['رقم الفاتورة', 'المريض', 'المبلغ', 'حالة الدفع', 'التاريخ'];
        const rows = invoices?.map((inv: any) => [
          inv.id,
          inv.patient_id,
          inv.final_amount,
          inv.payment_status,
          new Date(inv.created_at).toLocaleDateString('ar-SA')
        ]) || [];

        const csv = [headers, ...rows]
          .map(row => row.map(cell => `"${cell || ''}"`).join(','))
          .join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename=financial-report.csv'
          }
        });
      } else {
        const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;
        const totalPaid = invoices?.filter((inv: any) => inv.payment_status === 'paid').reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;
        const totalDebt = invoices?.filter((inv: any) => inv.payment_status !== 'paid').reduce((sum: number, inv: any) => sum + (inv.final_amount || 0), 0) || 0;

        const pdf = `
التقرير المالي
================
تاريخ: ${new Date().toLocaleDateString('ar-SA')}

ملخص مالي:
إجمالي الإيرادات: ${totalRevenue.toLocaleString()} ر.س
المدفوع: ${totalPaid.toLocaleString()} ر.س
الديون: ${totalDebt.toLocaleString()} ر.س

قائمة الفواتير:
${invoices?.map((inv: any, idx: number) => `
${idx + 1}. الفاتورة #${inv.id}
   المبلغ: ${inv.final_amount} ر.س
   الحالة: ${inv.payment_status}
   التاريخ: ${new Date(inv.created_at).toLocaleDateString('ar-SA')}
`).join('\n')}
        `;

        return new NextResponse(pdf, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename=financial-report.txt'
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
}

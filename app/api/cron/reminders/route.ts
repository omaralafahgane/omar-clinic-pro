import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notificationService } from '@/lib/notifications';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  // Check for Cron Secret to secure the endpoint
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find appointments starting in the next 24-26 hours that haven't been reminded
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 2);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        patient:patients(first_name, last_name, email, phone)
      `)
      .gte('start_time', tomorrow.toISOString())
      .lte('start_time', dayAfterTomorrow.toISOString())
      .eq('reminder_sent', false)
      .eq('status', 'scheduled')
      .is('deleted_at', null);

    if (error) throw error;

    // 2. Send reminders
    const results = await Promise.all(appointments.map(async (app: any) => {
      try {
        await notificationService.sendAppointmentReminder({
          to: app.patient.email,
          phone: app.patient.phone,
          name: `${app.patient.first_name} ${app.patient.last_name}`,
          time: new Date(app.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        });

        // Update reminder status
        await supabase
          .from('appointments')
          .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
          .eq('id', app.id);

        return { id: app.id, success: true };
      } catch (err) {
        return { id: app.id, success: false, error: err };
      }
    }));

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

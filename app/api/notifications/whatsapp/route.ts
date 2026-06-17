import { NextRequest, NextResponse } from 'next/server';

interface WhatsAppPayload {
  to: string;
  template: string;
  data: Record<string, any>;
}

const whatsappTemplates: { [key: string]: (data: any) => string } = {
  'appointment_reminder': (data) => `
مرحباً ${data.name}،

تذكير بموعدك الطبي غداً ⏰
⏱️ الساعة: ${data.time}
👨‍⚕️ الطبيب: د. ${data.doctorName}
🏥 العيادة: ${data.clinicName}

يرجى الحضور قبل الموعد بـ 10 دقائق

شكراً لك! 💙
  `,
  'appointment_confirmation': (data) => `
مرحباً ${data.name}،

تم تأكيد موعدك الطبي بنجاح ✓

📅 التاريخ والوقت: ${data.time}
👨‍⚕️ الطبيب: د. ${data.doctorName}
🏥 العيادة: ${data.clinicName}

شكراً لاختيارك عيادتنا! 💙
  `,
  'appointment_cancellation': (data) => `
مرحباً ${data.name}،

تم إلغاء موعدك الطبي ❌

📅 الموعد: ${data.time}
👨‍⚕️ الطبيب: د. ${data.doctorName}

إذا كان لديك أي استفسارات، يرجى التواصل معنا
  `,
  'invoice_notification': (data) => `
مرحباً ${data.name}،

تم إصدار فاتورة جديدة لك 📄

💰 المبلغ: ${data.amount} د.أ
📋 رقم الفاتورة: ${data.invoiceNumber}
📅 تاريخ الاستحقاق: ${data.dueDate}

يمكنك عرض الفاتورة من خلال بوابة المريض
  `,
  'prescription_ready': (data) => `
مرحباً ${data.name}،

وصفتك الطبية جاهزة الآن ✓

يمكنك الاطلاع عليها من خلال بوابة المريض

شكراً لك! 💙
  `,
  'file_uploaded': (data) => `
مرحباً ${data.name}،

تم إضافة ملف طبي جديد لك 📎

يمكنك الاطلاع عليه من خلال بوابة المريض

شكراً لك! 💙
  `
};

export async function POST(req: NextRequest) {
  try {
    const payload: WhatsAppPayload = await req.json();
    const { to, template, data } = payload;

    // Validate required fields
    if (!to || !template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(to.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Get WhatsApp template
    const templateFn = whatsappTemplates[template];
    if (!templateFn) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 400 }
      );
    }

    const message = templateFn(data);

    // Send WhatsApp message using Twilio or similar service
    // In production, this would use the WhatsApp API
    console.log(`[WhatsApp] Sending to ${to}`);
    console.log(`[WhatsApp] Message:`, message);

    // TODO: Integrate with WhatsApp API (Twilio, Ultramsg, etc.)
    // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     From: process.env.TWILIO_WHATSAPP_NUMBER || '',
    //     To: `whatsapp:${to}`,
    //     Body: message
    //   })
    // });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message queued for sending'
    });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}

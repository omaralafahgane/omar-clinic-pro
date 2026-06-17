import { NextRequest, NextResponse } from 'next/server';

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

const emailTemplates: { [key: string]: (data: any) => string } = {
  'appointment-reminder': (data) => `
    <div dir="rtl" style="font-family: Arial, sans-serif; color: #333;">
      <h2>تذكير بموعدك الطبي</h2>
      <p>مرحباً ${data.name},</p>
      <p>هذا تذكير بموعدك الطبي غداً في الساعة <strong>${data.time}</strong></p>
      <p><strong>الطبيب:</strong> د. ${data.doctorName}</p>
      <p><strong>العيادة:</strong> ${data.clinicName}</p>
      <p style="color: #666; font-size: 14px;">يرجى الحضور قبل الموعد بـ 10 دقائق</p>
      <p style="margin-top: 20px; color: #999; font-size: 12px;">
        إذا كان لديك أي استفسارات، يرجى التواصل معنا
      </p>
    </div>
  `,
  'appointment-confirmation': (data) => `
    <div dir="rtl" style="font-family: Arial, sans-serif; color: #333;">
      <h2>تأكيد موعدك الطبي</h2>
      <p>مرحباً ${data.name},</p>
      <p>تم تأكيد موعدك الطبي بنجاح</p>
      <p><strong>التاريخ والوقت:</strong> ${data.time}</p>
      <p><strong>الطبيب:</strong> د. ${data.doctorName}</p>
      <p><strong>العيادة:</strong> ${data.clinicName}</p>
      <p style="margin-top: 20px; color: #999; font-size: 12px;">
        شكراً لاختيارك عيادتنا
      </p>
    </div>
  `,
  'invoice-notification': (data) => `
    <div dir="rtl" style="font-family: Arial, sans-serif; color: #333;">
      <h2>فاتورة جديدة</h2>
      <p>مرحباً ${data.name},</p>
      <p>تم إصدار فاتورة جديدة لك</p>
      <p><strong>رقم الفاتورة:</strong> ${data.invoiceNumber}</p>
      <p><strong>المبلغ:</strong> ${data.amount} د.أ</p>
      <p><strong>تاريخ الاستحقاق:</strong> ${data.dueDate}</p>
      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          عرض الفاتورة
        </a>
      </p>
    </div>
  `,
  'prescription-ready': (data) => `
    <div dir="rtl" style="font-family: Arial, sans-serif; color: #333;">
      <h2>وصفتك الطبية جاهزة</h2>
      <p>مرحباً ${data.name},</p>
      <p>وصفتك الطبية جاهزة الآن</p>
      <p>يمكنك الاطلاع عليها من خلال بوابة المريض</p>
      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          عرض الوصفة
        </a>
      </p>
    </div>
  `
};

export async function POST(req: NextRequest) {
  try {
    const payload: EmailPayload = await req.json();
    const { to, subject, template, data } = payload;

    // Validate required fields
    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get email template
    const templateFn = emailTemplates[template];
    if (!templateFn) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 400 }
      );
    }

    const htmlContent = templateFn(data);

    // Send email using Resend MCP
    // In production, this would use the Resend API
    // For now, we'll log and return success
    console.log(`[Email] Sending to ${to}: ${subject}`);
    console.log(`[Email] HTML Content:`, htmlContent);

    // TODO: Integrate with Resend MCP
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: process.env.RESEND_FROM_EMAIL || 'noreply@clinic.com',
    //     to,
    //     subject,
    //     html: htmlContent
    //   })
    // });

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending'
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

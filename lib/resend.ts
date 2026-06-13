import { Resend } from 'resend';

// Resend Email Configuration
export const resendConfig = {
  apiKey: process.env.RESEND_API_KEY || "",
  fromEmail: "Omar Clinic Pro <noreply@omarclinicp.com>",
};

// Initialize Resend
const resend = resendConfig.apiKey ? new Resend(resendConfig.apiKey) : null;

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "أهلاً وسهلاً في Omar Clinic Pro",
    html: `<div dir="rtl" style="font-family: sans-serif;">
      <h1>أهلاً بك يا ${name}!</h1>
      <p>يسعدنا انضمامك إلى Omar Clinic Pro. نظامك الآن جاهز لإدارة عيادتك باحترافية.</p>
      <p>يمكنك البدء بإضافة المرضى وجدولة المواعيد الآن.</p>
    </div>`
  }),
  passwordReset: (resetLink: string) => ({
    subject: "إعادة تعيين كلمة المرور - Omar Clinic Pro",
    html: `<div dir="rtl" style="font-family: sans-serif;">
      <h1>طلب إعادة تعيين كلمة المرور</h1>
      <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
      <p>يرجى الضغط على الرابط أدناه للمتابعة:</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">إعادة تعيين كلمة المرور</a>
      <p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد.</p>
    </div>`
  }),
  subscriptionExpiryWarning: (days: number) => ({
    subject: "تنبيه: اشتراكك أوشك على الانتهاء",
    html: `<div dir="rtl" style="font-family: sans-serif;">
      <h1>تنبيه انتهاء الاشتراك</h1>
      <p>نود إعلامك بأن اشتراكك في Omar Clinic Pro سينتهي خلال <strong>${days} أيام</strong>.</p>
      <p>يرجى التجديد الآن لضمان استمرار الخدمة دون انقطاع.</p>
      <a href="https://omarclinicp.com/dashboard/subscription" style="padding: 10px 20px; background-color: #f5a623; color: white; text-decoration: none; border-radius: 5px;">تجديد الاشتراك الآن</a>
    </div>`
  }),
  subscriptionExpired: () => ({
    subject: "انتهى اشتراكك في Omar Clinic Pro",
    html: `<div dir="rtl" style="font-family: sans-serif;">
      <h1>انتهى الاشتراك</h1>
      <p>نأسف لإبلاغك بأن اشتراكك قد انتهى، وتم إيقاف الوصول إلى بعض ميزات النظام.</p>
      <p>يرجى التجديد لاستعادة الوصول الكامل لبياناتك.</p>
      <a href="https://omarclinicp.com/dashboard/subscription" style="padding: 10px 20px; background-color: #e00; color: white; text-decoration: none; border-radius: 5px;">تجديد الاشتراك الآن</a>
    </div>`
  }),
  trialRequestNotification: (clinicName: string, email: string) => ({
    subject: "طلب تجربة جديد (Trial Request)",
    html: `<div dir="rtl" style="font-family: sans-serif;">
      <h1>طلب تجربة جديد</h1>
      <p>هناك طلب جديد لتجربة النظام من عيادة:</p>
      <ul>
        <li><strong>اسم العيادة:</strong> ${clinicName}</li>
        <li><strong>البريد الإلكتروني:</strong> ${email}</li>
      </ul>
      <p>يرجى مراجعة الطلب في لوحة تحكم الأدمن.</p>
    </div>`
  }),
  subscriptionActivated: (clinicName: string, plan: string, amount: string, startDate: string, endDate: string) => ({
    subject: "تم تفعيل اشتراكك بنجاح - Omar Clinic Pro",
    html: `<div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0070f3; margin: 0;">تم تفعيل اشتراكك بنجاح!</h1>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">تفاصيل الاشتراك</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #6b7280;">اسم العيادة:</td>
            <td style="padding: 12px; text-align: left; color: #1f2937;">${clinicName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #6b7280;">الخطة:</td>
            <td style="padding: 12px; text-align: left; color: #1f2937;">
              <span style="background-color: #dbeafe; color: #0070f3; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                ${plan === 'basic' ? 'الخطة الأساسية' : plan === 'advanced' ? 'الخطة المتقدمة' : 'الخطة المؤسسية'}
              </span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #6b7280;">المبلغ:</td>
            <td style="padding: 12px; text-align: left; color: #1f2937;">
              <strong style="font-size: 18px; color: #0070f3;">${amount} USD</strong> / شهر
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #6b7280;">تاريخ البدء:</td>
            <td style="padding: 12px; text-align: left; color: #1f2937;">${startDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #6b7280;">تاريخ الانتهاء:</td>
            <td style="padding: 12px; text-align: left; color: #1f2937;">${endDate}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">الميزات المتاحة:</h3>
        <ul style="color: #4b5563; line-height: 1.8;">
          <li>✓ إدارة المرضى والسجلات الطبية</li>
          <li>✓ جدولة المواعيد والتنبيهات</li>
          <li>✓ إصدار الفواتير وتتبع الدفعات</li>
          <li>✓ التقارير والإحصائيات</li>
          <li>✓ دعم البريد الإلكتروني</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://omarclinicp.com/dashboard/clinic" style="display: inline-block; padding: 12px 30px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          الذهاب إلى لوحة التحكم
        </a>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e;">
          <strong>ملاحظة:</strong> سيتم تجديد اشتراكك تلقائياً في ${endDate}. يمكنك إدارة إعدادات الاشتراك من لوحة التحكم في أي وقت.
        </p>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>إذا كان لديك أي أسئلة، يرجى التواصل معنا عبر البريد الإلكتروني أو زيارة مركز الدعم.</p>
        <p>© 2026 Omar Clinic Pro. جميع الحقوق محفوظة.</p>
      </div>
    </div>`
  })
};

export const sendEmail = async (to: string, templateKey: keyof typeof emailTemplates, data: any) => {
  if (!resend) {
    console.error("Resend API key is missing. Email not sent.");
    return { error: "Configuration missing" };
  }

  try {
    const templateFn = emailTemplates[templateKey] as any;
    const { subject, html } = templateFn(...Object.values(data));

    const { data: resData, error } = await resend.emails.send({
      from: resendConfig.fromEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(`Error sending email to ${to}:`, error);
      return { error };
    }

    console.log(`Email sent successfully to ${to}. ID: ${resData?.id}`);
    return { success: true, id: resData?.id };
  } catch (err) {
    console.error("Unexpected error in sendEmail:", err);
    return { error: err };
  }
};

export const emailService = {
  sendWelcome: (email: string, name: string) => 
    sendEmail(email, 'welcome', { name }),
  
  sendPasswordReset: (email: string, resetLink: string) => 
    sendEmail(email, 'passwordReset', { resetLink }),
  
  sendSubscriptionExpiryWarning: (email: string, days: number) => 
    sendEmail(email, 'subscriptionExpiryWarning', { days }),
  
  sendSubscriptionExpired: (email: string) => 
    sendEmail(email, 'subscriptionExpired', {}),
  
  sendTrialRequestNotification: (adminEmail: string, clinicName: string, clinicEmail: string) => 
    sendEmail(adminEmail, 'trialRequestNotification', { clinicName, clinicEmail }),
  
  sendSubscriptionActivationEmail: (data: {
    clinicName: string;
    clinicEmail: string;
    ownerEmail: string;
    ownerName: string;
    plan: string;
    amount: string;
    startDate: string;
    endDate: string;
  }) => sendEmail(data.ownerEmail, 'subscriptionActivated', { 
    clinicName: data.clinicName,
    plan: data.plan,
    amount: data.amount,
    startDate: data.startDate,
    endDate: data.endDate
  }),
};

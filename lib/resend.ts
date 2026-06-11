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
};

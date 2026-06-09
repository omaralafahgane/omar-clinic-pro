// Resend Email Configuration
// This file will be populated in Step 8 with actual Resend integration

export const resendConfig = {
  apiKey: process.env.RESEND_API_KEY || "",
  fromEmail: "noreply@omarclinicp.com",
};

// Placeholder for Resend initialization
export const initResend = () => {
  if (!resendConfig.apiKey) {
    console.warn("Resend configuration is missing");
    return null;
  }
  // Resend will be initialized here in Step 8
};

// Email templates (to be implemented in Step 8)
export const emailTemplates = {
  // Welcome email
  welcome: {
    subject: "أهلاً وسهلاً في Omar Clinic Pro",
    template: "welcome",
  },

  // Appointment confirmation
  appointmentConfirmation: {
    subject: "تأكيد الموعد الطبي",
    template: "appointment-confirmation",
  },

  // Appointment reminder
  appointmentReminder: {
    subject: "تذكير بموعدك الطبي",
    template: "appointment-reminder",
  },

  // Invoice
  invoice: {
    subject: "فاتورتك الطبية",
    template: "invoice",
  },

  // Password reset
  passwordReset: {
    subject: "إعادة تعيين كلمة المرور",
    template: "password-reset",
  },
};

// Email sending function (to be implemented in Step 8)
export const sendEmail = async (
  to: string,
  template: string,
  data: Record<string, any>
) => {
  // TODO: Implement in Step 8
  console.log(`Email would be sent to ${to} with template ${template}`);
};

// Email service
export const emailService = {
  sendWelcome: async (email: string, name: string) => {
    // TODO: Implement in Step 8
  },

  sendAppointmentConfirmation: async (
    email: string,
    appointmentData: any
  ) => {
    // TODO: Implement in Step 8
  },

  sendAppointmentReminder: async (email: string, appointmentData: any) => {
    // TODO: Implement in Step 8
  },

  sendInvoice: async (email: string, invoiceData: any) => {
    // TODO: Implement in Step 8
  },

  sendPasswordReset: async (email: string, resetLink: string) => {
    // TODO: Implement in Step 8
  },
};

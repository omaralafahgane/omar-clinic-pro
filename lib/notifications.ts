import { emailService } from './resend';

// Types for notifications
export type NotificationType = 'APPOINTMENT_CONFIRMATION' | 'APPOINTMENT_REMINDER' | 'PAYMENT_RECEIVED' | 'FILE_UPLOADED';

interface NotificationPayload {
  to: string;
  phone?: string;
  name: string;
  date?: string;
  time?: string;
  details?: any;
}

// WhatsApp Service (Mocking an API like Twilio or Ultramsg)
const sendWhatsApp = async (phone: string, message: string) => {
  console.log(`[WhatsApp] Sending to ${phone}: ${message}`);
  // In production, you would use:
  // fetch('https://api.ultramsg.com/...', { method: 'POST', body: ... })
  return { success: true };
};

export const notificationService = {
  // 1. Appointment Confirmation
  sendAppointmentConfirmation: async (payload: NotificationPayload) => {
    const message = `مرحباً ${payload.name}، تم تأكيد موعدك في عيادة عمر بتاريخ ${payload.date} الساعة ${payload.time}. نتطلع لرؤيتك.`;
    
    await Promise.all([
      // Email
      emailService.sendEmail(payload.to, 'appointmentConfirmation', payload),
      // WhatsApp
      payload.phone ? sendWhatsApp(payload.phone, message) : Promise.resolve()
    ]);
  },

  // 2. Appointment Reminder (24h before)
  sendAppointmentReminder: async (payload: NotificationPayload) => {
    const message = `تذكير: موعدك غداً في عيادة عمر الساعة ${payload.time}. يرجى الحضور قبل الموعد بـ 10 دقائق.`;
    
    await Promise.all([
      // Email
      emailService.sendEmail(payload.to, 'appointmentReminder', payload),
      // WhatsApp
      payload.phone ? sendWhatsApp(payload.phone, message) : Promise.resolve()
    ]);
  },

  // 3. New File Uploaded
  sendFileNotification: async (payload: NotificationPayload) => {
    const message = `مرحباً ${payload.name}، تم إضافة ملف طبي جديد (صورة أشعة/نتائج مختبر) إلى حسابك. يمكنك الاطلاع عليه الآن عبر بوابة المريض.`;
    
    await Promise.all([
      emailService.sendEmail(payload.to, 'fileUploaded', payload),
      payload.phone ? sendWhatsApp(payload.phone, message) : Promise.resolve()
    ]);
  }
};

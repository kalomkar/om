import { StudentRequest } from '../types';

/**
 * Normalizes phone numbers for WhatsApp api (wa.me)
 * Standardizes 10-digit Indian numbers to +91 country code
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If starts with 0 (e.g. 09876543210), remove the leading 0
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  
  // If 10 digits (standard Indian mobile number without country code), prepend 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  
  return digits;
}

/**
 * Creates a WhatsApp URL with instant confirmation receipt for the student
 */
export function createStudentReceiptWhatsAppUrl(request: StudentRequest, portalUrl: string): string {
  const cleanPhone = cleanPhoneNumber(request.phone);
  const trackUrl = `${portalUrl.replace(/\/$/, '')}?track=${encodeURIComponent(request.id)}`;
  const dateStr = new Date(request.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `🏛️ *SRN Mehta College Kalburgi - Student Request Desk*
----------------------------------------
Hello *${request.studentName}*,
Your academic request has been successfully registered.

📌 *Tracking ID:* ${request.id}
🎓 *Roll No:* ${request.rollNumber}
📚 *Class:* ${request.className} ${request.section ? `(${request.section})` : ''}
📝 *Subject:* ${request.title}
🏷️ *Category:* ${request.category.toUpperCase()}
📅 *Date:* ${dateStr}
⏳ *Status:* Pending Review

🔍 *Live Status Track Link:*
${trackUrl}

You will be notified once your class teacher reviews your application. Thank you!`;

  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://api.whatsapp.com/send';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates a WhatsApp URL for teachers to notify students about status approval or remarks
 */
export function createTeacherStatusUpdateWhatsAppUrl(
  request: StudentRequest,
  newStatus: string,
  remarks?: string,
  portalUrl?: string
): string {
  const cleanPhone = cleanPhoneNumber(request.phone);
  const siteUrl = portalUrl ? portalUrl.replace(/\/$/, '') : window.location.origin;
  const trackUrl = `${siteUrl}?track=${encodeURIComponent(request.id)}`;

  let statusText = 'Pending';
  if (newStatus === 'approved') statusText = '✅ Approved / Ready';
  else if (newStatus === 'in_review') statusText = '🔍 Under Review';
  else if (newStatus === 'resolved') statusText = '🎉 Completed & Delivered';
  else if (newStatus === 'rejected') statusText = '❌ Rejected / Needs Correction';

  const message = `🏛️ *SRN Mehta College Kalburgi - Faculty Notification*
----------------------------------------
Dear *${request.studentName}* (Roll: ${request.rollNumber}),

The status of your request *#${request.id}* has been updated:

📌 *Subject:* ${request.title}
📊 *Current Status:* ${statusText}
${remarks ? `💬 *Teacher Remarks:* "${remarks}"\n` : ''}
🔗 *View & Track Details:*
${trackUrl}

— Class Teacher / Faculty Desk
SRN Mehta College`;

  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://api.whatsapp.com/send';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

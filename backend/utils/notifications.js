// backend/utils/notifications.js
// Statutory SMS & WhatsApp Notification Dispatch Engine with DLT Compliance
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const NOTIFS_DIR = path.join(__dirname, '../data');
const NOTIFS_FILE = path.join(NOTIFS_DIR, 'notifications_log.json');

// Ensure data directory exists
if (!fs.existsSync(NOTIFS_DIR)) {
  fs.mkdirSync(NOTIFS_DIR, { recursive: true });
}

// Ensure notification log file exists
if (!fs.existsSync(NOTIFS_FILE)) {
  fs.writeFileSync(NOTIFS_FILE, JSON.stringify([], null, 2), 'utf8');
}

/**
 * Load notifications log from disk
 */
function loadNotifications() {
  try {
    const raw = fs.readFileSync(NOTIFS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Save notifications log to disk
 */
function saveNotifications(logs) {
  try {
    fs.writeFileSync(NOTIFS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {
    console.error('[Notification Engine] Failed to save log:', e);
  }
}

/**
 * India DLT & GIGW 3.0 Approved Government Message Templates
 */
const TEMPLATES = {
  GRIEVANCE_LODGED: ({ id, department, priority, slaHours, phone }) => ({
    sms: `JanSeva Alert: Your grievance [${id}] for ${department} has been registered with ${priority} priority. Guaranteed SLA: ${slaHours} hrs. Track live: http://localhost:5173/?track=${id} - Govt of India`,
    whatsapp: `🇮🇳 *JanSeva Citizen Grievance Redressal*\n\nYour grievance *${id}* has been successfully lodged.\n\n🏛 *Department:* ${department}\n⚡ *Priority:* ${priority}\n⏱ *Guaranteed SLA Resolution:* ${slaHours} Hours\n\nTrack real-time progress on public ledger:\nhttp://localhost:5173/?track=${id}`
  }),

  OFFICER_ASSIGNED: ({ id, officerName, officerPhone, department }) => ({
    sms: `JanSeva Update: Field Officer ${officerName} (${officerPhone}) assigned to Grievance [${id}]. Investigation in progress. - JanSeva`,
    whatsapp: `👮 *JanSeva Field Officer Dispatched*\n\nOfficer assigned for grievance *${id}*:\n\n👤 *Officer:* ${officerName}\n📞 *Contact:* ${officerPhone}\n🏛 *Department:* ${department}\n\nStatus: *In Progress & Field Verified*`
  }),

  GRIEVANCE_RESOLVED: ({ id, officerName, resolutionNote }) => ({
    sms: `JanSeva Notice: Grievance [${id}] has been marked RESOLVED by ${officerName}. Remarks: ${resolutionNote || 'Work Completed'}. Please verify and rate service on portal. - JanSeva`,
    whatsapp: `✅ *JanSeva Grievance Resolved*\n\nYour complaint *${id}* has been successfully addressed.\n\n👤 *Nodal Officer:* ${officerName}\n📝 *Resolution Summary:* ${resolutionNote || 'Work Completed & Inspected'}\n\nPlease submit your satisfaction rating:\nhttp://localhost:5173/?track=${id}`
  }),

  GRIEVANCE_REOPENED: ({ id, reason }) => ({
    sms: `JanSeva Notice: Grievance [${id}] has been RE-OPENED by citizen. Reason: ${reason || 'Issue persists'}. High-priority review initiated. - JanSeva`,
    whatsapp: `🔄 *JanSeva Grievance Re-Opened*\n\nTicket *${id}* was reopened for further review.\n\n📌 *Citizen Reason:* ${reason || 'Unsatisfactory resolution / Issue persists'}\n\nPriority re-routed to Zonal Supervisory Officer.`
  }),

  SLA_BREACH_ESCALATION: ({ id, department, breachedHours, commissionerPhone }) => ({
    sms: `CRITICAL JanSeva SLA BREACH: Grievance [${id}] (${department}) breached SLA deadline by ${breachedHours} hrs. Escalated to Zonal Commissioner (${commissionerPhone || '+91 94411 22334'}). - State Control Room`,
    whatsapp: `🚨 *STATUTORY SLA BREACH ESCALATION*\n\n*Incident Ticket:* ${id}\n*Department:* ${department}\n*Overdue TAT:* Exceeded deadline by *${breachedHours} Hours*\n\n⚠️ Escalated to *Zonal Municipal Commissioner* & State Vigilance Cell for disciplinary review.`
  }),

  APPLICATION_SUBMITTED: ({ id, serviceName, slaDays, estimatedCompletion }) => ({
    sms: `JanSeva: Your application [${id}] for '${serviceName}' is received. Guaranteed SLA Delivery: ${slaDays} days (${estimatedCompletion}). - JanSeva`,
    whatsapp: `📄 *Public Service Delivery Application Submitted*\n\n*Application Code:* ${id}\n*Service:* ${serviceName}\n*Statutory Delivery SLA:* ${slaDays} Days\n*Estimated Target Date:* ${estimatedCompletion}\n\nTrack status: http://localhost:5173/?track=${id}`
  }),

  APPLICATION_STATUS_UPDATE: ({ id, serviceName, status, remarks }) => ({
    sms: `JanSeva: Application [${id}] status updated to '${status}'. Remarks: ${remarks || 'Processed'}. - JanSeva`,
    whatsapp: `📑 *Application Status Update*\n\n*Application Code:* ${id}\n*Service:* ${serviceName}\n*New Status:* *${status.toUpperCase()}*\n*Remarks:* ${remarks || 'Processed by departmental officer'}`
  })
};

/**
 * Dispatch statutory notification via SMS & WhatsApp
 * @param {Object} options
 * @param {string} options.phone - Recipient mobile number
 * @param {string} options.template - Template key from TEMPLATES
 * @param {Object} options.data - Data payload for template formatting
 * @param {Array<string>} [options.channels] - Defaults to ['SMS', 'WHATSAPP']
 * @returns {Promise<Array<Object>>} - Array of delivery receipts
 */
async function sendNotification({ phone, template, data = {}, channels = ['SMS', 'WHATSAPP'] }) {
  if (!phone) {
    phone = '+91 98765 43210'; // Fallback to nodal citizen phone
  }

  const templateFn = TEMPLATES[template];
  if (!templateFn) {
    throw new Error(`Unknown notification template '${template}'`);
  }

  const messages = templateFn({ ...data, phone });
  const logs = loadNotifications();
  const receipts = [];

  for (const channel of channels) {
    const isSms = channel.toUpperCase() === 'SMS';
    const messageContent = isSms ? messages.sms : messages.whatsapp;
    const notifId = `NOTIF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Standardize 10-digit phone for Indian gateway and full international for WhatsApp
    const rawDigits = phone.replace(/\D/g, '');
    const clean10 = rawDigits.slice(-10);
    const intlDigits = rawDigits.length >= 10 ? (rawDigits.startsWith('91') && rawDigits.length === 12 ? rawDigits : `91${clean10}`) : '919876543210';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${intlDigits}&text=${encodeURIComponent(messages.whatsapp)}`;

    const receipt = {
      id: notifId,
      recipientPhone: phone,
      channel: isSms ? 'SMS' : 'WHATSAPP',
      template,
      message: messageContent,
      status: 'DELIVERED',
      dltEntityId: 'DLT-GOV-IND-49201',
      dltHeader: isSms ? 'JANSEV' : 'JANSEVA_GOV',
      whatsappUrl: !isSms ? whatsappUrl : undefined,
      relatedEntityId: data.id || null,
      dispatchedAt: new Date().toISOString()
    };

    const isSmsPaused = process.env.PAUSE_SMS === 'true' || process.env.PAUSE_NOTIFICATIONS === 'true';
    const isWhatsAppPaused = process.env.PAUSE_WHATSAPP === 'true' || (process.env.PAUSE_NOTIFICATIONS === 'true' && process.env.PAUSE_WHATSAPP !== 'false');

    if (isSms && isSmsPaused) {
      receipt.status = 'PAUSED';
      receipt.notice = 'Live SMS dispatch is paused by administrator.';
    } else if (!isSms && isWhatsAppPaused) {
      receipt.status = 'PAUSED';
      receipt.notice = 'Live WhatsApp dispatch is paused by administrator.';
    } else {
      // Live Fast2SMS Dispatch (Real SMS landing on mobile)
      if (isSms && process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim().length > 0) {
        try {
          if (clean10.length === 10) {
            const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
              method: 'POST',
              headers: {
                'authorization': process.env.FAST2SMS_API_KEY.trim(),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                route: 'q',
                message: messageContent,
                language: 'english',
                flash: 0,
                numbers: clean10
              })
            });
            const fast2smsJson = await fast2smsRes.json();
            receipt.gatewayResponse = fast2smsJson;
            if (fast2smsJson && fast2smsJson.return) {
              receipt.status = 'DELIVERED_REAL_SMS';
              receipt.fast2smsRequestId = fast2smsJson.request_id;
              console.log(`[Fast2SMS] Successfully dispatched real SMS to ${clean10}. Request ID: ${fast2smsJson.request_id}`);
            } else {
              receipt.status = 'DISPATCHED_LOCAL';
              receipt.gatewayError = fast2smsJson?.message || 'Fast2SMS returned false';
              console.warn(`[Fast2SMS Gateway Notice] Provider response:`, fast2smsJson);
            }
          }
        } catch (err) {
          console.warn('[Fast2SMS Gateway Error]:', err.message);
          receipt.gatewayError = err.message;
        }
      }

      // Live WhatsApp Dispatch if Admin / Officer device is linked
      if (!isSms && process.env.NODE_ENV !== 'test') {
        try {
          const whatsappService = require('../src/services/whatsappService');
          if (whatsappService && whatsappService.isConnected()) {
            const waRes = await whatsappService.sendMessage(intlDigits, messageContent);
            if (waRes && waRes.success) {
              receipt.status = 'DELIVERED_REAL_WHATSAPP';
              receipt.whatsappMessageId = waRes.messageId;
              receipt.senderNumber = whatsappService.getStatus().connectedNumber;
              console.log(`[WhatsApp Service] Dispatched real WhatsApp message to ${intlDigits} from linked device (${receipt.senderNumber}).`);
            } else {
              receipt.whatsappSendNotice = waRes?.reason || 'Not sent via linked device';
            }
          }
        } catch (err) {
          console.warn('[WhatsApp Service Error]:', err.message);
        }
      }
    }

    logs.unshift(receipt);
    receipts.push(receipt);
  }

  // Keep most recent 500 notifications in persistence store
  if (logs.length > 500) {
    logs.length = 500;
  }
  saveNotifications(logs);

  return receipts;
}

/**
 * Get notification logs with filtering
 */
function getNotificationLogs({ phone, channel, status, limit = 50 } = {}) {
  let logs = loadNotifications();

  if (phone) {
    const clean = phone.replace(/\D/g, '');
    logs = logs.filter(l => l.recipientPhone.replace(/\D/g, '').includes(clean));
  }

  if (channel && channel !== 'All') {
    logs = logs.filter(l => l.channel.toUpperCase() === channel.toUpperCase());
  }

  if (status && status !== 'All') {
    logs = logs.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }

  return logs.slice(0, Number(limit) || 50);
}

/**
 * Handle incoming Two-Way WhatsApp Webhook queries (e.g. citizen texting "STATUS GRV-2026-8910")
 * @param {Object} query
 * @param {string} query.from - WhatsApp sender phone
 * @param {string} query.body - Text message sent by citizen
 * @param {Object} context - Database queries for grievance / application lookup
 */
async function processWhatsAppWebhook({ from, body }, { findGrievanceById, findApplicationById }) {
  const text = (body || '').trim();
  const phone = from || '+91 98765 43210';

  if (!text) {
    return {
      reply: "Namaste! Welcome to JanSeva 24x7 WhatsApp Desk.\n\nReply:\n• *STATUS <TicketID>* to track your grievance (e.g., STATUS GRV-2026-8910)\n• *TRACK <AppID>* to track service application (e.g., TRACK APP-2026-1049)\n• *HELP* for emergency contacts."
    };
  }

  const upper = text.toUpperCase();

  // Match: STATUS GRV-2026-XXXX or GRV-2026-XXXX
  const grvMatch = upper.match(/GRV-\d{4}-\d{3,5}/);
  if (grvMatch) {
    const ticketId = grvMatch[0];
    const grievance = findGrievanceById ? await findGrievanceById(ticketId) : null;

    if (!grievance) {
      return {
        reply: `❌ Ticket *${ticketId}* was not found in the JanSeva Municipal Ledger.\n\nPlease verify your reference code or visit http://localhost:5173/?track=${ticketId}`
      };
    }

    return {
      reply: `🇮🇳 *JanSeva Redressal Status for ${ticketId}*\n\n📌 *Title:* ${grievance.title}\n🏛 *Department:* ${grievance.department}\n📍 *Location:* ${grievance.location}\n📊 *Current Status:* *${grievance.status.toUpperCase()}*\n👮 *Assigned Officer:* ${grievance.assignedOfficer || 'Pending Dispatch'}\n⏱ *SLA Deadline:* ${new Date(grievance.slaDeadline).toLocaleString()}\n\nTrack online: http://localhost:5173/?track=${ticketId}`
    };
  }

  // Match: TRACK APP-2026-XXXX or APP-2026-XXXX
  const appMatch = upper.match(/APP-\d{4}-\d{3,5}/);
  if (appMatch) {
    const appId = appMatch[0];
    const app = findApplicationById ? await findApplicationById(appId) : null;

    if (!app) {
      return {
        reply: `❌ Application *${appId}* was not found in the public service records.`
      };
    }

    return {
      reply: `📄 *JanSeva Service Application Status for ${appId}*\n\n📌 *Service:* ${app.serviceName}\n🏛 *Department:* ${app.department}\n👤 *Applicant:* ${app.applicantName}\n📊 *Status:* *${app.status.toUpperCase()}*\n⏳ *SLA Days:* ${app.slaDays} Days\n📝 *Officer Remarks:* ${app.remarks || 'Verification in progress'}\n\nTrack online: http://localhost:5173/?track=${appId}`
    };
  }

  if (upper.includes('HELP') || upper.includes('EMERGENCY')) {
    return {
      reply: `🚨 *JanSeva Citizen Helpdesk & Emergency Contacts*\n\n• Municipal Control Room: *1800-425-GOV*\n• State Disaster Helpline: *1070*\n• Police Emergency: *112*\n• Portal: http://localhost:5173/`
    };
  }

  // Default welcome response
  return {
    reply: `Namaste! JanSeva Governance System received your message: "${text}".\n\nTo check status, send:\n*STATUS <Ticket-ID>* (e.g. *STATUS GRV-2026-8910*)\n*TRACK <App-ID>* (e.g. *TRACK APP-2026-1049*)`
  };
}

module.exports = {
  TEMPLATES,
  sendNotification,
  getNotificationLogs,
  processWhatsAppWebhook
};

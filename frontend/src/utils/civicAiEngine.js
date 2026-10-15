// Advanced Civic AI Intelligence Engine for JanSeva Governance Portal
// Provides context-aware dynamic entity resolution, real-time ticket tracking,
// statutory public service catalogs, automated grievance triage, SLA escalation advice,
// and multilingual assistance across all official Indian languages.

import { INITIAL_SERVICES } from '../data/mockData';

// Normalized helper to clean query text
function clean(str) {
  return (str || '').toLowerCase().trim();
}

/**
 * Main Civic AI Response Generator
 * @param {string} query - Raw citizen input text
 * @param {object} context - Runtime portal context { grievances, applications, services, user, lang, onTrackTicket, onOpenGrievanceModal, openServiceModal }
 * @returns {object} { text: string, actions?: Array<{ label: string, type: string, payload?: any, icon?: string }>, followUps?: string[] }
 */
export function generateCivicAiResponse(query, context = {}) {
  const {
    grievances = [],
    applications = [],
    services = INITIAL_SERVICES,
    user = null,
    lang = 'en'
  } = context;

  const rawQuery = (query || '').trim();
  const q = clean(rawQuery);

  if (!q) {
    return {
      text: "Hello! I am your JanSeva Civic AI Assistant. How can I assist you with public services or grievance tracking today?",
      followUps: ["Track my ticket status", "Check water connection SLA", "Birth certificate documents", "Lodge a new grievance"]
    };
  }

  // =========================================================================
  // 1. DIRECT TICKET ID / REFERENCE CODE LOOKUP (GRV-XXXX-XXXX or APP-XXXX-XXXX)
  // =========================================================================
  const grvMatch = rawQuery.match(/GRV[-_ ]?(\d{4})[-_ ]?(\d{4})/i) || rawQuery.match(/\bGRV[-_ ]?(\d+)\b/i);
  const appMatch = rawQuery.match(/APP[-_ ]?(\d{4})[-_ ]?(\d{4})/i) || rawQuery.match(/\bAPP[-_ ]?(\d+)\b/i);

  if (grvMatch) {
    const searchId = grvMatch[0].toUpperCase().replace(/\s+/g, '-');
    // Find in live grievances (exact or partial)
    const g = grievances.find(item => item && item.id && item.id.toUpperCase() === searchId) ||
              grievances.find(item => item && item.id && item.id.toUpperCase().includes(searchId));

    if (g) {
      const statusEmoji = {
        'Resolved': '🟢',
        'In Progress': '🟡',
        'Assigned': '🟠',
        'Under Review': '🔵',
        'Submitted': '⚪'
      }[g.status] || '📋';

      const officer = g.assignedOfficer && g.assignedOfficer !== 'Pending Assignment' 
        ? `${g.assignedOfficer} (📞 ${g.assignedOfficerContact || 'Control Room'})` 
        : 'Dispatched to Zonal Supervisory Queue';

      const slaDate = g.slaDeadline ? new Date(g.slaDeadline).toLocaleDateString() : 'Active Statutory Window';

      return {
        text: `📌 **Grievance #${g.id} Found**\n\n` +
              `• **Title:** ${g.title}\n` +
              `• **Current Status:** ${statusEmoji} **${g.status}**\n` +
              `• **Department:** ${g.department}\n` +
              `• **Location / Ward:** ${g.location || 'Municipal Area'}\n` +
              `• **Assigned Officer:** ${officer}\n` +
              `• **Statutory SLA Target:** ${slaDate}\n` +
              (g.reportCount > 1 ? `• **Community Impact:** +${g.reportCount - 1} citizens affected\n` : '') +
              (g.ipfsDocumentCid ? `• **IPFS Verification:** Cryptographically Pinned (CID: ${g.ipfsDocumentCid.slice(0, 10)}...)\n` : '') +
              `\nYou can inspect the full chronological inspection trail and Hyperledger blockchain ledger in the tracker.`,
        actions: [
          {
            label: `Inspect #${g.id} Timeline`,
            type: 'track',
            payload: g.id,
            icon: 'Search'
          },
          ...(g.status === 'Resolved' ? [
            {
              label: `Submit Feedback for #${g.id}`,
              type: 'track',
              payload: g.id,
              icon: 'MessageSquare'
            }
          ] : [])
        ],
        followUps: [`What is the SLA for ${g.department}?`, "How to reopen if not fixed?", "Helpline phone number"]
      };
    } else {
      return {
        text: `🔍 I searched the national registry for **${searchId}**, but couldn't locate an active ticket with that exact ID in the current session.\n\n` +
              `• Please double-check the 8-digit tracking code on your SMS or acknowledgment receipt.\n` +
              `• Or click below to open the dedicated tracker to search by phone number or keywords.`,
        actions: [
          {
            label: 'Open Ticket Tracker',
            type: 'navigate-track',
            payload: searchId,
            icon: 'Search'
          },
          {
            label: 'Lodge New Grievance',
            type: 'lodge',
            icon: 'FilePlus'
          }
        ],
        followUps: ["Check sample ticket #GRV-2026-8910", "How do I find my reference code?", "Emergency Helpline"]
      };
    }
  }

  if (appMatch) {
    const searchId = appMatch[0].toUpperCase().replace(/\s+/g, '-');
    const app = applications.find(item => item && item.id && item.id.toUpperCase() === searchId) ||
                applications.find(item => item && item.id && item.id.toUpperCase().includes(searchId));

    if (app) {
      return {
        text: `📄 **Public Service Application #${app.id} Found**\n\n` +
              `• **Service Name:** ${app.serviceName}\n` +
              `• **Applicant:** ${app.applicantName}\n` +
              `• **Status:** 🔵 **${app.status || 'Submitted'}**\n` +
              `• **Applied Date:** ${app.appliedDate || app.createdAt ? new Date(app.appliedDate || app.createdAt).toLocaleDateString() : 'Recent'}\n` +
              `• **Statutory SLA Turnaround:** ${app.slaDays || 7} Working Days\n` +
              (app.estimatedCompletion ? `• **Target Delivery Date:** ${app.estimatedCompletion}\n` : '') +
              (app.remarks ? `• **Official Remarks:** ${app.remarks}\n` : '') +
              `\nYour identity documents are securely verified under GIGW 3.0 DigiLocker integration.`,
        actions: [
          {
            label: `Track Application #${app.id}`,
            type: 'track',
            payload: app.id,
            icon: 'Search'
          }
        ],
        followUps: ["Explore other public services", "Download digital certificate", "Check statutory fees"]
      };
    }
  }

  // =========================================================================
  // 2. CITIZEN MY SUBMISSIONS / "MY COMPLAINTS" LOOKUP
  // =========================================================================
  if (
    q.includes('my grievance') || 
    q.includes('my ticket') || 
    q.includes('my complaint') || 
    q.includes('my application') ||
    q.includes('my submission') ||
    q.includes('what did i lodge') ||
    q.includes('meri shikayat') ||
    q.includes('nanna dooru')
  ) {
    const userPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
    const userEmail = (user?.email || '').toLowerCase().trim();
    const userName = (user?.fullName || '').toLowerCase().trim();

    const userGrievances = grievances.filter(g => {
      if (!g) return false;
      const gPhone = (g.citizenPhone || '').replace(/\D/g, '').slice(-10);
      const matchPhone = userPhone && gPhone && userPhone === gPhone;
      const matchEmail = userEmail && g.citizenEmail && userEmail === g.citizenEmail.toLowerCase().trim();
      const matchName = userName && g.citizenName && userName === g.citizenName.toLowerCase().trim();
      const matchUser = user && g.userId && String(g.userId) === String(user.id);
      return Boolean(matchPhone || matchEmail || matchName || matchUser);
    });

    const userApps = applications.filter(a => {
      if (!a) return false;
      const aPhone = (a.applicantPhone || a.phone || '').replace(/\D/g, '').slice(-10);
      const matchPhone = userPhone && aPhone && userPhone === aPhone;
      const matchEmail = userEmail && (a.applicantEmail || a.email) && userEmail === (a.applicantEmail || a.email).toLowerCase().trim();
      return Boolean(matchPhone || matchEmail);
    });

    if (userGrievances.length > 0 || userApps.length > 0) {
      let responseText = `📂 **You have ${userGrievances.length} grievance(s) and ${userApps.length} service application(s) on record:**\n\n`;
      userGrievances.slice(0, 3).forEach(g => {
        responseText += `• **#${g.id}** (${g.status}): ${g.title.slice(0, 45)}... [SLA: ${g.department}]\n`;
      });
      userApps.slice(0, 2).forEach(a => {
        responseText += `• **#${a.id}** (${a.status}): ${a.serviceName} [Applied on ${a.appliedDate || 'recently'}]\n`;
      });
      responseText += `\nClick below to inspect your complete submissions registry and live tracking timeline.`;

      return {
        text: responseText,
        actions: [
          {
            label: 'View My Submissions',
            type: 'submissions-modal',
            icon: 'Eye'
          },
          {
            label: '+ Lodge Another Grievance',
            type: 'lodge',
            icon: 'FilePlus'
          }
        ],
        followUps: ["How to expedite my ticket?", "Check SLA escalation policy", "Helpline number"]
      };
    } else {
      return {
        text: `You do not have any active registered grievances or service applications matching your current user account.\n\n` +
              `Would you like to report a public civic issue or apply for a statutory certificate right now?`,
        actions: [
          {
            label: '+ Lodge New Grievance',
            type: 'lodge',
            icon: 'FilePlus'
          },
          {
            label: 'Browse Public Services',
            type: 'navigate-services',
            icon: 'Layers'
          }
        ],
        followUps: ["How does grievance lodging work?", "What documents are required?", "24x7 Helpline"]
      };
    }
  }

  // =========================================================================
  // 3. STATUTORY SERVICES DIRECT INQUIRIES & DETAILS
  // =========================================================================

  // Birth Certificate
  if (q.includes('birth') || q.includes('janm') || q.includes('janana') || q.includes('pirappu') || q.includes('puttina') || q.includes('srv-1')) {
    const srv = services.find(s => s.id === 'srv-1') || { slaDays: 7, fee: '₹50' };
    return {
      text: `👶 **Issue of Official Birth Certificate**\n\n` +
            `• **Department:** Revenue & Vital Statistics (Municipal Registrar)\n` +
            `• **Statutory Delivery SLA:** **${srv.slaDays} Working Days** (under Registration of Births and Deaths Act)\n` +
            `• **Nominal Government Fee:** **${srv.fee}** (Treasury Receipt provided)\n` +
            `• **Mandatory Enclosures:**\n` +
            `   1. Hospital Birth Discharge Summary / Form-1 Report\n` +
            `   2. Parents' Aadhaar Cards with linked mobile number\n` +
            `   3. Proof of Residence (Ration Card, Electricity Bill, or Voter ID)\n\n` +
            `✨ **Key Features:** Instant QR-code digital verification, 100% paperless UIDAI integration, and automatic DigiLocker push upon Chief Registrar digital signature.`,
      actions: [
        {
          label: 'Apply for Birth Certificate',
          type: 'service',
          payload: srv,
          icon: 'FilePlus'
        }
      ],
      followUps: ["How to correct spelling in birth certificate?", "What if born at home?", "Track my birth certificate application"]
    };
  }

  // Water & Sewerage Connection
  if (
    q.includes('water connection') || 
    q.includes('sewerage connection') || 
    q.includes('tap connection') || 
    q.includes('water meter') || 
    q.includes('piped water') ||
    q.includes('jal connection') ||
    q.includes('neeru connection') ||
    q.includes('srv-2')
  ) {
    const srv = services.find(s => s.id === 'srv-2') || { slaDays: 14, fee: '₹1,200' };
    return {
      text: `🚰 **New Water & Sewerage Connection**\n\n` +
            `• **Department:** Water Supply & Sanitation Board\n` +
            `• **Statutory Turnaround SLA:** **${srv.slaDays} Working Days** (On-site engineer feasibility check within 48h)\n` +
            `• **Connection Charge:** **${srv.fee}** (Standard domestic tap connection & testing)\n` +
            `• **Required Property Documents:**\n` +
            `   1. Registered Property Ownership Sale Deed or Building Allotment Letter\n` +
            `   2. Latest Municipal Property Tax Paid Receipt / Khata Extract\n` +
            `   3. Site plan sketch showing nearest municipal main pipeline\n\n` +
            `✨ **Infrastructure:** High-pressure potable municipal drinking water supply, scientific underground drainage grid link, and automated smart AMR digital metering allotment.`,
      actions: [
        {
          label: 'Apply for Water Connection',
          type: 'service',
          payload: srv,
          icon: 'Droplets'
        }
      ],
      followUps: ["What is water connection tariff?", "Water pipeline leak complaint", "Check status of water application"]
    };
  }

  // Caste & Income Certificate
  if (
    q.includes('caste') || 
    q.includes('income certificate') || 
    q.includes('jaati') || 
    q.includes('aay praman') || 
    q.includes('aadaaya') || 
    q.includes('ews') || 
    q.includes('obc') || 
    q.includes('sc st') ||
    q.includes('srv-4')
  ) {
    const srv = services.find(s => s.id === 'srv-4') || { slaDays: 10, fee: '₹30' };
    return {
      text: `📜 **Caste & Annual Family Income Certificate**\n\n` +
            `• **Department:** Revenue & Land Administration (Tahsildar Desk)\n` +
            `• **Statutory Delivery SLA:** **${srv.slaDays} Working Days**\n` +
            `• **Subsidized Treasury Processing Fee:** **${srv.fee}**\n` +
            `• **Mandatory Verification Enclosures:**\n` +
            `   1. Family BPL Ration Card / Antyodaya Anna Yojana Card Copy\n` +
            `   2. Salary Slip or Agricultural RTC Land Record / Income Affidavit\n` +
            `   3. School Leaving Certificate (TC) or Ancestral Caste Record of Blood Relative\n\n` +
            `✨ **Pan-India Validity:** Certified for 5 years with tamper-proof 2D QR Code verification, accepted across NEET, JEE, UPSC, State Scholarships, and central quota welfare programs.`,
      actions: [
        {
          label: 'Apply for Caste & Income Certificate',
          type: 'service',
          payload: srv,
          icon: 'Award'
        }
      ],
      followUps: ["Income limit for EWS certificate?", "Documents for SC/ST certificate?", "How long is it valid?"]
    };
  }

  // Trade License
  if (
    q.includes('trade license') || 
    q.includes('business permit') || 
    q.includes('shop license') || 
    q.includes('commercial license') || 
    q.includes('vyapar license') ||
    q.includes('srv-3')
  ) {
    const srv = services.find(s => s.id === 'srv-3') || { slaDays: 5, fee: '₹850' };
    return {
      text: `🏢 **Municipal Trade License & Business Permit**\n\n` +
            `• **Authority:** Commercial & Trade Licensing Authority\n` +
            `• **Statutory SLA Turnaround:** **${srv.slaDays} Days** (under Right to Services fast-track)\n` +
            `• **Statutory Base Tariff:** **${srv.fee}** (with instant official digital treasury receipt)\n` +
            `• **Mandatory Business Documents:**\n` +
            `   1. GSTIN Certificate or Udyam MSME Registration Copy\n` +
            `   2. Shop Commercial Lease Agreement or Property Tax Receipt\n` +
            `   3. Fire Safety NOC / Sanitary Fitness Clearance (if applicable for hospitality/manufacturing)\n\n` +
            `✨ **Ease of Doing Business (EoDB):** 100% paperless single-window clearance, valid pan-municipal jurisdiction for 1 year with automated digital annual renewal.`,
      actions: [
        {
          label: 'Apply for Trade License',
          type: 'service',
          payload: srv,
          icon: 'Building2'
        }
      ],
      followUps: ["Penalty for expired trade license?", "Documents for restaurant license?", "How to renew trade license?"]
    };
  }

  // Property Tax & Khata Mutation
  if (
    q.includes('property tax') || 
    q.includes('khata') || 
    q.includes('mutation') || 
    q.includes('naamantaran') || 
    q.includes('property transfer') || 
    q.includes('house tax') ||
    q.includes('srv-5')
  ) {
    const srv = services.find(s => s.id === 'srv-5') || { slaDays: 15, fee: '₹500' };
    return {
      text: `🏡 **Property Tax Assessment & Khata Mutation**\n\n` +
            `• **Division:** Municipal Revenue & Taxation Division\n` +
            `• **Statutory Delivery SLA:** **${srv.slaDays} Working Days** (Mutation) / Instant (Self-Assessment)\n` +
            `• **Title Registry & Mutation Charge:** **${srv.fee}** (Tax assessment calculation is Free)\n` +
            `• **Required Property Records:**\n` +
            `   1. Registered Sale Deed / Partition Deed / Gift Deed Document Copy\n` +
            `   2. Latest Municipal Property Tax Paid Challan & Khata Extract\n` +
            `   3. Approved Building Plan Blueprint or Encumbrance Certificate (EC)\n\n` +
            `✨ **Land Registry Synchronization:** Linked with Sub-Registrar electronic deeds database (Kaveri / Bhoomi) and automated Unit Area Value (UAV) GIS tax calculator.`,
      actions: [
        {
          label: 'Apply for Property Tax / Mutation',
          type: 'service',
          payload: srv,
          icon: 'Home'
        }
      ],
      followUps: ["How is property tax calculated?", "Difference between A-Khata and B-Khata?", "Get tax clearance certificate"]
    };
  }

  // Street Light & Electrical Infrastructure
  if (
    q.includes('street light') || 
    q.includes('street lamp') || 
    q.includes('dark spot') || 
    q.includes('broken pole') || 
    q.includes('light kharab') ||
    q.includes('bulb swap') ||
    q.includes('srv-6')
  ) {
    const srv = services.find(s => s.id === 'srv-6') || { slaDays: 3, fee: 'Free' };
    return {
      text: `💡 **Public Street Lighting & Civic Electrical Maintenance**\n\n` +
            `• **Department:** Public Works & Electrical Infrastructure\n` +
            `• **Rapid Redressal SLA:** **72 Hours (3 Days) Guaranteed Field Resolution**\n` +
            `• **Service Cost:** **100% Free Civic Service** (Public amenity)\n` +
            `• **What You Need to Provide:**\n` +
            `   1. Street / Cross-Road Landmark, Ward and House Number\n` +
            `   2. Electrical pole serial number or transformer tag (if visible)\n` +
            `   3. Optional mobile photo or geotagged GPS location\n\n` +
            `✨ **Rapid Dispatch:** Automated SMS dispatch to Ward Junior Electrical Engineer; night safety inspections conducted for women & pedestrian corridors.`,
      actions: [
        {
          label: 'Request Street Light Service',
          type: 'service',
          payload: srv,
          icon: 'Zap'
        },
        {
          label: 'Report Hazardous Exposed Wire',
          type: 'lodge',
          payload: { category: 'Roads & Infrastructure', title: 'Hazardous Electrical Wire / Broken Streetlight' },
          icon: 'AlertTriangle'
        }
      ],
      followUps: ["Report dark spot in my lane", "Streetlight not turning off in daytime", "Call 24x7 helpline"]
    };
  }

  // Domestic LPG Gas Connection
  if (q.includes('lpg') || q.includes('gas connection') || q.includes('cylinder') || q.includes('ujjwala') || q.includes('pmuy') || q.includes('srv-7')) {
    const srv = services.find(s => s.id === 'srv-7') || { slaDays: 7, fee: '₹1,600' };
    return {
      text: `🔥 **New Domestic LPG Gas Connection (PMUY / City Gas)**\n\n` +
            `• **Department:** Food, Civil Supplies & Consumer Affairs\n` +
            `• **Statutory Turnaround:** **${srv.slaDays} Working Days**\n` +
            `• **Fee:** **${srv.fee}** (Subsidized for eligible PMUY beneficiaries)\n` +
            `• **Required Documents:**\n` +
            `   1. Applicant Aadhaar Card with biometric verification\n` +
            `   2. Family Ration Card / BPL Certificate\n` +
            `   3. Bank Passbook copy (for Direct Benefit Transfer DBTL subsidy)\n` +
            `   4. Proof of residence (Electricity / Water bill)\n\n` +
            `✨ Includes safety regulator, hose pipe, passbook and safety inspection.`,
      actions: [
        {
          label: 'Apply for LPG Gas Connection',
          type: 'service',
          payload: srv,
          icon: 'Flame'
        }
      ],
      followUps: ["Who is eligible for PMUY free gas?", "How to link bank account for subsidy?", "LPG delivery complaint"]
    };
  }

  // Electricity Connection & Smart Meter
  if (q.includes('electricity connection') || q.includes('power connection') || q.includes('smart meter') || q.includes('bijli connection') || q.includes('srv-8')) {
    const srv = services.find(s => s.id === 'srv-8') || { slaDays: 5, fee: '₹750' };
    return {
      text: `⚡ **New Domestic Electricity Connection & Smart Meter**\n\n` +
            `• **Department:** Energy & Power Distribution (DISCOM)\n` +
            `• **Statutory SLA:** **${srv.slaDays} Days**\n` +
            `• **Standard Connection Charge:** **${srv.fee}**\n` +
            `• **Required Documents:**\n` +
            `   1. Registered Property Deed or Registered Lease Agreement\n` +
            `   2. Latest Municipal Property Tax Paid Receipt\n` +
            `   3. Licensed Electrical Contractor Wiring Safety Certificate\n` +
            `   4. Applicant Aadhaar / Voter ID\n\n` +
            `✨ Digital smart meter allotted with automated daily consumption tracking and AMR link.`,
      actions: [
        {
          label: 'Apply for Power Connection',
          type: 'service',
          payload: srv,
          icon: 'Zap'
        }
      ],
      followUps: ["Report power outage", "Tariff rates for residential electricity", "Wrong meter reading complaint"]
    };
  }

  // Driving License Services
  if (q.includes('driving license') || q.includes('dl renew') || q.includes('rto') || q.includes('driver license') || q.includes('driving') || q.includes('srv-9')) {
    const srv = services.find(s => s.id === 'srv-9') || { slaDays: 7, fee: '₹400' };
    return {
      text: `🚗 **Renewal of Driving License & DL Services**\n\n` +
            `• **Department:** Transport Department & Regional Transport Office (RTO)\n` +
            `• **Statutory SLA:** **${srv.slaDays} Days** (Delivered via Speed Post / DigiLocker)\n` +
            `• **Standard Renewal Fee:** **${srv.fee}**\n` +
            `• **Required Documents:**\n` +
            `   1. Original Expired Driving License Details\n` +
            `   2. Form 1A Medical Fitness Certificate (for applicants over 40)\n` +
            `   3. Aadhaar Card for contactless e-KYC\n` +
            `   4. Passport size photograph and signature upload`,
      actions: [
        {
          label: 'Apply for Driving License Renewal',
          type: 'service',
          payload: srv,
          icon: 'FileText'
        }
      ],
      followUps: ["Grace period for expired DL?", "International driving permit rules", "Learner license requirements"]
    };
  }

  // Social Welfare Pension
  if (q.includes('pension') || q.includes('old age') || q.includes('widow') || q.includes('disability pension') || q.includes('vridha') || q.includes('srv-11')) {
    const srv = services.find(s => s.id === 'srv-11') || { slaDays: 21, fee: 'Free' };
    return {
      text: `🤝 **Old Age, Widow & Disability Social Welfare Pension Scheme**\n\n` +
            `• **Department:** Social Welfare & Women Empowerment\n` +
            `• **Statutory Processing SLA:** **${srv.slaDays} Days**\n` +
            `• **Application Charge:** **Free** (Direct Treasury DBT monthly crediting)\n` +
            `• **Required Documents:**\n` +
            `   1. Age proof certificate (Aadhaar / Voter ID / Birth Record - 60+ for Old Age)\n` +
            `   2. Annual family income certificate below state threshold\n` +
            `   3. Death certificate of spouse (for Widow pension) or Medical Board Certificate 40%+ (for Disability)\n` +
            `   4. Active Bank Account linked to Aadhaar (NPCI mapped)`,
      actions: [
        {
          label: 'Apply for Social Pension Scheme',
          type: 'service',
          payload: srv,
          icon: 'Users'
        }
      ],
      followUps: ["Monthly pension disbursement amount", "Check pension eligibility criteria", "Bank DBT linking procedure"]
    };
  }

  // =========================================================================
  // 4. CIVIC GRIEVANCE PROBLEM DIAGNOSIS & SMART AUTO-TRIAGE
  // =========================================================================

  // Potholes / Broken Roads
  if (q.includes('pothole') || q.includes('gaddha') || q.includes('khadda') || q.includes('broken road') || q.includes('crater') || q.includes('road damaged') || q.includes('asphalt')) {
    return {
      text: `🚧 **Road Damage & Pothole Redressal**\n\n` +
            `• **Assigned Department:** Public Works & Infrastructure (Highway & Ward Roads)\n` +
            `• **Statutory Resolution SLA:** **48 to 72 Hours**\n` +
            `• **Suggested Priority:** **Urgent** (especially on fast corridors or near metro/schools)\n` +
            `• **Field Dispatch Instructions:**\n` +
            `   - When you click below to lodge your grievance, take a quick photo of the pothole.\n` +
            `   - Our built-in GPS and camera stamp will automatically locate the exact ward and road coordinates for the asphalt patching crew!`,
      actions: [
        {
          label: '+ Lodge Pothole Grievance',
          type: 'lodge',
          payload: { category: 'Roads & Infrastructure', title: 'Hazardous Road Pothole Requiring Patching' },
          icon: 'FilePlus'
        }
      ],
      followUps: ["What if a pothole caused an accident?", "Track existing road complaint", "Call 24x7 helpline"]
    };
  }

  // Water Drainage / Sewage Overflow / Contamination
  if (
    q.includes('water leak') || 
    q.includes('drainage') || 
    q.includes('sewage') || 
    q.includes('sewer') || 
    q.includes('overflow') || 
    q.includes('dirty water') || 
    q.includes('water supply') ||
    q.includes('manhole') ||
    q.includes('paani nahi aa raha')
  ) {
    return {
      text: `🚰 **Water Supply & Sewage Redressal**\n\n` +
            `• **Assigned Department:** Water Supply & Sanitation Board\n` +
            `• **Statutory Resolution SLA:** **24 to 48 Hours**\n` +
            `• **Priority Classification:**\n` +
            `   - Contaminated / Murky Drinking Water: **Urgent (24h)**\n` +
            `   - Open / Overflowing Sewer Line: **Urgent (24h)**\n` +
            `   - Main Pipeline Burst: **Urgent (Emergency team dispatched)**\n` +
            `   - Scheduled Supply Interruption: **48 Hours**\n\n` +
            `Our automated round-robin engine routes water issues straight to the Junior Public Health Engineer for your ward.`,
      actions: [
        {
          label: '+ Report Water / Drainage Issue',
          type: 'lodge',
          payload: { category: 'Water Supply & Sanitation', title: 'Urgent Water Supply / Drainage Fault' },
          icon: 'Droplets'
        }
      ],
      followUps: ["How to apply for new drinking water tap?", "Water tanker emergency booking", "Check Ward 14 drainage status"]
    };
  }

  // Garbage / Solid Waste / Health Hazard
  if (
    q.includes('garbage') || 
    q.includes('trash') || 
    q.includes('waste') || 
    q.includes('kachra') || 
    q.includes('dustbin') || 
    q.includes('dead animal') || 
    q.includes('cleaning') || 
    q.includes('sanitation')
  ) {
    return {
      text: `🧹 **Solid Waste & Municipal Sanitation**\n\n` +
            `• **Assigned Department:** Health & Hygiene (Solid Waste Management Division)\n` +
            `• **Statutory SLA:** **24 Hours** for domestic garbage heaps, **6 Hours** for carcass disposal\n` +
            `• **Action Workflow:**\n` +
            `   1. Report with street landmark or upload a photo.\n` +
            `   2. Automated SMS alert dispatches the ward compacting tipper truck.\n` +
            `   3. Sanitization supervisor applies bleaching disinfectant and uploads photographic closure proof.`,
      actions: [
        {
          label: '+ Report Uncollected Garbage',
          type: 'lodge',
          payload: { category: 'Sanitation & Waste Management', title: 'Solid Waste & Garbage Accumulation' },
          icon: 'FilePlus'
        }
      ],
      followUps: ["Door-to-door garbage collection timings", "Commercial waste disposal rules", "Sanitary inspector contact"]
    };
  }

  // =========================================================================
  // 5. SLA ESCALATION, DISCIPLINARY TRIBUNAL & CITIZEN RIGHTS
  // =========================================================================
  if (
    q.includes('escalat') || 
    q.includes('delayed') || 
    q.includes('sla breach') || 
    q.includes('tribunal') || 
    q.includes('disciplinary') || 
    q.includes('explanation notice') ||
    q.includes('officer not responding') ||
    q.includes('overdue')
  ) {
    return {
      text: `⚖️ **Statutory SLA Escalation & Disciplinary Tribunal Rules**\n\n` +
            `Under the **Time-Bound Public Service Delivery Act (GIGW 3.0 Standard)**:\n\n` +
            `1. **Automated Countdown:** Every ticket has an immutable SLA countdown timer on Hyperledger Fabric blockchain.\n` +
            `2. **L1 Breach (Overdue):** When the SLA passes 0 hours, the system automatically marks the officer as **Overdue** and triggers a formal **Explanation Notice**.\n` +
            `3. **L2 Breach (Escalation):** Unresolved grievances past 48h escalate directly to the **Senior Zonal Commissioner**.\n` +
            `4. **L3 Disciplinary Action:** If the assigned officer fails to submit an accepted operational explanation within 72 hours, a penalty deduction is formally registered under State Civil Service Rules.\n\n` +
            `Citizens can also manually trigger an escalation on any overdue ticket from the 'Track Status' page.`,
      actions: [
        {
          label: 'Go to Ticket Escalation View',
          type: 'navigate-track',
          icon: 'AlertCircle'
        },
        {
          label: 'Call Nodal Officer Helpline',
          type: 'helpline',
          icon: 'PhoneCall'
        }
      ],
      followUps: ["How to reopen a closed ticket?", "What is an explanation notice?", "Right to Public Services Act guidelines"]
    };
  }

  // Re-opening Closed Tickets
  if (q.includes('reopen') || q.includes('not fixed') || q.includes('unsatisfied') || q.includes('closed without solving') || q.includes('false resolution')) {
    return {
      text: `🔄 **How to Re-open an Unsatisfactorily Resolved Ticket**\n\n` +
            `• You have a **7-day statutory citizen satisfaction window** after any grievance is marked 'Resolved'.\n` +
            `• **Steps to Reopen:**\n` +
            `   1. Go to the **'Track Status & Resolution'** tab.\n` +
            `   2. Enter your Ticket ID (e.g. GRV-2026-8910).\n` +
            `   3. Rate the resolution 1 or 2 stars and click **'Issue Not Fixed? Re-open Ticket'**.\n` +
            `   4. Enter your re-open comments.\n\n` +
            `⚠️ Reopened tickets are flagged with **High Priority** and reassigned with supervisory oversight.`,
      actions: [
        {
          label: 'Track & Reopen Ticket',
          type: 'navigate-track',
          icon: 'RotateCcw'
        }
      ],
      followUps: ["How does citizen feedback work?", "Can an officer close a ticket without fixing?", "Call 24x7 helpline"]
    };
  }

  // Blockchain & IPFS Cryptographic Security
  if (q.includes('blockchain') || q.includes('ipfs') || q.includes('hyperledger') || q.includes('tamper') || q.includes('cid')) {
    return {
      text: `🛡️ **Blockchain & IPFS Cryptographic Integrity**\n\n` +
            `JanSeva uses enterprise government technology to guarantee zero tampering:\n\n` +
            `• **Hyperledger Fabric:** Every status transition (Submitted, Assigned, In Progress, Resolved) is recorded as an immutable blockchain transaction with cryptographic hash and timestamp.\n` +
            `• **IPFS Decentralized Storage:** Your uploaded identity documents and photo proofs are converted into SHA-256 Content-Addressed CIDs (Content Identifiers). No file can be secretly altered or deleted by staff.\n` +
            `• You can verify any transaction hash or download pinned IPFS documents directly from the 'Track Status' tab!`,
      actions: [
        {
          label: 'Inspect Hyperledger Ledger',
          type: 'navigate-track',
          icon: 'Database'
        }
      ],
      followUps: ["How to view IPFS document?", "Is my Aadhaar number public?", "Official receipt print"]
    };
  }

  // Helpline & Emergency Contacts
  if (q.includes('helpline') || q.includes('phone') || q.includes('contact') || q.includes('call') || q.includes('number') || q.includes('toll free') || q.includes('support')) {
    return {
      text: `📞 **Official JanSeva Civic Support & Helplines**\n\n` +
            `• **24x7 National Toll-Free Citizen Helpline:** **1800-425-GOV** (1800-425-468)\n` +
            `• **Emergency Hazard Control Desk:** Available round-the-clock for electrical sparks, gas leaks, and flooding.\n` +
            `• **Nodal Grievance Redressal Desk:** Mon - Sat, 9:00 AM - 6:00 PM\n` +
            `• **Official Email:** grievance.support@janseva.gov.in\n` +
            `• **Physical Location:** Municipal Administrative Complex, Central Civic Secretariat.`,
      actions: [
        {
          label: 'Call Helpline: 1800-425-GOV',
          type: 'helpline',
          icon: 'PhoneCall'
        }
      ],
      followUps: ["Lodge a formal complaint", "Track my existing ticket", "Find my ward office"]
    };
  }

  // Portal Navigation & Language Preferences
  if (q.includes('language') || q.includes('bhasha') || q.includes('hindi') || q.includes('kannada') || q.includes('tamil') || q.includes('urdu')) {
    return {
      text: `🌐 **Regional Language Support**\n\n` +
            `JanSeva supports **13 official languages** across all municipal services:\n` +
            `English, हिन्दी (Hindi), ಕನ್ನಡ (Kannada), தமிழ் (Tamil), తెలుగు (Telugu), മലയാളം (Malayalam), मराठी (Marathi), ગુજરાતી (Gujarati), বাংলা (Bengali), ଓଡ଼ିଆ (Odia), ਪੰਜਾਬੀ (Punjabi), অসমীয়া (Assamese), and اردو (Urdu).\n\n` +
            `To change language, simply click the **Globe (🌐) icon** in the top navigation bar at any time!`,
      followUps: ["Explore public services", "Track complaint", "Lodge grievance"]
    };
  }

  // Greetings & Pleasantries
  if (
    q === 'hi' || 
    q === 'hello' || 
    q === 'hey' || 
    q.includes('namaste') || 
    q.includes('vanakkam') || 
    q.includes('namaskara') || 
    q.includes('adaab') || 
    q.includes('good morning') || 
    q.includes('good afternoon') ||
    q.includes('kaise ho')
  ) {
    const citizenName = user?.fullName ? ` ${user.fullName}` : '';
    return {
      text: `👋 **Namaste${citizenName}! Welcome to JanSeva Civic Assistant.**\n\n` +
            `I am your 24x7 intelligent digital companion for public administration. You can ask me to:\n\n` +
            `1. **Track any ticket or service application** (e.g. "Track #GRV-2026-8910")\n` +
            `2. **Check required documents, fees & SLAs** for Birth Certificates, Water Connections, Trade Licenses, Property Tax, LPG Gas, etc.\n` +
            `3. **Diagnose and report civic issues** like potholes, water leaks, garbage heaps, or broken streetlights.\n` +
            `4. **Guide you through SLA escalations, tribunals, and re-opening tickets.**\n\n` +
            `What can I help you resolve today?`,
      actions: [
        {
          label: '+ Lodge Grievance',
          type: 'lodge',
          icon: 'FilePlus'
        },
        {
          label: 'View Services Catalog',
          type: 'navigate-services',
          icon: 'Layers'
        },
        {
          label: 'Track a Ticket',
          type: 'navigate-track',
          icon: 'Search'
        }
      ],
      followUps: ["Birth certificate documents & fee?", "Report a road pothole", "Check my registered complaints"]
    };
  }

  // Thanks / Positive Feedback
  if (q.includes('thank') || q.includes('dhanyavad') || q.includes('shukriya') || q.includes('nandri') || q.includes('dhanyavada')) {
    return {
      text: `You're very welcome! JanSeva is committed to transparent, prompt, and accountable public service delivery.\n\n` +
            `Feel free to ask whenever you need assistance with any government service or grievance redressal. Have a great day!`,
      followUps: ["Track another ticket", "Browse public services", "Helpline number"]
    };
  }

  // =========================================================================
  // 6. GENERAL CIVIC SEARCH / INTELLIGENT COMPREHENSIVE FALLBACK
  // =========================================================================

  // Search in services by keywords
  const matchedServices = services.filter(s => 
    clean(s.name).includes(q) || 
    clean(s.department).includes(q) || 
    clean(s.description).includes(q) ||
    clean(s.category).includes(q)
  );

  if (matchedServices.length > 0) {
    const s = matchedServices[0];
    return {
      text: `📋 **Relevant Public Service Found: ${s.name}**\n\n` +
            `• **Department:** ${s.department}\n` +
            `• **Statutory SLA Delivery:** **${s.slaDays} Working Days**\n` +
            `• **Application Fee:** **${s.fee}**\n` +
            `• **Scope:** ${s.description}\n` +
            (s.documentsNeeded ? `• **Required Documents:** ${s.documentsNeeded.join(', ')}\n` : '') +
            `\nYou can apply directly online through JanSeva without visiting municipal offices.`,
      actions: [
        {
          label: `Apply for ${s.name}`,
          type: 'service',
          payload: s,
          icon: 'FilePlus'
        }
      ],
      followUps: ["What documents are required?", "How long does verification take?", "Lodge a complaint"]
    };
  }

  // Search in live grievances by keywords
  const matchedGrievance = grievances.find(g => 
    clean(g.title).includes(q) || 
    clean(g.description).includes(q) || 
    clean(g.location).includes(q) ||
    clean(g.department).includes(q)
  );

  if (matchedGrievance) {
    return {
      text: `🔍 **Related Grievance in System: #${matchedGrievance.id}**\n\n` +
            `• **Issue:** ${matchedGrievance.title}\n` +
            `• **Status:** **${matchedGrievance.status}** (${matchedGrievance.priority} Priority)\n` +
            `• **Department:** ${matchedGrievance.department}\n` +
            `• **Location:** ${matchedGrievance.location || 'Municipal Area'}\n` +
            `• **Assigned Officer:** ${matchedGrievance.assignedOfficer || 'Pending Dispatch'}\n\n` +
            `Would you like to track this complaint or report a similar problem in your locality?`,
      actions: [
        {
          label: `Inspect #${matchedGrievance.id}`,
          type: 'track',
          payload: matchedGrievance.id,
          icon: 'Search'
        },
        {
          label: '+ Lodge Similar Grievance',
          type: 'lodge',
          payload: { category: matchedGrievance.category, department: matchedGrievance.department },
          icon: 'FilePlus'
        }
      ],
      followUps: ["How to escalate this issue?", "Track another ticket", "Call helpline"]
    };
  }

  // Comprehensive, intelligent civic fallback
  return {
    text: `I understand you are asking about **"${rawQuery}"**.\n\n` +
          `As your JanSeva Civic Assistant, I can help you with:\n\n` +
          `• 🔍 **Ticket Tracking:** Provide your Ticket ID (e.g. \`GRV-2026-8910\` or \`APP-2026-1049\`) for real-time officer dispatch status.\n` +
          `• 📜 **Public Services:** Ask about requirements, fees, and SLAs for Birth/Death Certificates, Water Connections, Trade Licenses, Property Tax/Mutation, LPG Gas, Electricity, or Pensions.\n` +
          `• ⚠️ **Civic Issue Reporting:** Describe potholes, water leaks, sewer overflows, uncollected trash, or broken streetlights to get auto-categorized assistance.\n` +
          `• ⚖️ **SLA Escalations:** Learn about automated commissioner escalations, disciplinary reviews, and 7-day re-opening windows.\n\n` +
          `Choose one of the quick options below or clarify your query:`,
    actions: [
      {
        label: '+ Lodge Grievance',
        type: 'lodge',
        icon: 'FilePlus'
      },
      {
        label: 'Browse Public Services',
        type: 'navigate-services',
        icon: 'Layers'
      },
      {
        label: 'Track Status by ID',
        type: 'navigate-track',
        icon: 'Search'
      },
      {
        label: 'Call 24x7 Helpline',
        type: 'helpline',
        icon: 'PhoneCall'
      }
    ],
    followUps: [
      "Track ticket #GRV-2026-8910",
      "Birth certificate documents & fee?",
      "How to apply for water connection?",
      "Report road pothole"
    ]
  };
}

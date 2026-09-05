import React, { createContext, useContext, useState, useEffect } from 'react';

const DICTIONARY = {
  en: {
    brandTagline: 'GOV PORTAL',
    brandSubtitle: 'Public Services & Grievance Governance',
    searchPlaceholder: 'Search grievances, service IDs, or FAQs...',
    citizenPortal: 'Citizen',
    adminPortal: 'Official Admin',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    lodgeGrievance: 'Lodge Grievance',
    overviewTab: 'Dashboard Overview',
    servicesTab: 'Public Services Catalog',
    trackTab: 'Track Status & Resolution',
    faqsTab: 'Knowledge Base & AI Guide',
    slaCompliance: 'SLA Compliance Rate',
    resolvedThisMonth: 'Cases Resolved This Month',
    totalLodged: 'Total Lodged',
    inProgress: 'In Progress',
    resolvedCases: 'Successfully Resolved',
    urgentAlerts: 'Urgent Alerts',
    popularServices: 'Popular Public Services',
    applyNow: 'Apply Now',
    recentSubmissions: 'Grievance Tracking & Redressal Stream',
    allWards: 'All Wards',
    mySubmissions: 'My Submissions',
    allStatuses: 'All Statuses',
    trackProgress: 'Track Progress & Timeline',
    needEscalation: 'Need Immediate Escalation?',
    helpline: '24x7 Citizen Helpline: 1800-425-GOV',
    nodalOfficerControl: 'Nodal Officer Control Dashboard',
    publicGovernanceCenter: 'Public Service Delivery Governance Center',
    governanceSubtitle: 'Real-time grievance routing, officer dispatch, SLA tracking, and resolution oversight.',
    exportCSV: 'Export CSV Summary Report',
    exportAudit: 'Print Audit Summary',
    awaitingReview: 'Awaiting Review',
    activeInField: 'Active In Field',
    urgentEscalations: 'Urgent Escalations',
    departmentWorkload: 'Department Grievance Workload Breakdown',
    slaTatScorecard: 'Department SLA Turnaround Time (TAT) Scorecard',
    manageTickets: 'Manage Grievance Tickets',
    manageTicketsSub: 'Assign officers, update status, inspect IPFS evidence, and attach official resolution notes',
    serviceAppsQueue: 'Citizen Public Service Applications Queue',
    serviceAppsQueueSub: 'Review citizen welfare applications, verify identity proofs, and issue approvals',
    grievancesQueue: 'Grievance Tickets Queue',
    serviceApps: 'Public Service Applications',
    langName: 'English'
  },
  hi: {
    brandTagline: 'सरकारी पोर्टल',
    brandSubtitle: 'सार्वजनिक सेवा वितरण एवं नागरिक शिकायत निवारण प्रणाली',
    searchPlaceholder: 'शिकायत, सेवा आईडी या प्रश्न खोजें...',
    citizenPortal: 'नागरिक पोर्टल',
    adminPortal: 'अधिकारी नियंत्रण कक्ष',
    signIn: 'लॉग इन करें',
    signOut: 'लॉग आउट',
    lodgeGrievance: 'नई शिकायत दर्ज करें',
    overviewTab: 'डैशबोर्ड अवलोकन',
    servicesTab: 'सार्वजनिक सेवाएँ',
    trackTab: 'स्थिति और समाधान ट्रैक करें',
    faqsTab: 'सहायता एवं एआई गाइड',
    slaCompliance: 'एसएलए अनुपालन दर',
    resolvedThisMonth: 'इस माह हल किए गए मामले',
    totalLodged: 'कुल दर्ज शिकायतें',
    inProgress: 'प्रगति पर',
    resolvedCases: 'सफलतापूर्वक हल',
    urgentAlerts: 'आपातकालीन अलर्ट',
    popularServices: 'लोकप्रिय सार्वजनिक सेवाएँ',
    applyNow: 'आवेदन करें',
    recentSubmissions: 'नागरिक शिकायत निवारण सूची',
    allWards: 'सभी वार्ड',
    mySubmissions: 'मेरी शिकायतें',
    allStatuses: 'सभी स्थितियाँ',
    trackProgress: 'स्थिति और समयरेखा देखें',
    needEscalation: 'तत्काल सहायता चाहिए?',
    helpline: '24x7 नागरिक हेल्पलाइन: 1800-425-GOV',
    nodalOfficerControl: 'नोडल अधिकारी नियंत्रण कक्ष',
    publicGovernanceCenter: 'लोक सेवा वितरण एवं शासन केंद्र',
    governanceSubtitle: 'वास्तविक समय शिकायत रूटिंग, अधिकारी प्रेषण, एसएलए ट्रैकिंग और समाधान निरीक्षण।',
    exportCSV: 'सीएसवी सारांश रिपोर्ट निर्यात करें',
    exportAudit: 'ऑडिट सारांश प्रिंट करें',
    awaitingReview: 'समीक्षाधीन',
    activeInField: 'फील्ड में सक्रिय',
    urgentEscalations: 'अति आवश्यक मामले',
    departmentWorkload: 'विभागवार शिकायत कार्यभार विवरण',
    slaTatScorecard: 'विभागीय एसएलए टर्नअराउंड समय (टीएटी) स्कोरकार्ड',
    manageTickets: 'शिकायत टिकट प्रबंधित करें',
    manageTicketsSub: 'अधिकारी नियुक्त करें, स्थिति अपडेट करें, आईपीएफएस साक्ष्य जांचें और आधिकारिक नोट जोड़ें',
    serviceAppsQueue: 'नागरिक लोक सेवा आवेदन कतार',
    serviceAppsQueueSub: 'नागरिक कल्याण आवेदनों की समीक्षा करें और स्वीकृतियां जारी करें',
    grievancesQueue: 'शिकायत टिकट कतार',
    serviceApps: 'लोक सेवा आवेदन',
    langName: 'हिंदी'
  },
  kn: {
    brandTagline: 'ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್',
    brandSubtitle: 'ಸಾರ್ವಜನಿಕ ಸೇವಾ ವಿತರಣೆ ಮತ್ತು ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ನಿರ್ವಹಣೆ',
    searchPlaceholder: 'ದೂರುಗಳು, ಸೇವಾ ಐಡಿ ಅಥವಾ ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಡುಕಿ...',
    citizenPortal: 'ನಾಗರಿಕ ಪೋರ್ಟಲ್',
    adminPortal: 'ಅಧಿಕಾರಿ ನಿಯಂತ್ರಣ ಕೊಠಡಿ',
    signIn: 'ಸೈನ್ ಇನ್',
    signOut: 'ಸೈನ್ ಔಟ್',
    lodgeGrievance: 'ಹೊಸ ದೂರು ದಾಖಲಿಸಿ',
    overviewTab: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನ',
    servicesTab: 'ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು',
    trackTab: 'ಸ್ಥಿತಿ ಮತ್ತು ಪ್ರಗತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    faqsTab: 'ಸಹಾಯ ಮತ್ತು AI ಮಾರ್ಗದರ್ಶಿ',
    slaCompliance: 'SLA ಅನುಸರಣಾ ದರ',
    resolvedThisMonth: 'ಈ ತಿಂಗಳು ಪರಿಹರಿಸಲಾದ ಪ್ರಕರಣಗಳು',
    totalLodged: 'ಒಟ್ಟು ದಾಖಲಾದ ದೂರುಗಳು',
    inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    resolvedCases: 'ಯಶಸ್ವಿಯಾಗಿ ಪರಿಹರಿಸಲಾಗಿದೆ',
    urgentAlerts: 'ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು',
    popularServices: 'ಜನಪ್ರಿಯ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು',
    applyNow: 'ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    recentSubmissions: 'ದೂರುಗಳ ಟ್ರ್ಯಾಕಿಂಗ್ ಪಟ್ಟಿ',
    allWards: 'ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳು',
    mySubmissions: 'ನನ್ನ ದೂರುಗಳು',
    allStatuses: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    trackProgress: 'ಪ್ರಗತಿ ಮತ್ತು ಸಮಯರೇಖೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    needEscalation: 'ತುರ್ತು ಸಹಾಯ ಬೇಕೇ?',
    helpline: '24x7 ನಾಗರಿಕ ಸಹಾಯವಾಣಿ: 1800-425-GOV',
    nodalOfficerControl: 'ನೋಡಲ್ ಅಧಿಕಾರಿ ನಿಯಂತ್ರಣ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    publicGovernanceCenter: 'ಸಾರ್ವಜನಿಕ ಸೇವಾ ವಿತರಣಾ ಆಡಳಿತ ಕೇಂದ್ರ',
    governanceSubtitle: 'ನೈಜ-ಸಮಯದ ದೂರು ವರ್ಗಾವಣೆ, ಅಧಿಕಾರಿ ನಿಯೋಜನೆ ಮತ್ತು SLA ಪರಿಹಾರ ಮೇಲ್ವಿಚಾರಣೆ.',
    exportCSV: 'CSV ಸಾರಾಂಶ ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    exportAudit: 'ಆಡಿಟ್ ಸಾರಾಂಶ ಮುದ್ರಿಸಿ',
    awaitingReview: 'ಪರಿಶೀಲನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ',
    activeInField: 'ಕ್ಷೇತ್ರದಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ',
    urgentEscalations: 'ತುರ್ತು ಪ್ರಕರಣಗಳು',
    departmentWorkload: 'ಇಲಾಖಾವಾರು ದೂರುಗಳ ಕಾರ್ಯಭಾರ ವಿವರ',
    slaTatScorecard: 'ಇಲಾಖಾ SLA ಟರ್ನ್‌ಅರೌಂಡ್ ಸಮಯ (TAT) ಸ್ಕೋರ್‌ಕಾರ್ಡ್',
    manageTickets: 'ದೂರು ಟಿಕೆಟ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    manageTicketsSub: 'ಅಧಿಕಾರಿಗಳನ್ನು ನಿಯೋಜಿಸಿ, ಸ್ಥಿತಿ ನವೀಕರಿಸಿ ಮತ್ತು IPFS ಪುರಾವೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    serviceAppsQueue: 'ಸಾರ್ವಜನಿಕ ಸೇವಾ ಅರ್ಜಿಗಳ ಸಾಲು',
    serviceAppsQueueSub: 'ನಾಗರಿಕ ಅರ್ಜಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನೀಡಿ',
    grievancesQueue: 'ದೂರುಗಳ ಟಿಕೆಟ್ ಸಾಲು',
    serviceApps: 'ಸಾರ್ವಜನಿಕ ಸೇವಾ ಅರ್ಜಿಗಳು',
    langName: 'ಕನ್ನಡ'
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('janseva_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('janseva_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => {
      if (prev === 'en') return 'hi';
      if (prev === 'hi') return 'kn';
      return 'en';
    });
  };

  const t = (key) => {
    return DICTIONARY[lang]?.[key] || DICTIONARY['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

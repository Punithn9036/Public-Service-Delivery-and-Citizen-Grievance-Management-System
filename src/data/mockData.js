// Mock data for Public Service Delivery and Citizen Grievance Management System

export const INITIAL_SERVICES = [
  {
    id: 'srv-1',
    name: 'Issue of Birth Certificate',
    department: 'Revenue & Vital Statistics',
    description: 'Application for official birth registration and legal birth certificate issuance.',
    slaDays: 7,
    fee: '₹50',
    icon: 'FileText',
    category: 'Certificates',
    documentsNeeded: ['Hospital Birth Card', 'Parents Aadhaar ID', 'Address Proof'],
    popular: true
  },
  {
    id: 'srv-2',
    name: 'New Water & Sewerage Connection',
    department: 'Water Supply & Sanitation',
    description: 'Request for residential or commercial piped water supply tap & sewerage line installation.',
    slaDays: 14,
    fee: '₹1,200',
    icon: 'Droplets',
    category: 'Utilities',
    documentsNeeded: ['Property Ownership Copy', 'Tax Receipt', 'Applicant ID Proof'],
    popular: true
  },
  {
    id: 'srv-3',
    name: 'Trade License Renewal',
    department: 'Commercial & Trade Licensing',
    description: 'Annual renewal of municipal trade operating license for shops, offices and enterprises.',
    slaDays: 5,
    fee: '₹850',
    icon: 'Building2',
    category: 'Business',
    documentsNeeded: ['Previous License Copy', 'GST Registration', 'Property Lease Agreement'],
    popular: false
  },
  {
    id: 'srv-4',
    name: 'Income & Caste Certificate',
    department: 'Revenue & Land Records',
    description: 'Issuance of certified income and caste eligibility certificate for government schemes.',
    slaDays: 10,
    fee: '₹30',
    icon: 'Award',
    category: 'Certificates',
    documentsNeeded: ['Ration Card', 'Self-Declaration Affidavit', 'Salary/Income Slip'],
    popular: true
  },
  {
    id: 'srv-5',
    name: 'Property Tax Assessment & Transfer',
    department: 'Revenue & Taxation',
    description: 'Assessment of property tax liability, ownership name change, and record update.',
    slaDays: 15,
    fee: '₹500',
    icon: 'Home',
    category: 'Taxation',
    documentsNeeded: ['Sale Deed / Title Document', 'Encumbrance Certificate', 'Previous Tax Receipts'],
    popular: false
  },
  {
    id: 'srv-6',
    name: 'Street Light & Infrastructure Maintenance',
    department: 'Public Works & Infrastructure',
    description: 'Request installation of new LED street lamps or public amenity repairs.',
    slaDays: 3,
    fee: 'Free',
    icon: 'Zap',
    category: 'Infrastructure',
    documentsNeeded: ['Locality Request Letter / Ward Member Endorsement'],
    popular: false
  }
];

export const INITIAL_GRIEVANCES = [
  {
    id: 'GRV-2026-8910',
    title: 'Damaged Drainage Overflow on Main Market Road',
    category: 'Sanitation & Waste Management',
    department: 'Water Supply & Sanitation',
    description: 'Raw sewage and drainage water is overflowing near Shop #42 on Main Market Road, causing severe health hazards and bad odor.',
    location: 'Sector 4, Main Market Road, Ward 12',
    landmark: 'Opposite Central Pharmacy',
    priority: 'Urgent',
    status: 'In Progress',
    citizenName: 'Aarav Sharma',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'aarav.sharma@example.com',
    createdAt: '2026-08-16T10:30:00Z',
    updatedAt: '2026-08-18T14:20:00Z',
    assignedOfficer: 'Er. Rajesh Varma (Senior Sanitation Engineer)',
    assignedOfficerContact: '+91 94433 11223',
    slaDeadline: '2026-08-19T10:30:00Z',
    timeline: [
      { status: 'Submitted', timestamp: '2026-08-16T10:30:00Z', note: 'Grievance submitted by citizen via JanSeva Portal.' },
      { status: 'Under Review', timestamp: '2026-08-16T11:15:00Z', note: 'Validated by Control Room Officer.' },
      { status: 'Assigned', timestamp: '2026-08-17T09:00:00Z', note: 'Assigned to Ward 12 Sanitation Team lead Er. Rajesh Varma.' },
      { status: 'In Progress', timestamp: '2026-08-18T14:20:00Z', note: 'Dredging machine dispatched to site for blockage removal.' }
    ],
    feedback: null
  },
  {
    id: 'GRV-2026-8904',
    title: 'Non-Functional Street Lights along Green Park Boulevard',
    category: 'Electrical & Infrastructure',
    department: 'Public Works & Infrastructure',
    description: 'Over 8 consecutive streetlights have been completely dark for 5 days, leading to safety issues for women and elderly walking at night.',
    location: 'Green Park Boulevard, Block B, Ward 8',
    landmark: 'Near Community Park Gate 2',
    priority: 'High',
    status: 'Assigned',
    citizenName: 'Priya Sundaram',
    citizenPhone: '+91 98112 33445',
    citizenEmail: 'priya.sundaram@example.com',
    createdAt: '2026-08-17T18:45:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
    assignedOfficer: 'Vikram Singh (Assistant Electrical Inspector)',
    assignedOfficerContact: '+91 98700 55443',
    slaDeadline: '2026-08-20T18:45:00Z',
    timeline: [
      { status: 'Submitted', timestamp: '2026-08-17T18:45:00Z', note: 'Grievance lodged online.' },
      { status: 'Under Review', timestamp: '2026-08-17T19:30:00Z', note: 'Categorized under Municipal Electrical Grid.' },
      { status: 'Assigned', timestamp: '2026-08-18T10:00:00Z', note: 'Field technician team dispatched for LED replacement.' }
    ],
    feedback: null
  },
  {
    id: 'GRV-2026-8850',
    title: 'Uncollected Solid Waste & Garbage Accumulation',
    category: 'Sanitation & Waste Management',
    department: 'Health & Hygiene',
    description: 'Municipal garbage collection van has skipped Block 3 for 4 days. Waste bins are spilling onto the road.',
    location: 'Sunrise Apartments Lane, Ward 15',
    landmark: 'Behind Government Primary School',
    priority: 'Medium',
    status: 'Resolved',
    citizenName: 'Mohammed Tanvir',
    citizenPhone: '+91 97654 88990',
    citizenEmail: 'tanvir.m@example.com',
    createdAt: '2026-08-14T08:15:00Z',
    updatedAt: '2026-08-15T16:30:00Z',
    assignedOfficer: 'Smt. Kavitha Reddi (Chief Hygiene Inspector)',
    assignedOfficerContact: '+91 94411 99887',
    slaDeadline: '2026-08-17T08:15:00Z',
    timeline: [
      { status: 'Submitted', timestamp: '2026-08-14T08:15:00Z', note: 'Grievance submitted with photo evidence.' },
      { status: 'Under Review', timestamp: '2026-08-14T09:00:00Z', note: 'Flagged for immediate sanitary supervisor route inspection.' },
      { status: 'Assigned', timestamp: '2026-08-14T11:30:00Z', note: 'Assigned to Sanitary Inspector Ward 15.' },
      { status: 'In Progress', timestamp: '2026-08-15T11:00:00Z', note: 'Special waste compacting truck routed.' },
      { status: 'Resolved', timestamp: '2026-08-15T16:30:00Z', note: 'Garbage cleared and area disinfected with bleaching powder. Verified by supervisor.' }
    ],
    feedback: {
      rating: 5,
      comment: 'Prompt response and total cleanup done within 36 hours. Very satisfied!'
    }
  },
  {
    id: 'GRV-2026-8791',
    title: 'Hazardous Pothole near Metro Station Exit 2',
    category: 'Roads & Transport',
    department: 'Public Works & Infrastructure',
    description: 'A deep pothole (2 feet diameter) on the fast lane of Station Road poses grave danger to two-wheeler riders.',
    location: 'Station Road Metro Gate 2, Ward 4',
    landmark: 'Under Metro Pillar #114',
    priority: 'Urgent',
    status: 'Under Review',
    citizenName: 'Ramesh Patel',
    citizenPhone: '+91 99001 22334',
    citizenEmail: 'ramesh.p@example.com',
    createdAt: '2026-08-18T22:10:00Z',
    updatedAt: '2026-08-19T07:30:00Z',
    assignedOfficer: 'Pending Assignment',
    assignedOfficerContact: 'N/A',
    slaDeadline: '2026-08-21T22:10:00Z',
    timeline: [
      { status: 'Submitted', timestamp: '2026-08-18T22:10:00Z', note: 'Grievance logged by citizen.' },
      { status: 'Under Review', timestamp: '2026-08-19T07:30:00Z', note: 'Forwarded to PWD Highway Division.' }
    ],
    feedback: null
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 'APP-2026-1049',
    serviceId: 'srv-1',
    serviceName: 'Issue of Birth Certificate',
    applicantName: 'Ananya Deshmukh',
    applicantEmail: 'ananya.d@example.com',
    applicantPhone: '+91 98888 12345',
    appliedDate: '2026-08-15',
    status: 'Approved',
    slaDays: 7,
    estimatedCompletion: '2026-08-22',
    remarks: 'Documents verified by Registrar. Certificate issued in digital format.'
  },
  {
    id: 'APP-2026-1092',
    serviceId: 'srv-2',
    serviceName: 'New Water & Sewerage Connection',
    applicantName: 'Suresh Kumar',
    applicantEmail: 'suresh.k@example.com',
    applicantPhone: '+91 97777 54321',
    appliedDate: '2026-08-17',
    status: 'In Verification',
    slaDays: 14,
    estimatedCompletion: '2026-08-31',
    remarks: 'Field engineer scheduled for site feasibility inspection on 2026-08-20.'
  }
];

export const FAQ_ARTICLES = [
  {
    id: 'faq-1',
    question: 'How do I track the real-time status of my submitted grievance?',
    category: 'Grievances',
    answer: 'You can use the "Track Request" tab on the top menu and enter your unique Tracking ID (e.g. GRV-2026-8910). You will see a detailed timeline with assigned officer details and resolution notes.'
  },
  {
    id: 'faq-2',
    question: 'What is the standard SLA (Service Level Agreement) for resolving urgent issues?',
    category: 'Policy & SLAs',
    answer: 'Urgent issues like sewer overflow or dangerous road hazards have a strict 24-72 hour SLA. High priority issues are addressed within 3-5 working days, and general inquiries within 7-10 days.'
  },
  {
    id: 'faq-3',
    question: 'What documents are required to apply for a Birth Certificate online?',
    category: 'Public Services',
    answer: 'You will need: (1) Hospital discharge summary/Birth card, (2) Aadhaar IDs of both parents, and (3) Proof of residence in the municipal area.'
  },
  {
    id: 'faq-4',
    question: 'Can I re-open a grievance if I am not satisfied with the resolution?',
    category: 'Grievances',
    answer: 'Yes! If a ticket is marked Resolved but the issue persists, click "Re-open Ticket" on the tracking page within 7 days of resolution to escalate to the Nodal Grievance Officer.'
  }
];

export const DEPARTMENTS = [
  'Water Supply & Sanitation',
  'Public Works & Infrastructure',
  'Health & Hygiene',
  'Revenue & Taxation',
  'Commercial & Trade Licensing',
  'Electrical & Infrastructure',
  'Town Planning & Environment'
];

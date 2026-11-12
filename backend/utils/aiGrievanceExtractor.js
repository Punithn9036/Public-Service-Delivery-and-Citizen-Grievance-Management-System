// backend/utils/aiGrievanceExtractor.js
// Multilingual Civic Voice/Text Slot Extractor & Auto-Triage Engine
// Runs deterministically out of the box with optional Gemini/OpenAI multimodal upgrade when env keys are configured.

const DEPARTMENT_PROFILES = [
  {
    department: 'Water Supply & Sanitation',
    category: 'Water & Drainage',
    defaultTitle: 'Water Supply / Drainage Fault',
    keywords: [
      'water', 'pipeline', 'pipe', 'leak', 'leaking', 'burst', 'drain', 'drainage',
      'sewer', 'sewage', 'overflow', 'manhole', 'borewell', 'tap', 'drinking water',
      'dirty water', 'contaminated', 'supply', 'flooded drain', 'paani', 'naala', 'naali',
      'neeru', 'thanni', 'tanker'
    ]
  },
  {
    department: 'Public Works & Infrastructure',
    category: 'Roads & Infrastructure',
    defaultTitle: 'Road Damage / Pothole Issue',
    keywords: [
      'pothole', 'road', 'asphalt', 'crater', 'footpath', 'pavement', 'bridge',
      'culvert', 'divider', 'speed breaker', 'sidewalk', 'broken road', 'road damaged',
      'road cave', 'sinkhole', 'tar', 'gaddha', 'khadda', 'sadak', 'raste', 'junction'
    ]
  },
  {
    department: 'Electrical & Infrastructure',
    category: 'Electricity & Streetlights',
    defaultTitle: 'Streetlight / Electrical Grid Fault',
    keywords: [
      'streetlight', 'street light', 'lamp', 'pole', 'dark road', 'no light', 'light not working',
      'bulb', 'led', 'wire', 'live wire', 'spark', 'sparking', 'transformer', 'short circuit',
      'power cut', 'blackout', 'electric', 'electricity', 'shock', 'feeder', 'bijli', 'batti', 'khamba'
    ]
  },
  {
    department: 'Health & Hygiene',
    category: 'Sanitation & Waste Management',
    defaultTitle: 'Sanitation & Solid Waste Hazard',
    keywords: [
      'garbage', 'trash', 'waste', 'dustbin', 'dump', 'dumping', 'rubbish', 'clean', 'cleaning',
      'sweeping', 'sanitation', 'hygiene', 'smell', 'foul smell', 'stink', 'mosquito', 'dengue',
      'malaria', 'fogging', 'dead animal', 'carcass', 'stray', 'hospital', 'clinic', 'kachra', 'kooda'
    ]
  },
  {
    department: 'Revenue & Taxation',
    category: 'Revenue & Property Tax',
    defaultTitle: 'Property Tax / Revenue Record Request',
    keywords: [
      'property tax', 'tax', 'khata', 'e-khata', 'patta', 'mutation', 'land record',
      'assessment', 'birth certificate', 'death certificate', 'income certificate', 'caste certificate',
      'registrar', 'revenue', 'survey number'
    ]
  },
  {
    department: 'Commercial & Trade Licensing',
    category: 'Trade & Licensing',
    defaultTitle: 'Commercial Licensing / Market Compliance Issue',
    keywords: [
      'trade license', 'shop license', 'commercial', 'vendor', 'hawker', 'illegal stall',
      'market stall', 'business permit', 'signage', 'hoarding', 'unlicensed', 'dukaan'
    ]
  },
  {
    department: 'Town Planning & Environment',
    category: 'Parks & Town Planning',
    defaultTitle: 'Park / Tree / Urban Encroachment Issue',
    keywords: [
      'tree', 'fallen tree', 'branch', 'park', 'garden', 'playground', 'encroachment',
      'illegal construction', 'building violation', 'setback', 'debris', 'smoke', 'air pollution',
      'noise pollution', 'green belt'
    ]
  }
];

const URGENT_TERMS = [
  'urgent', 'immediately', 'emergency', 'flood', 'flooding', 'danger', 'dangerous',
  'hazardous', 'hazard', 'shock', 'live wire', 'sparking', 'fire', 'accident', 'injured',
  'collapse', 'collapsing', 'dead animal', 'carcass', 'contaminated', 'toxic', 'burst',
  'raw sewage', 'open manhole', 'hospital emergency', 'school children', 'jaldi', 'turant'
];

const HIGH_TERMS = [
  'high priority', 'severe', 'major', 'huge', 'big', 'blocked', 'overflowing',
  'completely dark', 'darkness', 'broken', 'damaged', 'smelling', 'stinking',
  'days', 'week', 'since morning', 'traffic jam', 'risk', 'unsafe'
];

const CONFIRM_RE = /\b(yes|confirm|submit|register|file it|send it|go ahead|proceed|approve|haan|ha|ok submit|auto file|do it)\b/i;
const CANCEL_RE = /\b(cancel|discard|stop|abort|never mind|clear|reset|mat bhejo|band karo)\b/i;
const FILE_NEW_RE = /\b(file new|new ticket|submit new|create new|ignore duplicate|different grievance|different complaint|different issue|lodge different|distinct issue|another issue|not this)\b/i;
const GRIEVANCE_ACTION_RE = /\b(report|lodge|file|register|complain|complaint|grievance|issue|problem|broken|damaged|leaking|overflow|pothole|garbage|dark|streetlight|drain|sewer|water|pipe|tree|kachra|paani|gaddha|bijli)\b/i;

function normalizeWhitespace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function capitalizeSentence(text) {
  const clean = normalizeWhitespace(text);
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Extracts Indian 10-digit phone numbers spoken or typed in transcript.
 */
function extractPhoneFromText(text) {
  const digitsCollapsed = String(text || '').replace(/(?<=\d)[\s-]+(?=\d)/g, '');
  const match = digitsCollapsed.match(/(?:\+?91)?([6-9]\d{9})\b/);
  if (!match) return '';
  return `+91 ${match[1].slice(0, 5)} ${match[1].slice(5)}`;
}

/**
 * Extracts explicit landmark hint phrases (e.g. "near Gate 2", "opposite City Hospital").
 */
function extractLandmarkHint(text) {
  const clean = normalizeWhitespace(text);
  const match = clean.match(/\b(?:near|opposite|opp\.?|behind|beside|in front of|next to|at)\s+([a-z0-9\s,'-]{3,45}?)(?=(?:\s+(?:since|because|and|for|urgent|please|which|is|are|has|have)|[,.!?]|$))/i);
  return match ? capitalizeSentence(match[1]) : '';
}

/**
 * Detects civic department profile using weighted keyword scoring.
 */
function classifyDepartmentAndCategory(text) {
  const lower = String(text || '').toLowerCase();
  let bestProfile = null;
  let bestScore = 0;
  let bestKeywords = [];

  for (const profile of DEPARTMENT_PROFILES) {
    let score = 0;
    const hits = [];
    for (const kw of profile.keywords) {
      if (lower.includes(kw)) {
        // Multi-word matches carry slightly higher specificity weight
        score += kw.includes(' ') ? 3 : 2;
        hits.push(kw);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
      bestKeywords = hits;
    }
  }

  if (!bestProfile) {
    return {
      matched: false,
      department: 'Public Works & Infrastructure',
      category: 'Roads & Infrastructure',
      defaultTitle: 'Municipal Civic Issue Report',
      extractedKeywords: [],
      confidence: 0.35
    };
  }

  return {
    matched: true,
    department: bestProfile.department,
    category: bestProfile.category,
    defaultTitle: bestProfile.defaultTitle,
    extractedKeywords: Array.from(new Set(bestKeywords)),
    confidence: Math.min(0.98, 0.55 + bestScore * 0.08)
  };
}

/**
 * Computes priority level from urgency cues.
 */
function detectPriority(text) {
  const lower = String(text || '').toLowerCase();
  if (URGENT_TERMS.some(term => lower.includes(term))) return 'Urgent';
  if (HIGH_TERMS.some(term => lower.includes(term))) return 'High';
  return 'Medium';
}

/**
 * Generates a concise municipal ticket subject line from natural speech/text.
 */
function synthesizeTitle(transcript, classification, locationHint = '') {
  let clean = normalizeWhitespace(transcript)
    .replace(/^(?:hello|hi|hey|namaste|please|can you|i want to|i would like to|kindly)\s+/i, '')
    .replace(/^(?:lodge|file|register|report|submit)\s+(?:a\s+)?(?:new\s+)?(?:grievance|complaint|issue|problem)(?:\s+about|\s+for|\s+regarding|\s+that)?\s*/i, '')
    .trim();

  // Take first clause before "because" / sentence break
  const firstClause = clean.split(/[.!?]/)[0].trim();

  if (firstClause.length >= 10 && firstClause.length <= 68) {
    return capitalizeSentence(firstClause);
  }

  if (firstClause.length > 68) {
    return capitalizeSentence(firstClause.slice(0, 65).replace(/\s+\S*$/, '')) + '...';
  }

  const shortLoc = String(locationHint || '').split(',')[0].trim();
  if (shortLoc) {
    return `${classification.defaultTitle} — ${shortLoc}`.slice(0, 72);
  }
  return classification.defaultTitle;
}

/**
 * Main deterministic voice/text slot extraction helper.
 */
function extractGrievanceFromText({
  transcript = '',
  location = '',
  ocrAddressText = '',
  existingDraft = null
} = {}) {
  const raw = normalizeWhitespace(transcript);
  const lower = raw.toLowerCase();

  let intent = 'CHAT_QUERY';
  if (CANCEL_RE.test(lower)) {
    intent = 'CANCEL';
  } else if (FILE_NEW_RE.test(lower)) {
    intent = 'FILE_NEW';
  } else if (CONFIRM_RE.test(lower) && raw.split(/\s+/).length <= 8) {
    intent = 'CONFIRM';
  } else if (GRIEVANCE_ACTION_RE.test(lower) || existingDraft?.active) {
    intent = 'AUTO_GRIEVANCE';
  }

  const combinedForTriage = `${raw} ${existingDraft?.description || ''} ${existingDraft?.title || ''}`.trim();
  const classification = classifyDepartmentAndCategory(combinedForTriage);
  const priority = detectPriority(combinedForTriage);
  const phoneFound = extractPhoneFromText(raw);
  const landmarkHint = extractLandmarkHint(raw);
  const effectiveLocation = location || ocrAddressText || existingDraft?.location || '';

  const isSubstantiveIssueText =
    raw.length >= 6 &&
    intent !== 'CONFIRM' &&
    intent !== 'CANCEL' &&
    !/^(?:report|lodge|file|register)\s+(?:a\s+)?(?:new\s+)?(?:grievance|complaint)$/i.test(raw);

  const description = isSubstantiveIssueText
    ? (existingDraft?.description && !existingDraft.description.includes(raw)
        ? `${existingDraft.description} ${capitalizeSentence(raw)}`.trim()
        : capitalizeSentence(raw))
    : (existingDraft?.description || '');

  const title = isSubstantiveIssueText
    ? synthesizeTitle(description, classification, effectiveLocation)
    : (existingDraft?.title || '');

  return {
    intent,
    transcript: raw,
    title,
    description,
    department: classification.matched
      ? classification.department
      : (existingDraft?.department || classification.department),
    category: classification.matched
      ? classification.category
      : (existingDraft?.category || classification.category),
    priority: priority !== 'Medium' ? priority : (existingDraft?.priority || 'Medium'),
    landmarkHint: landmarkHint || existingDraft?.landmarkHint || '',
    citizenPhone: phoneFound || existingDraft?.citizenPhone || '',
    confidence: classification.confidence,
    matchedKeywords: classification.matched,
    extractedKeywords: Array.from(new Set([
      ...(classification.extractedKeywords || []),
      ...URGENT_TERMS.filter(t => combinedForTriage.toLowerCase().includes(t)),
      ...HIGH_TERMS.filter(t => combinedForTriage.toLowerCase().includes(t))
    ]))
  };
}

/**
 * Optional Cloud Multimodal Extraction (Gemini or OpenAI) when configured in backend env.
 * Automatically falls back to deterministic extraction if no key is configured or call fails.
 */
async function extractWithCloudAIIfConfigured({
  audioBuffer = null,
  audioMimeType = 'audio/webm',
  transcript = '',
  location = '',
  ocrAddressText = '',
  lang = 'en',
  existingDraft = null
} = {}) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && typeof fetch === 'function' && (audioBuffer || transcript)) {
    try {
      const parts = [
        {
          text:
            `You are a civic grievance intake parser for JanSeva Municipal Portal.\n` +
            `Supported Departments ONLY: ${DEPARTMENT_PROFILES.map(p => p.department).join(' | ')}.\n` +
            `Citizen language hint: ${lang}. Known GPS location: ${location || ocrAddressText || 'unknown'}.\n` +
            (transcript ? `Live speech transcript hint: "${transcript}".\n` : '') +
            `Extract strictly JSON with keys: {"transcript":string,"title":string,"description":string,"department":string,"category":string,"priority":"Low"|"Medium"|"High"|"Urgent","landmarkHint":string,"citizenPhone":string}. Return JSON only.`
        }
      ];

      if (audioBuffer && audioBuffer.length > 0) {
        parts.push({
          inlineData: {
            mimeType: (audioMimeType || 'audio/webm').split(';')[0],
            data: audioBuffer.toString('base64')
          }
        });
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
        })
      });

      if (apiRes.ok) {
        const json = await apiRes.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(rawText);
        if (parsed && parsed.title && parsed.department) {
          const validProfile = DEPARTMENT_PROFILES.find(
            p => p.department.toLowerCase() === String(parsed.department).toLowerCase()
          );
          return {
            extractionSource: 'GEMINI_MULTIMODAL',
            sttUsed: Boolean(audioBuffer && audioBuffer.length > 0),
            extracted: {
              intent: 'AUTO_GRIEVANCE',
              transcript: parsed.transcript || transcript || parsed.description || '',
              title: normalizeWhitespace(parsed.title).slice(0, 90),
              description: normalizeWhitespace(parsed.description || parsed.transcript || transcript),
              department: validProfile ? validProfile.department : 'Public Works & Infrastructure',
              category: parsed.category || (validProfile ? validProfile.category : 'Roads & Infrastructure'),
              priority: ['Low', 'Medium', 'High', 'Urgent'].includes(parsed.priority) ? parsed.priority : 'Medium',
              landmarkHint: normalizeWhitespace(parsed.landmarkHint || ''),
              citizenPhone: parsed.citizenPhone || '',
              confidence: 0.94,
              matchedKeywords: true,
              extractedKeywords: classifyDepartmentAndCategory(parsed.description || parsed.transcript || transcript).extractedKeywords || []
            }
          };
        }
      }
    } catch (cloudErr) {
      console.warn('[AI Extractor Notice] Cloud multimodal fallback to local engine:', cloudErr.message);
    }
  }

  const fallbackExtracted = extractGrievanceFromText({
    transcript,
    location,
    ocrAddressText,
    existingDraft
  });

  return {
    extractionSource: 'DETERMINISTIC_CIVIC_NLP',
    sttUsed: false,
    extracted: fallbackExtracted
  };
}

module.exports = {
  DEPARTMENT_PROFILES,
  extractGrievanceFromText,
  extractWithCloudAIIfConfigured,
  classifyDepartmentAndCategory,
  detectPriority,
  extractPhoneFromText
};

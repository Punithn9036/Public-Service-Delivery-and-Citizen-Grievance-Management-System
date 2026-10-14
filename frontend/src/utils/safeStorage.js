// frontend/src/utils/safeStorage.js
// Bulletproof LocalStorage manager with quota protection and auto-pruning

/**
 * Strips out heavy base64 file payloads or data URLs from grievance objects
 */
export function sanitizeGrievance(g) {
  if (!g || typeof g !== 'object') return g;
  const copy = { ...g };
  // Remove multi-megabyte base64 fileContent that exhausts 5MB localStorage
  if (copy.fileContent && typeof copy.fileContent === 'string' && copy.fileContent.length > 5000) {
    delete copy.fileContent;
  }
  return copy;
}

export function sanitizeGrievances(list) {
  if (!Array.isArray(list)) return [];
  // Keep only the most recent 60 items if the list has grown excessively
  const trimmed = list.slice(0, 60);
  return trimmed.map(sanitizeGrievance);
}

/**
 * Prunes existing bloated keys from localStorage to immediately free quota
 */
export function autoPruneStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const rawGrievances = localStorage.getItem('janseva_grievances');
    if (rawGrievances) {
      // If the string itself is massive (> 500KB)
      if (rawGrievances.length > 500000 || rawGrievances.includes('data:image')) {
        const parsed = JSON.parse(rawGrievances);
        if (Array.isArray(parsed)) {
          const cleaned = sanitizeGrievances(parsed);
          localStorage.setItem('janseva_grievances', JSON.stringify(cleaned));
          console.info('[Storage Recovery] Successfully sanitized bloated janseva_grievances key.');
        }
      }
    }
  } catch (err) {
    console.warn('[Storage Recovery Notice]:', err.message);
    try {
      // If storage is so full it cannot even read or re-write, remove bloated keys safely
      localStorage.removeItem('janseva_grievances');
    } catch (e) {}
  }
}

/**
 * Safe setItem that catches QuotaExceededError and prevents runtime crashes
 */
export function safeSetItem(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  let stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  try {
    localStorage.setItem(key, stringValue);
    return true;
  } catch (err) {
    const isQuotaError = 
      err.name === 'QuotaExceededError' || 
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
      err.code === 22 || 
      err.code === 1014;

    if (isQuotaError) {
      console.warn(`[SafeStorage QuotaExceeded] Cleaning storage to save key '${key}'...`);
      try {
        // Step 1: If saving grievances, sanitize heavily
        if (key === 'janseva_grievances') {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (Array.isArray(parsed)) {
            const ultraClean = parsed.slice(0, 30).map(g => {
              const { fileContent, rawFile, ...rest } = g;
              return rest;
            });
            stringValue = JSON.stringify(ultraClean);
            localStorage.setItem(key, stringValue);
            return true;
          }
        }

        // Step 2: Remove non-critical auxiliary caches
        localStorage.removeItem('janseva_bot_position');
        localStorage.removeItem('janseva_font_scale');

        // Step 3: Retry saving with sanitized string
        localStorage.setItem(key, stringValue);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage Warning] Quota still exceeded for key '${key}', skipping localStorage write to avoid crash.`);
        return false;
      }
    }

    console.warn(`[SafeStorage Error] Failed to write key '${key}':`, err.message);
    return false;
  }
}

/**
 * Safe getItem with fallback
 */
export function safeGetItem(key, fallback = null) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;

  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[SafeStorage Warning] Failed to parse key '${key}':`, err.message);
    return fallback;
  }
}

// Run auto-pruning immediately on load
autoPruneStorage();

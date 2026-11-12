// backend/src/controllers/aiController.js
// Handles voice/audio & GPS photo evidence slot extraction for automated chatbot grievance intake.

const {
  DEPARTMENT_PROFILES,
  extractWithCloudAIIfConfigured
} = require('../../utils/aiGrievanceExtractor');

/**
 * Reports active AI intake capabilities and configured providers.
 */
const getCapabilities = (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  return res.json({
    audioUploadSupported: true,
    serverSttEnabled: hasGemini,
    provider: hasGemini ? 'gemini-multimodal' : hasOpenAI ? 'openai-configured' : 'hybrid-browser-local',
    deterministicFallback: true,
    supportedDepartments: DEPARTMENT_PROFILES.map(p => p.department),
    supportedLanguages: 13
  });
};

/**
 * Extracts structured grievance fields (title, description, department, category, priority)
 * from recorded audio clip and/or live speech transcript alongside GPS photo metadata.
 */
const extractGrievance = async (req, res) => {
  try {
    const body = req.body || {};
    const audioFile = req.files?.audio?.[0] || req.file || null;

    let existingDraft = null;
    if (body.existingDraft) {
      try {
        existingDraft = typeof body.existingDraft === 'string'
          ? JSON.parse(body.existingDraft)
          : body.existingDraft;
      } catch (e) {
        existingDraft = null;
      }
    }

    const transcript = String(body.transcript || body.text || '').trim();
    const location = String(body.location || existingDraft?.location || '').trim();
    const ocrAddressText = String(body.ocrAddressText || '').trim();
    const lang = String(body.lang || 'en').trim();

    if (!transcript && (!audioFile || audioFile.size === 0)) {
      return res.status(400).json({
        error: 'NO_INPUT_PROVIDED',
        message: 'Provide either a speech/text transcript or a recorded audio clip.'
      });
    }

    const { extractionSource, sttUsed, extracted } = await extractWithCloudAIIfConfigured({
      audioBuffer: audioFile ? audioFile.buffer : null,
      audioMimeType: audioFile ? audioFile.mimetype : 'audio/webm',
      transcript,
      location,
      ocrAddressText,
      lang,
      existingDraft
    });

    const resolvedCitizenName = String(body.citizenName || existingDraft?.citizenName || '').trim();
    const resolvedCitizenPhone = String(
      extracted.citizenPhone || body.citizenPhone || existingDraft?.citizenPhone || ''
    ).trim();

    const missingFields = [];
    if (!extracted.title || !extracted.description) missingFields.push('description');
    if (!location) missingFields.push('location');
    if (!resolvedCitizenName) missingFields.push('citizenName');
    if (!resolvedCitizenPhone) missingFields.push('citizenPhone');

    const audioUploadedWithoutTranscript = Boolean(audioFile && audioFile.size > 0 && !extracted.transcript);

    return res.json({
      success: true,
      extractionSource,
      sttUsed,
      audioReceived: Boolean(audioFile && audioFile.size > 0),
      audioBytes: audioFile ? audioFile.size : 0,
      audioMimeType: audioFile ? audioFile.mimetype : null,
      needsTranscriptInput: audioUploadedWithoutTranscript,
      extracted: {
        ...extracted,
        citizenName: resolvedCitizenName,
        citizenPhone: resolvedCitizenPhone,
        location
      },
      missingFields,
      readyToSubmit: missingFields.length === 0
    });
  } catch (err) {
    return res.status(500).json({
      error: 'AI_EXTRACTION_ERROR',
      message: err.message || 'Failed to extract grievance details.'
    });
  }
};

module.exports = {
  getCapabilities,
  extractGrievance
};

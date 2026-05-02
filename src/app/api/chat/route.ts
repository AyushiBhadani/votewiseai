import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  detectIntent,
  INTENT_SUB_PROMPTS,
  getRegistrationUrl,
  buildCacheKey,
  getCachedResponse,
  setCachedResponse,
  pruneCache,
  buildGeminiHistory,
  type ChatMessage,
} from '@/lib/aiUtils';

// ── Simple in-memory rate limiter (resets on server restart / cold start) ──
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 20;          // max requests
const RATE_WINDOW_MS = 60_000;  // per 60 seconds per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ── Allowed values (whitelist) ─────────────────────────────────────────────
const ALLOWED_COUNTRIES = new Set([
  'India','USA','UK','Australia','Canada','France','Germany',
  'Japan','Brazil','South Africa','Pakistan','Bangladesh','Sri Lanka',
]);
const ALLOWED_LANGUAGES = new Set([
  'English','Hindi','Tamil','Telugu','Bengali','Kannada','Marathi',
  'Gujarati','Urdu','French','Spanish','Arabic','German','Japanese',
  'Portuguese','Chinese',
]);
const ALLOWED_MODES = new Set(['chat', 'story']);

// ── Language instruction map ───────────────────────────────────────────────
const LANG_INSTRUCTIONS: Record<string, string> = {
  English: 'Reply in English.',
  Hindi: 'हिंदी में जवाब दें। (Reply entirely in Hindi script)',
  Tamil: 'தமிழில் பதில் சொல்லுங்கள். (Reply entirely in Tamil)',
  Telugu: 'తెలుగులో సమాధానం ఇవ్వండి. (Reply entirely in Telugu)',
  Bengali: 'বাংলায় উত্তর দিন। (Reply entirely in Bengali)',
  Kannada: 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. (Reply entirely in Kannada)',
  Urdu: 'اردو میں جواب دیں۔ (Reply entirely in Urdu)',
  Marathi: 'मराठीत उत्तर द्या. (Reply entirely in Marathi)',
  Gujarati: 'ગુજરાતીમાં જવાબ આપો. (Reply entirely in Gujarati)',
  French: 'Réponds entièrement en français.',
  Spanish: 'Responde completamente en español.',
  Arabic: 'أجب باللغة العربية فقط. (Reply entirely in Arabic)',
  German: 'Antworte vollständig auf Deutsch.',
  Japanese: '日本語で答えてください。(Reply entirely in Japanese)',
  Portuguese: 'Responda inteiramente em português.',
  Chinese: '请完全用中文回复。(Reply entirely in Chinese)',
};

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    // Prune stale cache entries periodically (low-cost housekeeping)
    pruneCache();

    // ── Parse & validate body ──────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { message, country, language, mode, history, mediaBase64, mediaMimeType } = body as {
      message: string;
      country: string;
      language: string;
      mode: string;
      history?: ChatMessage[];
      mediaBase64?: string;
      mediaMimeType?: string;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Reject messages over the 2000 char limit (security hardening)
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long. Maximum 2000 characters.' }, { status: 400 });
    }

    // Sanitize: strip HTML tags and dangerous characters
    const sanitizedMessage = message.replace(/<[^>]*>/g, '').replace(/[{}[\]`\\]/g, '').trim();
    if (!sanitizedMessage) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Whitelist country, language, mode
    const safeCountry  = ALLOWED_COUNTRIES.has(country)  ? country  : 'India';
    const safeLanguage = ALLOWED_LANGUAGES.has(language) ? language : 'English';
    const safeMode     = ALLOWED_MODES.has(mode)         ? mode     : 'chat';

    // ── Intent detection ───────────────────────────────────────
    const intent = detectIntent(sanitizedMessage);
    const intentSubPrompt = INTENT_SUB_PROMPTS[intent];

    // ── Registration link (returned in response for relevant intents) ──
    const registrationInfo = (intent === 'registration' || intent === 'eligibility')
      ? getRegistrationUrl(safeCountry)
      : null;

    // ── Cache check (skip for story mode & conversation with history) ──
    const useCache = safeMode === 'chat' && (!history || history.length === 0);
    const cacheKey = buildCacheKey(sanitizedMessage, safeCountry, safeLanguage, safeMode);

    if (useCache) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return NextResponse.json(
          { response: cached, registrationUrl: registrationInfo, cached: true },
          { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }
        );
      }
    }

    // ── API key ────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: '⚠️ [Setup Required]: Add GEMINI_API_KEY to your .env.local file.' },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const langInstruction = LANG_INSTRUCTIONS[safeLanguage] ?? 'Reply in English.';

    // ── System prompt (smarter, human-like, structured) ────────
    const systemPrompt = safeMode === 'story'
      ? `You are VoteWise Storyteller — a warm, friendly guide who explains elections through engaging stories.
RULES:
- Use relatable characters (Raju the farmer, Priya the student, a village council)
- Use 5–8 emojis per response 🎉🗳️👑🌟
- Keep stories under 250 words
- Relate the story specifically to elections in ${safeCountry}
- End with a bold key takeaway (**Key Takeaway:** ...)
- ${langInstruction}
- ${intentSubPrompt}`
      : `You are VoteWise AI — a friendly, knowledgeable, and neutral election expert for ${safeCountry}.
PERSONALITY: Warm, encouraging, and clear. Like a helpful friend who knows elections deeply.
FORMATTING RULES:
- Always start with a direct answer to the question in 1–2 sentences
- Use numbered steps (1. 2. 3.) for processes
- Use bullet points (•) for lists of facts
- Use 3–5 emojis naturally placed throughout 🗳️✅📋🌍
- Bold key terms using **term** markdown
- End longer answers with a "💡 Quick Tip:" line
- Keep answers under 300 words unless the question requires more detail
CONTENT RULES:
- Be factual, concise, and completely bias-free
- Never recommend candidates or parties
- Cite official sources or authorities when relevant (e.g., "According to the Election Commission of India...")
- Use the googleSearch tool to find up-to-date information, news, and maps for the CURRENT YEAR
- Handle greetings warmly and offer to help with specific topics
CONTEXT: User is asking about elections in ${safeCountry} in ${safeLanguage}.
INTENT GUIDANCE: ${intentSubPrompt}
LANGUAGE: ${langInstruction}`;

    // ── Build multi-turn conversation history ──────────────────
    const conversationHistory = buildGeminiHistory(
      (history ?? []).filter(m => m.role === 'user' || m.role === 'assistant'),
      10
    );

    // ── Generate main response ─────────────────────────────────
    let responseText: string;

    if (conversationHistory.length > 0) {
      // Multi-turn: use chat with history for context-aware responses
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemPrompt,
          temperature: safeMode === 'story' ? 0.85 : 0.45,
          tools: [{ googleSearch: {} }],
        },
        history: conversationHistory,
      });
      const chatResponse = await chat.sendMessage({ message: sanitizedMessage });
      responseText = (chatResponse.text ?? '').trim();
    } else {
      // Single-turn: standard generate for first message
      // Build contents array supporting text + optional media
      const contentParts: any[] = [{ text: sanitizedMessage }];
      if (mediaBase64 && mediaMimeType) {
        contentParts.push({
          inlineData: {
            data: mediaBase64,
            mimeType: mediaMimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentParts,
        config: { 
          systemInstruction: systemPrompt, 
          temperature: safeMode === 'story' ? 0.85 : 0.45,
          tools: [{ googleSearch: {} }], 
        },
      });
      responseText = (response.text ?? '').trim();
    }

    if (!responseText) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 });
    }

    // ── Cache the response (single-turn, chat mode only) ───────
    if (useCache) {
      setCachedResponse(cacheKey, responseText);
    }

    // ── Generate image prompt for story mode ───────────────────
    let imagePrompt: string | null = null;
    if (safeMode === 'story') {
      try {
        const imgRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Write a SHORT image prompt (max 15 words, no faces, safe for all ages, flat colorful illustration) for this election story: "${responseText.slice(0, 300)}"`,
          config: { temperature: 0.6 },
        });
        imagePrompt = imgRes.text?.trim().replace(/['"]/g, '') ?? null;
      } catch {
        // Image prompt is non-critical — don't fail the whole request
        imagePrompt = null;
      }
    }

    return NextResponse.json(
      { response: responseText, imagePrompt, registrationUrl: registrationInfo, intent },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[/api/chat] Error:', message);
    
    // Check for rate limit / quota errors
    const errMsg = message.toLowerCase();
    if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('rate limit')) {
      return NextResponse.json({ 
        response: "⚠️ **Google AI Rate Limit Exceeded:**\n\nYou are using the Free Tier of Gemini which allows 15 requests per minute. You have been testing very fast! Please wait **60 seconds** and ask your question again. 🙏", 
        imagePrompt: null, 
        registrationUrl: null, 
        intent: "general" 
      });
    }

    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

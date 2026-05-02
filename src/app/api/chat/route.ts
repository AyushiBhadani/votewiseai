import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

    // ── Parse & validate body ──────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { message, country, language, mode } = body as Record<string, string>;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Sanitize: strip HTML, limit length
    const sanitizedMessage = message.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
    if (!sanitizedMessage) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Whitelist country, language, mode
    const safeCountry  = ALLOWED_COUNTRIES.has(country)  ? country  : 'India';
    const safeLanguage = ALLOWED_LANGUAGES.has(language) ? language : 'English';
    const safeMode     = ALLOWED_MODES.has(mode)         ? mode     : 'chat';

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

    // ── System prompt ──────────────────────────────────────────
    const systemPrompt = safeMode === 'story'
      ? `You are VoteWise Storyteller, explaining elections through simple, engaging stories for children and first-time voters.
Rules:
- Always use relatable characters (Raju the farmer, Priya the student, a village council)
- Use 5–8 emojis per response 🎉🗳️👑🌟
- Keep stories under 200 words
- Relate to elections in ${safeCountry}
- End with 1 bold key takeaway
- ${langInstruction}`
      : `You are VoteWise AI, a neutral election expert for ${safeCountry}.
Rules:
- Use 4–6 emojis naturally 🗳️✅📋🌍
- Be factual, concise, and bias-free
- Never recommend candidates or parties
- Use bullet points and numbered steps where helpful
- Cite official sources when relevant
- ${langInstruction}`;

    // ── Generate main response ─────────────────────────────────
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: sanitizedMessage,
      config: { systemInstruction: systemPrompt, temperature: safeMode === 'story' ? 0.85 : 0.5 },
    });

    const responseText = (response.text ?? '').trim();
    if (!responseText) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 });
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
      { response: responseText, imagePrompt },
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
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/**
 * aiUtils.ts
 * Shared AI utility functions used by /api/chat/route.ts
 * - Intent detection
 * - Response caching (TTL-based)
 * - Official registration URL map
 * - Gemini conversation history builder
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Intent =
  | 'greeting'
  | 'eligibility'
  | 'registration'
  | 'timeline'
  | 'process'
  | 'story_request'
  | 'general';

export interface CacheEntry {
  value: string;
  expiresAt: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

const INTENT_PATTERNS: Record<Intent, RegExp> = {
  greeting: /^(hi|hello|hey|namaste|hola|bonjour|salut|ciao|ola|howdy|greetings|good\s?(morning|afternoon|evening)|what'?s up|sup)\b/i,
  registration: /\b(register|enroll|sign up|voter card|voter id|aadhaar|how to get|apply|form|application|electoral roll)\b/i,
  eligibility: /\b(eligib|can i vote|am i eligible|qualify|age|citizen|who can vote|valid|18|17|requirement|allowed to vote)\b/i,
  timeline: /\b(when|date|schedule|deadline|next election|upcoming|calendar|time|day|month|election date|polling date)\b/i,
  process: /\b(how (do|does|to)|steps|process|procedure|what happens|booth|polling station|evm|ballot|cast|vote count|counting)\b/i,
  story_request: /\b(story|explain like|simple(ly)?|analogy|child|kid|easy way|beginner|layman|village)\b/i,
  general: /.*/,
};

/**
 * Detects the intent of the user's message.
 * Tries patterns in priority order; falls back to 'general'.
 */
export function detectIntent(message: string): Intent {
  const lowerMsg = message.toLowerCase().trim();
  const priorityOrder: Intent[] = [
    'greeting', 'registration', 'eligibility',
    'timeline', 'process', 'story_request',
  ];
  for (const intent of priorityOrder) {
    if (INTENT_PATTERNS[intent].test(lowerMsg)) return intent;
  }
  return 'general';
}

// ─── Intent-Specific Sub-Prompts ──────────────────────────────────────────────

export const INTENT_SUB_PROMPTS: Record<Intent, string> = {
  greeting:
    'The user is greeting you. Respond warmly and friendly. Briefly introduce yourself as VoteWise AI and list 3–4 things you can help with (voter registration, eligibility, election dates, how voting works). Keep it under 80 words. Use 2–3 emojis.',
  eligibility:
    'The user is asking about voter eligibility. Give clear, numbered eligibility criteria for their country. Include age, citizenship, residency, and ID requirements. End with a direct link suggestion to the official election authority.',
  registration:
    'The user wants to know how to register to vote. Give a clear, numbered step-by-step registration guide for their country. Be specific and actionable. Include the official registration website at the end.',
  timeline:
    'The user is asking about election dates or schedules. Provide the next upcoming election date if known, the election cycle frequency, and key deadline dates (registration deadline, voting day). Be specific to their country.',
  process:
    'The user wants to understand the voting process. Explain step-by-step how voting works in their country: from arriving at the polling station to casting the ballot. Use numbered steps. Keep it simple and clear.',
  story_request:
    'The user wants a simple or story-based explanation. Use an analogy or short story with relatable characters to explain the concept they are asking about.',
  general:
    'Answer the user\'s question about elections and voting accurately, concisely, and helpfully. Use bullet points or numbered lists where appropriate.',
};

// ─── Official Registration URLs ───────────────────────────────────────────────

export const REGISTRATION_URLS: Record<string, { url: string; label: string }> = {
  India:        { url: 'https://voters.eci.gov.in', label: 'Register on National Voter Service Portal' },
  USA:          { url: 'https://vote.gov', label: 'Register to Vote — vote.gov' },
  UK:           { url: 'https://www.gov.uk/register-to-vote', label: 'Register to Vote — GOV.UK' },
  Australia:    { url: 'https://www.aec.gov.au/enrol/', label: 'Enrol to Vote — AEC' },
  Canada:       { url: 'https://ereg.elections.ca/CWelcome.aspx', label: 'Register — Elections Canada' },
  France:       { url: 'https://www.service-public.fr/particuliers/vosdroits/R45362', label: "S'inscrire sur les listes électorales" },
  Germany:      { url: 'https://www.bundeswahlleiterin.de', label: 'Bundeswahlleiterin — Wählerverzeichnis' },
  Japan:        { url: 'https://www.soumu.go.jp/senkyo/senkyo_s/naruhodo/naruhodo02.html', label: '選挙人名簿 — 総務省' },
  Brazil:       { url: 'https://www.tse.jus.br/eleitor/cadastro-eleitoral', label: 'Cadastro Eleitoral — TSE' },
  'South Africa': { url: 'https://www.elections.org.za/pw/Voter/Register-To-Vote', label: 'Register — IEC South Africa' },
  Pakistan:     { url: 'https://www.ecp.gov.pk', label: 'Election Commission of Pakistan' },
  Bangladesh:   { url: 'https://services.nidw.gov.bd', label: 'National ID — Bangladesh EC' },
  'Sri Lanka':  { url: 'https://www.elections.gov.lk', label: 'Elections Commission of Sri Lanka' },
};

/**
 * Returns the official voter registration URL for a country.
 * Falls back to a Google search if country not found.
 */
export function getRegistrationUrl(country: string): { url: string; label: string } {
  return REGISTRATION_URLS[country] ?? {
    url: `https://www.google.com/search?q=voter+registration+${encodeURIComponent(country)}`,
    label: `Search voter registration for ${country}`,
  };
}

// ─── Response Cache (TTL = 1 hour) ───────────────────────────────────────────

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generates a deterministic cache key from the request parameters.
 */
export function buildCacheKey(message: string, country: string, language: string, mode: string): string {
  return `${mode}::${country}::${language}::${message.toLowerCase().trim()}`;
}

export function getCachedResponse(key: string): string | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedResponse(key: string, value: string): void {
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Clears expired cache entries to prevent memory leaks in long-running servers. */
export function pruneCache(): void {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now > entry.expiresAt) responseCache.delete(key);
  }
}

// ─── Conversation History Builder ─────────────────────────────────────────────

/**
 * Converts the app's message array into Gemini's multi-turn contents format.
 * Only uses the last `maxMessages` to keep prompt size manageable.
 */
export function buildGeminiHistory(
  messages: ChatMessage[],
  maxMessages = 10,
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const recent = messages.slice(-maxMessages);
  return recent.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

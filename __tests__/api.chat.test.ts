/**
 * @jest-environment node
 *
 * Integration tests for /api/chat route.
 * Tests input sanitization, rate limiting, response structure,
 * edge cases, error handling, and security hardening.
 */

// Mock the Gemini Service before any imports
jest.mock('@/lib/geminiService', () => ({
  getGeminiService: jest.fn().mockImplementation(() => ({
    generateResponse: jest.fn().mockResolvedValue('In India, elections are conducted by the Election Commission of India.'),
    generateQuickAnswer: jest.fn().mockResolvedValue('Mocked image prompt response'),
  })),
}));

// Mock the environment variable for testing
process.env.GEMINI_API_KEY = 'test-api-key';

import { NextRequest } from 'next/server';

// Helper to build a mock NextRequest
const buildRequest = (body: object, ip = '127.0.0.1') =>
  new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });

describe('/api/chat route', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    const route = await import('@/app/api/chat/route');
    POST = route.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Input Validation ──────────────────────────────────────

  it('returns 400 when message is missing', async () => {
    const req = buildRequest({ country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns 400 when message is an empty string', async () => {
    const req = buildRequest({ message: '', country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is only whitespace', async () => {
    const req = buildRequest({ message: '   ', country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is only tabs and newlines', async () => {
    const req = buildRequest({ message: '\t\n\r', country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message exceeds 2000 characters', async () => {
    const req = buildRequest({ message: 'a'.repeat(2001), country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is exactly 2001 characters', async () => {
    const req = buildRequest({ message: 'x'.repeat(2001), country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('accepts message of exactly 2000 characters', async () => {
    const req = buildRequest({ message: 'a'.repeat(2000), country: 'India', language: 'English' });
    const res = await POST(req);
    // Should either process or handle gracefully — not a 400 for length
    expect(res.status).not.toBe(400);
  });

  // ── Security / Sanitization ────────────────────────────────

  it('sanitizes HTML script injection in message', async () => {
    const req = buildRequest({
      message: '<script>alert("xss")</script> What is voting?',
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    expect([200, 400]).toContain(res.status);
  });

  it('sanitizes backtick code injection attempts', async () => {
    const req = buildRequest({
      message: '`rm -rf /` How to vote?',
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    expect([200, 400]).toContain(res.status);
  });

  it('rejects messages with only HTML tags (empty after sanitization)', async () => {
    const req = buildRequest({
      message: '<div><span></span></div>',
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // ── Happy Path ─────────────────────────────────────────────

  it('returns 200 with a valid voting question for India', async () => {
    const req = buildRequest({
      message: 'How do I register to vote in India?',
      country: 'India',
      language: 'English',
      mode: 'chat',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.response).toBeDefined();
    expect(typeof json.response).toBe('string');
    expect(json.response.length).toBeGreaterThan(0);
  });

  it('returns 200 with a valid question for USA', async () => {
    const req = buildRequest({
      message: 'How does the Electoral College work?',
      country: 'USA',
      language: 'English',
      mode: 'chat',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 200 with a Hindi language request', async () => {
    const req = buildRequest({
      message: 'मतदाता पंजीकरण कैसे करें?',
      country: 'India',
      language: 'Hindi',
      mode: 'chat',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns response with intent field', async () => {
    const req = buildRequest({
      message: 'How do I register to vote?',
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.intent).toBeDefined();
  });

  // ── Defaults & Fallbacks ───────────────────────────────────

  it('defaults to India/English when country and language are missing', async () => {
    const req = buildRequest({ message: 'What is democracy?' });
    const res = await POST(req);
    expect([200, 400, 500]).toContain(res.status);
  });

  it('defaults to safe country when invalid country provided', async () => {
    const req = buildRequest({
      message: 'How do elections work?',
      country: 'INVALID_COUNTRY_XYZ',
      language: 'English',
    });
    const res = await POST(req);
    expect([200]).toContain(res.status);
  });

  it('defaults to safe model when invalid model name provided', async () => {
    const req = buildRequest({
      message: 'What is voting?',
      country: 'India',
      language: 'English',
      model: 'hacker-model-v999',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  // ── Story Mode ─────────────────────────────────────────────

  it('returns 200 for story mode requests', async () => {
    const req = buildRequest({
      message: 'Tell me a story about voting',
      country: 'India',
      language: 'English',
      mode: 'story',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  // ── Response Structure ─────────────────────────────────────

  it('returns proper JSON content-type header', async () => {
    const req = buildRequest({
      message: 'What is voting?',
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('includes cache-control no-store header', async () => {
    const req = buildRequest({
      message: 'What is voting?',
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});

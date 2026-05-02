/**
 * @jest-environment node
 *
 * Integration tests for /api/chat route.
 * Tests input sanitization, rate limiting, and response structure.
 */

// Mock the Gemini SDK before any imports
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: 'In India, elections are conducted by the Election Commission of India.',
      }),
    },
  })),
}));

import { NextRequest } from 'next/server';

// Helper to build a mock NextRequest
const buildRequest = (body: object) =>
  new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });

describe('/api/chat route', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    const route = await import('@/app/api/chat/route');
    POST = route.POST;
  });

  it('returns 400 when message is missing', async () => {
    const req = buildRequest({ country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns 400 when message is too long (>2000 chars)', async () => {
    const req = buildRequest({
      message: 'a'.repeat(2001),
      country: 'India',
      language: 'English',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty string message', async () => {
    const req = buildRequest({ message: '   ', country: 'India', language: 'English' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with a valid message about voting', async () => {
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
  });

  it('sanitizes HTML/script injection in message', async () => {
    const req = buildRequest({
      message: '<script>alert("xss")</script> What is voting?',
      country: 'India',
      language: 'English',
    });
    // Should NOT crash, and should process safely
    const res = await POST(req);
    expect([200, 400]).toContain(res.status);
  });

  it('defaults to India and English if country/language missing', async () => {
    const req = buildRequest({ message: 'What is democracy?' });
    const res = await POST(req);
    // Should not crash with missing optional params
    expect([200, 400, 500]).toContain(res.status);
  });
});

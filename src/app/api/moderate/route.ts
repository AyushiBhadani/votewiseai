import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // HACKATHON OPTIMIZATION: AI disabled for moderation to save 100% of the quota for the Chatbot!
    // Always returns safe for the demo.
    return NextResponse.json({ safe: true, reason: "" });

  } catch (error: any) {
    console.error('Moderation API error:', error);
    return NextResponse.json({ safe: true, reason: "" });
  }
}

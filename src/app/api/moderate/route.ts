import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, country, model: clientModel } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const ALLOWED_MODELS = new Set(['gemini-2.0-flash','gemini-1.5-flash','gemini-2.5-flash-preview-04-17','gemini-2.5-pro-preview-05-06']);
    const activeModel = ALLOWED_MODELS.has(clientModel) ? clientModel : 'gemini-2.0-flash';

    let ai: any;

    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else if (process.env.GOOGLE_CLOUD_PROJECT) {
      const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      });
      ai = {
        models: {
          generateContent: async (req: any) => {
            const vModel = vertexAI.getGenerativeModel({ model: req.model });
            const resp = await vModel.generateContent({
              contents: [{ role: 'user', parts: req.contents }],
              systemInstruction: req.config?.systemInstruction ? { role: 'system', parts: [{ text: req.config.systemInstruction }] } : undefined,
            });
            return { text: resp.response.candidates?.[0]?.content?.parts?.[0]?.text || '' };
          }
        }
      };
    } else {
      return NextResponse.json({ error: 'No API configuration found.' }, { status: 500 });
    }

    const systemPrompt = `You are an AI Content Moderator for the VoteWise AI Community Hub in ${country}.
Your job is to read the user's post and determine if it violates the community rules.
RULES:
1. No hate speech, abuse, or harassment.
2. No illegal content or inciting violence.
3. No severe election misinformation (e.g., claiming the election date changed when it hasn't, or giving fake polling locations).
4. Opinions and political discussions ARE allowed, as long as they are civil.

If the message violates the rules, return a JSON object: { "safe": false, "reason": "Brief explanation of why it was blocked." }
If the message is safe and civil, return a JSON object: { "safe": true, "reason": "" }
Do NOT use markdown \`\`\`json. Return RAW JSON only.`;

    const response = await ai.models.generateContent({
      model: activeModel,
      contents: [{ text: `Analyze this post: "${message}"` }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      },
    });

    const text = response.text ?? '{"safe":true}';
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : '{"safe":true}';
    
    let result = { safe: true, reason: "" };
    try {
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini moderation response:", cleanText);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Moderation API error:', error);
    
    // Check for rate limit / quota errors robustly
    const message = error?.message || String(error) || '';
    const errString = (String(error) + ' ' + message).toLowerCase();
    
    if (errString.includes('quota') || errString.includes('429') || errString.includes('rate limit') || errString.includes('exhausted') || errString.includes('too many')) {
      return NextResponse.json({ safe: false, reason: "Google AI Rate Limit Exceeded: Please wait a minute and try again." });
    }

    return NextResponse.json({ safe: false, reason: "Moderation service temporarily unavailable." }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenAI } from '@google/genai';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || 'India';
    const clientModel = searchParams.get('model') || 'gemini-2.0-flash';
    const ALLOWED_MODELS = new Set(['gemini-2.0-flash','gemini-1.5-flash','gemini-2.5-flash-preview-04-17','gemini-2.5-pro-preview-05-06']);
    const activeModel = ALLOWED_MODELS.has(clientModel) ? clientModel : 'gemini-2.0-flash';

    // Same fallback logic as chat API
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
              tools: req.config?.tools,
              systemInstruction: req.config?.systemInstruction ? { role: 'system', parts: [{ text: req.config.systemInstruction }] } : undefined,
            });
            return { text: resp.response.candidates?.[0]?.content?.parts?.[0]?.text || '' };
          }
        }
      };
    } else {
      return NextResponse.json({ error: 'SERVER_CONFIG_ERROR: GEMINI_API_KEY is missing in Cloud Run environment variables.' }, { status: 500 });
    }

    const systemPrompt = `You are a strict JSON data API returning the latest real-time news about elections and politics.
Always use the googleSearch tool to find the most recent, up-to-date news for the CURRENT YEAR for the requested country.
Return EXACTLY a JSON array of 3 objects with keys: id, date, title, description, source.
Do NOT use markdown code blocks like \`\`\`json. Return RAW JSON.
Format:
[
  { "id": "1", "date": "YYYY-MM-DD", "title": "Headline", "description": "Short summary...", "source": "News Outlet" }
]`;

    const prompt = `Find the 3 most recent and important news articles regarding elections or politics in ${country}. Use googleSearch to ensure they are from the last few days.`;

    const response = await ai.models.generateContent({
      model: activeModel,
      contents: [{ text: prompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text ?? '[]';
    // Extract JSON array from the response, ignoring surrounding text/citations
    const jsonMatch = text.match(/\[([\s\S]*?)\]/);
    const cleanText = jsonMatch ? jsonMatch[0] : '[]';
    
    let news;
    try {
      news = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini news response:", cleanText);
      news = [{ id: "error", date: new Date().toISOString().split('T')[0], title: "Formatting Error", description: "Failed to parse live news.", source: "System" }];
    }

    return NextResponse.json(news);

  } catch (error: any) {
    console.error('News API error:', error);
    const message = error?.message || String(error) || '';
    const errString = (String(error) + ' ' + message).toLowerCase();
    
    if (errString.includes('quota') || errString.includes('429') || errString.includes('rate limit') || errString.includes('exhausted') || errString.includes('too many')) {
      return NextResponse.json([{ 
        id: "error-rate-limit", 
        date: new Date().toISOString().split('T')[0], 
        title: "AI Rate Limit Exceeded", 
        description: "Google Gemini Free Tier limit reached (15 requests/min). Please wait 60 seconds and try again.", 
        source: "System Alert" 
      }]);
    }
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

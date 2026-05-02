import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenAI } from '@google/genai';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || 'India';

    // Same fallback logic as chat API
    let ai: any;
    let modelName = 'gemini-2.5-flash';

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
      modelName = 'gemini-1.5-flash';
    } else {
      return NextResponse.json({ error: 'No API configuration found.' }, { status: 500 });
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
      model: modelName,
      contents: [{ text: prompt }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const text = response.text ?? '[]';
    // Clean up any potential markdown formatting the AI might still inject despite instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let news;
    try {
      news = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini news response:", cleanText);
      // Fallback response if AI hallucinates invalid JSON
      news = [{ id: "error", date: new Date().toISOString().split('T')[0], title: "Live Feed Updating...", description: "Check back shortly for live news.", source: "System" }];
    }

    return NextResponse.json(news);

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.production' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: 'Find the 3 most recent and important news articles regarding elections or politics in India. Use googleSearch to ensure they are from the last few days.' }],
      config: {
        systemInstruction: 'You are a strict JSON data API returning the latest real-time news about elections and politics. Always use the googleSearch tool to find the most recent, up-to-date news for the CURRENT YEAR for the requested country. Return EXACTLY a JSON array of 3 objects with keys: id, date, title, description, source. Format: [{ "id": "1", "date": "YYYY-MM-DD", "title": "Headline", "description": "Short summary...", "source": "News Outlet" }]',
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      },
    });
    console.log(response.text);
  } catch (e) { console.error(e); }
}
run();

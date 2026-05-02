const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY="?(.*?)"?$/m)[1];
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });

async function testModerate() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: 'Analyze this post: "Hello world, this is a great day!"' }],
      config: {
        systemInstruction: 'If safe return {"safe":true}',
        temperature: 0.1,
      },
    });
    console.log('Moderate Text:', response.text);
  } catch (e) {
    console.error('Moderate Error:', e.message);
  }
}

async function testNews() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: 'Find news about India.' }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });
    console.log('News Text:', response.text);
  } catch (e) {
    console.error('News Error:', e.message);
  }
}

testModerate().then(testNews);

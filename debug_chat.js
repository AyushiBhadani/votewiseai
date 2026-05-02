const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY="?(.*?)"?$/m)[1];
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });

async function run() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful assistant.',
        temperature: 0.45,
        tools: [{ googleSearch: {} }],
      },
      history: [],
    });
    const chatResponse = await chat.sendMessage({ message: 'Hello, testing!' });
    console.log('Response:', chatResponse.text);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();

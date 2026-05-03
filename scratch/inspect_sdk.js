const { GoogleGenAI } = require('@google/genai');
const instance = new GoogleGenAI({ apiKey: 'test' });
console.log('Keys of instance.chats:', Object.keys(instance.chats));

import fs from 'fs';

// Read API key manually to avoid dotenv dependency issues
const envFile = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envFile.match(/GEMINI_API_KEY="([^"]+)"/);
const apiKey = keyMatch ? keyMatch[1] : null;

async function checkModels() {
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }
  
  try {
    // Test 2.5-flash
    console.log("\nTESTING gemini-2.5-flash:");
    const testRes25 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
    });
    
    const testData25 = await testRes25.json();
    console.log(JSON.stringify(testData25, null, 2));

    // Test flash-latest
    console.log("\nTESTING gemini-flash-latest:");
    const testResLatest = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
    });
    
    const testDataLatest = await testResLatest.json();
    console.log(JSON.stringify(testDataLatest, null, 2));

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkModels();

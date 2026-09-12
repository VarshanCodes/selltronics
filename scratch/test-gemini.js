const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

async function main() {
  const envPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'Desktop', 'my-platform', 'apps', 'web', '.env.locaL');
  console.log('Reading env file from:', envPath);
  
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.locaL file does not exist!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  });

  const geminiApiKey = env.GEMINI_API_KEY;
  const geminiRepairApiKey = env.GEMINI_REPAIR_API_KEY;

  console.log('GEMINI_API_KEY exists:', !!geminiApiKey);
  console.log('GEMINI_REPAIR_API_KEY exists:', !!geminiRepairApiKey);

  if (geminiApiKey) {
    console.log('\n--- Testing GEMINI_API_KEY with gemini-1.5-flash ---');
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Say "GEMINI_API_KEY is working!"',
      });
      console.log('Result:', response.text?.trim());
    } catch (err) {
      console.error('Error testing GEMINI_API_KEY:', err.message || err);
    }
  }

  if (geminiRepairApiKey) {
    console.log('\n--- Testing GEMINI_REPAIR_API_KEY with gemini-1.5-flash ---');
    try {
      const ai = new GoogleGenAI({ apiKey: geminiRepairApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Say "GEMINI_REPAIR_API_KEY is working with 1.5-flash!"',
      });
      console.log('Result:', response.text?.trim());
    } catch (err) {
      console.error('Error testing GEMINI_REPAIR_API_KEY with gemini-1.5-flash:', err.message || err);
    }

    console.log('\n--- Testing GEMINI_REPAIR_API_KEY with gemini-3.6-flash ---');
    try {
      const ai = new GoogleGenAI({ apiKey: geminiRepairApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'Say "GEMINI_REPAIR_API_KEY is working with 3.6-flash!"',
      });
      console.log('Result:', response.text?.trim());
    } catch (err) {
      console.error('Error testing GEMINI_REPAIR_API_KEY with gemini-3.6-flash:', err.message || err);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
});

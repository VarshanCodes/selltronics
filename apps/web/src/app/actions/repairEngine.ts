"use server";
import { GoogleGenAI } from "@google/genai";

// 🚨 Use the dedicated Repair API key here!
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_REPAIR_API_KEY || "" });

export async function getRepairDeviceModels(category: string, brand: string): Promise<string[]> {
  try {
    const prompt = `
      You are an electronic device database API for a repair center.
      List EVERY exact retail device model released by ${brand} in the ${category} category from 2015 to 2026.
      
      CRITICAL INSTRUCTIONS:
      1. Order them chronologically from NEWEST (2026 models) to OLDEST.
      2. NEVER use generic placeholders like "Standard", "Pro model", or "Lite".
      3. You MUST output actual specific retail names (e.g., "iPhone 17 Pro Max", "Galaxy S25 Ultra").
      
      Respond STRICTLY with a raw JSON array of strings. No markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    let rawText = response.text?.trim() || "";
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```/g, "").trim();
    }
    
    const parsed: unknown = JSON.parse(rawText);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: unknown) => String(m));
  } catch (error) {
    console.error("Repair AI Model Fetch Error:", error);
    return [];
  }
}

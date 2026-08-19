"use server";
import { GoogleGenAI } from "@google/genai";

// 🚨 Use the dedicated Repair API key here!
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_REPAIR_API_KEY || "" });

export async function getRepairDeviceModels(category: string, brand: string): Promise<string[]> {
  try {
    const prompt = `Return a raw JSON array of exact retail ${brand} ${category} model names released from 2015 to 2026, newest first. You MUST include the absolute latest 2025 and 2026 flagship models; do not omit iPhone 17, iPhone 17 Pro Max, Samsung Galaxy S25/S26 series, or Pixel 10 when they apply to the requested brand and category. Use specific retail names only—never generic placeholders such as "Standard", "Pro model", or "Lite". JSON only.`;

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

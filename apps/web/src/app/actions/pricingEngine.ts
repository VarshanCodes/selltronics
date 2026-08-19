"use server";

import { GoogleGenAI } from "@google/genai";

// Securely initialize the AI using your environment variable
// process.env.GEMINI_API_KEY is read securely on the server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/** Returns specific retail model names for the repair flow. */
export async function getExactDeviceModels(category: string, brand: string): Promise<string[]> {
  try {
    const prompt = `
You are an electronic device database API.
List EVERY exact retail device model released by ${brand} in the ${category} category from 2015 to 2026.

CRITICAL INSTRUCTIONS:
1. Order them chronologically from NEWEST (2026 models) to OLDEST.
2. NEVER use generic placeholders like "Standard", "Pro model", or "Lite".
3. You MUST output actual specific retail names (e.g., "iPhone 17 Pro Max", "iPhone 17", "Samsung Galaxy S25 Ultra", "Pixel 9 Pro").

Respond STRICTLY with a raw JSON array of strings. No markdown formatting.
Example: ["iPhone 17 Pro Max", "iPhone 17", "iPhone 16 Pro", "iPhone 16"]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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

    // Never expose malformed or generic fallback names in the repair picker.
    return parsed.filter((model): model is string =>
      typeof model === 'string' &&
      model.trim().length > 0 &&
      !/\b(?:standard|pro\s+model|lite\s*(?:model|series)?|pro\s+series)\b/i.test(model)
    );
  } catch (error) {
    console.error("AI Model Fetch Error:", error);
    return [];
  }
}

export async function getLiveModelsAndPrices(category: string, brand: string) {
  try {
    const currentYear = new Date().getFullYear();
    const prompt = `
      You are an API for an electronics trade-in platform.
      Act as a strict hardware database. List the 40 most popular specific device models for ${brand} ${category} released since 2015.
      Group them by product series (e.g., 'S23 Series', 'iPhone 15 Series').
      Never use generic placeholders like 'Standard' or 'Lite' unless it is part of the official retail name.
      Find their approximate average direct-to-consumer retail resale value in INR (Indian Rupees, e.g. 35000, 12000).
      
      Respond strictly with a raw JSON array of objects. Do not use markdown blocks, backticks, or extra text.
      Format exactly like this:
      [
        {"model": "iPhone 15 Pro Max", "basePrice": 85000},
        {"model": "MacBook Pro M3", "basePrice": 110000}
      ]
    `;

    // The 'googleSearch' tool gives the AI access to live internet pricing
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let rawText = response.text?.trim() || "";
    
    // Clean up any accidental markdown formatting from the AI
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```/g, "").trim();
    }
    
    return JSON.parse(rawText);

  } catch (error) {
    console.error("AI Engine Error:", error);
    return []; // Return an empty array if the API fails
  }
}

export async function getSingleModelPrice(category: string, brand: string, modelName: string) {
  try {
    const prompt = `
      You are an API for an electronics trade-in platform.
      Find the approximate average direct-to-consumer retail resale value of this specific device in INR (Indian Rupees):
      Category: ${category}
      Brand: ${brand}
      Model Name: ${modelName}
      
      Respond strictly with a raw JSON object containing only the basePrice. Do not use markdown blocks, backticks, or extra text.
      Format exactly like this:
      {"basePrice": 45000}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let rawText = response.text?.trim() || "";
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```/g, "").trim();
    }
    
    const parsed = JSON.parse(rawText);
    return parsed.basePrice || 0;
  } catch (error) {
    console.error("AI Engine Single Price Error:", error);
    return 0;
  }
}

"use server";

import { GoogleGenAI } from "@google/genai";

// Securely initialize the AI using your environment variable
// process.env.GEMINI_API_KEY is read securely on the server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getLiveModelsAndPrices(category: string, brand: string) {
  try {
    const prompt = `
      You are an API for an electronics trade-in platform.
      Search the web for the 20-25 most popular and recent ${brand} ${category} models currently in the used market (released from 2015 to the current year, covering budget, mid-range, and flagship releases).
      Find their approximate average used market value in INR (Indian Rupees, e.g. 35000, 12000).
      
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
      Find the approximate average used market value of this specific device in INR (Indian Rupees):
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

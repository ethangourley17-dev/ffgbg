
import { GoogleGenAI, Type } from "@google/genai";
import { KeywordData, Timeframe } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Uses gemini-3-flash-preview with googleSearch tool for up-to-date SEO data.
 * This satisfies the "Search Grounding" and "Google Search data" requirements.
 */
export const analyzeKeyword = async (
  keyword: string,
  location: string,
  timeframe: Timeframe
): Promise<KeywordData> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Act as an expert SEO analyst. 
  Your primary task is to find and extract the real Google search keyword volume and trend data for "${keyword}" in "${location}".
  Use the Google Search tool to browse recent 2024-2025 metrics.
  
  The response MUST be a valid JSON object:
  {
    "volume": number,
    "trend": [{"date": string, "value": number}],
    "competition": "Low" | "Medium" | "High",
    "analysis": string
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          volume: { type: Type.NUMBER },
          competition: { type: Type.STRING },
          analysis: { type: Type.STRING },
          trend: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["date", "value"]
            }
          }
        },
        required: ["volume", "competition", "analysis", "trend"]
      }
    }
  });

  const rawText = response.text || "{}";
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    throw new Error("The search grounding service returned an unexpected format. Please try again.");
  }
  
  const sources: { uri: string; title: string }[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });
  }

  return {
    keyword,
    location,
    sources,
    ...parsed
  };
};

/**
 * Uses gemini-3-pro-preview for high-quality conversational chat with history.
 * Satisfies the "AI powered chatbot" requirement.
 */
export const getChatResponse = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a senior digital marketing strategist. Provide actionable, high-level advice on SEO, PPC, and brand positioning. Keep responses concise but insightful.",
    },
    history: history // Pass history to maintain conversation context
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

/**
 * Uses gemini-flash-lite-latest for ultra-low latency tasks.
 * Satisfies the "Fast AI responses" requirement.
 */
export const getQuickSEOTips = async (keyword: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Give me 3 extremely brief, punchy SEO tips for the keyword "${keyword}". Focus on high impact.`,
  });
  return response.text;
};

/**
 * Uses gemini-2.5-flash-image for rapid brand asset editing.
 */
export const editImageWithAI = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const base64Data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  let resultUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      resultUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  if (!resultUrl) throw new Error("AI failed to modify the image.");
  return resultUrl;
};

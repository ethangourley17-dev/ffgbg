
import { GoogleGenAI, Type } from "@google/genai";
import { KeywordData, Timeframe } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Uses gemini-3-flash-preview with googleSearch tool for professional SEO data.
 * Enhanced with strict system instructions for volume scaling.
 */
export const analyzeKeyword = async (
  keyword: string,
  location: string,
  timeframe: Timeframe
): Promise<KeywordData> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the keyword: "${keyword}" for the location: "${location}". 
    The user specifically requested data on a ${timeframe} scale. 
    Calculate the precise numerical volume using search-grounded metrics.`,
    config: {
      systemInstruction: `You are a professional SEO Data Engine.
      Your goal is to provide EXACT keyword volume metrics.
      
      STEP 1: Use Google Search to find "Monthly Search Volume" (MSV) for the keyword in the specified location.
      STEP 2: Apply the following SCALING RULES based on the requested timeframe:
      - If 'daily': Divide MSV by 30. Output this as "volume".
      - If 'weekly': Divide MSV by 4.3. Output this as "volume".
      - If 'monthly': Use MSV directly. Output this as "volume".
      
      STEP 3: Generate 7 "trend" data points. 
      CRITICAL: The values in the "trend" array MUST be on the same scale as your calculated "volume". 
      If daily volume is 50, trend values must be around 50 (e.g. 45, 52, 48), NOT 1,500.
      
      STEP 4: Respond ONLY in JSON.`,
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          volume: { type: Type.NUMBER, description: "The calculated volume for the specific interval." },
          competition: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
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
    throw new Error("Data synthesis failed. The model could not find reliable search metrics for this query.");
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

export const getChatResponse = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a senior digital marketing strategist. Provide actionable advice based on search data.",
    },
    history: history
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const getQuickSEOTips = async (keyword: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Give me 3 punchy SEO tips for "${keyword}".`,
  });
  return response.text;
};

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
  return resultUrl;
};

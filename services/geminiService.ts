import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    // In a real app, this key would be securely managed.
    // For this demo, we assume process.env.API_KEY is available.
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return genAI;
};

export const getSafetyAdvice = async (userQuery: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful, reassuring safety assistant for a women-only ride-hailing app called "Ladies Drive". 
      The user asks: "${userQuery}". 
      Provide a short, comforting, and practical safety tip or advice. Keep it under 50 words.`,
    });
    return response.text || "I'm here to help, but I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently offline, but our support team is available via the SOS button.";
  }
};

export const getDestinationSuggestions = async (query: string): Promise<string[]> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest 3 popular, safe, and woman-friendly public places (like malls, cafes, parks) matching this search query: "${query}". Return ONLY a JSON array of strings. No markdown.`,
        });
        const text = response.text || "[]";
        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error(e);
        return [];
    }
}
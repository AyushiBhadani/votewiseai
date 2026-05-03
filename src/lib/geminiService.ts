import { GoogleGenerativeAI, GenerativeModel, Content } from "@google/generative-ai";

/**
 * GeminiService
 * A professional wrapper for Google Gemini API integration.
 * Handles model initialization, safe content generation, and error logging.
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048,
      }
    });
  }

  /**
   * Generates a response from Gemini using conversation history and system instructions.
   */
  async generateResponse(
    prompt: string,
    history: Content[] = [],
    systemInstruction: string = ""
  ): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: history,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
          role: "system"
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("[GeminiService Error]:", error);
      
      // Handle specific Quota errors
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      
      throw new Error(`AI_GENERATION_FAILED: ${error.message}`);
    }
  }

  /**
   * Simple one-off prompt generation without history.
   */
  async generateQuickAnswer(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("[GeminiService Quick Error]:", error);
      throw error;
    }
  }
}

export const getGeminiService = (apiKey: string, model?: string) => new GeminiService(apiKey, model);

import { GoogleGenerativeAI, GenerativeModel, Content } from "@google/generative-ai";

/**
 * GeminiService
 * 
 * A production-ready wrapper for Google Gemini API integration.
 * Encapsulates model initialization, multi-turn conversation management,
 * safe content generation, rate limit handling, and structured error logging.
 * 
 * @example
 * const gemini = getGeminiService(process.env.GEMINI_API_KEY!);
 * const reply = await gemini.generateResponse("How do I vote?", history, systemPrompt);
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  /**
   * Creates a new GeminiService instance.
   * @param apiKey - The Gemini API key. Must be a non-empty string.
   * @param modelName - The Gemini model to use. Defaults to "gemini-2.5-flash".
   * @throws {Error} If apiKey is empty or undefined.
   */
  constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,  // Balanced creativity
        topP: 0.95,        // High diversity nucleus sampling
        topK: 64,          // Wide token candidate pool
        maxOutputTokens: 2048,
      }
    });
  }

  /**
   * Generates a contextual AI response using multi-turn conversation history
   * and a system instruction prompt.
   * 
   * Automatically handles rate limiting (429) by throwing a typed error
   * so callers can return user-friendly messages without crashing.
   * 
   * @param prompt - The user's current message to send to the model.
   * @param history - Array of prior conversation turns (user + model messages).
   * @param systemInstruction - A system-level instruction to guide model behavior.
   * @returns A promise resolving to the model's text response.
   * @throws {Error} RATE_LIMIT_EXCEEDED if the API quota is exhausted.
   * @throws {Error} AI_GENERATION_FAILED for any other generation failure.
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
      
      // Handle Quota / Rate Limit errors (HTTP 429)
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      
      throw new Error(`AI_GENERATION_FAILED: ${error.message}`);
    }
  }

  /**
   * Generates a quick single-turn response without conversation history.
   * Ideal for short, stateless queries such as generating image prompts
   * or summarizing content.
   * 
   * @param prompt - A single prompt string to send to the model.
   * @returns A promise resolving to the model's text response.
   * @throws {Error} If the generation fails for any reason.
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

/**
 * Factory function to create a new GeminiService instance.
 * Prefer this over direct instantiation for consistent configuration.
 * 
 * @param apiKey - The Gemini API key from environment variables.
 * @param model - Optional model name override. Defaults to "gemini-2.5-flash".
 * @returns A fully configured GeminiService instance.
 */
export const getGeminiService = (apiKey: string, model?: string) => new GeminiService(apiKey, model);

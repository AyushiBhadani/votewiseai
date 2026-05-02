import { getGeminiService } from '../geminiService';

// Mock the GoogleGenerativeAI SDK
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      startChat: jest.fn().mockImplementation(() => ({
        sendMessage: jest.fn().mockResolvedValue({
          response: { text: () => 'Mocked AI Response' }
        })
      })),
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Mocked AI Response' }
      })
    }))
  }))
}));

describe('GeminiService', () => {
  const mockApiKey = 'mock-api-key';
  const service = getGeminiService(mockApiKey);

  it('should initialize correctly with an API key', () => {
    expect(service).toBeDefined();
  });

  it('should throw if API key is missing', () => {
    expect(() => getGeminiService('')).toThrow('Gemini API Key is missing');
  });

  it('should generate a response using generateResponse', async () => {
    const response = await service.generateResponse('Hello', [], 'System Instruction');
    expect(response).toBe('Mocked AI Response');
  });

  it('should generate a quick answer', async () => {
    const response = await service.generateQuickAnswer('Quick prompt');
    expect(response).toBe('Mocked AI Response');
  });
});

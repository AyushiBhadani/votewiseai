import { detectIntent, getRegistrationUrl, buildCacheKey, buildGeminiHistory, ChatMessage } from '../aiUtils';

describe('aiUtils', () => {
  describe('detectIntent', () => {
    it('should detect greeting intent', () => {
      expect(detectIntent('Hi there')).toBe('greeting');
      expect(detectIntent('Hello VoteWise')).toBe('greeting');
    });

    it('should detect registration intent', () => {
      expect(detectIntent('How do I register to vote?')).toBe('registration');
      expect(detectIntent('voter ID application form')).toBe('registration');
    });

    it('should detect eligibility intent', () => {
      expect(detectIntent('Am I eligible to vote at 17?')).toBe('eligibility');
      expect(detectIntent('Can a citizen abroad vote?')).toBe('eligibility');
    });

    it('should detect story_request intent', () => {
      expect(detectIntent('Explain like I am five')).toBe('story_request');
      expect(detectIntent('Tell me a story about voting')).toBe('story_request');
    });

    it('should fallback to general intent', () => {
      expect(detectIntent('What is the capital of France?')).toBe('general');
    });
  });

  describe('getRegistrationUrl', () => {
    it('should return official URL for known countries', () => {
      const result = getRegistrationUrl('India');
      expect(result.url).toBe('https://voters.eci.gov.in');
      expect(result.label).toContain('National Voter Service Portal');
    });

    it('should return google search for unknown countries', () => {
      const result = getRegistrationUrl('Mars');
      expect(result.url).toContain('google.com/search');
      expect(result.label).toContain('Mars');
    });
  });

  describe('buildCacheKey', () => {
    it('should generate a consistent key', () => {
      const key1 = buildCacheKey(' Hello ', 'India', 'English', 'chat');
      const key2 = buildCacheKey('hello', 'India', 'English', 'chat');
      expect(key1).toBe(key2);
      expect(key1).toBe('chat::India::English::hello');
    });
  });

  describe('buildGeminiHistory', () => {
    it('should format messages correctly for Gemini', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' }
      ];
      const history = buildGeminiHistory(messages);
      expect(history).toHaveLength(2);
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('model');
      expect(history[1].parts[0].text).toBe('Hello!');
    });

    it('should respect maxMessages limit', () => {
      const messages: ChatMessage[] = new Array(20).fill({ role: 'user', content: 'test' });
      const history = buildGeminiHistory(messages, 5);
      expect(history).toHaveLength(5);
    });
  });
});

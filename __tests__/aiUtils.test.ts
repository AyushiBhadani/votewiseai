import {
  detectIntent,
  getRegistrationUrl,
  buildCacheKey,
  getCachedResponse,
  setCachedResponse,
  buildGeminiHistory
} from '../src/lib/aiUtils';

describe('aiUtils', () => {
  describe('detectIntent', () => {
    it('detects greetings', () => {
      expect(detectIntent('hi there')).toBe('greeting');
      expect(detectIntent('Namaste')).toBe('greeting');
      expect(detectIntent('hello')).toBe('greeting');
    });

    it('detects eligibility questions', () => {
      expect(detectIntent('am I eligible to vote?')).toBe('eligibility');
      expect(detectIntent('what is the voting age?')).toBe('eligibility');
      expect(detectIntent('can a 17 year old vote')).toBe('eligibility');
    });

    it('detects registration questions', () => {
      expect(detectIntent('how to register')).toBe('registration');
      expect(detectIntent('apply for voter id')).toBe('registration');
    });

    it('detects story requests', () => {
      expect(detectIntent('explain like I am a child')).toBe('story_request');
      expect(detectIntent('tell me a story about voting')).toBe('story_request');
    });

    it('falls back to general for unknown inputs', () => {
      expect(detectIntent('who won the last election')).toBe('general');
      expect(detectIntent('what is democracy')).toBe('general');
    });
  });

  describe('getRegistrationUrl', () => {
    it('returns official URLs for known countries', () => {
      const india = getRegistrationUrl('India');
      expect(india.url).toBe('https://voters.eci.gov.in');
      expect(india.label).toContain('Register');

      const usa = getRegistrationUrl('USA');
      expect(usa.url).toBe('https://vote.gov');
    });

    it('returns a fallback google search for unknown countries', () => {
      const unknown = getRegistrationUrl('Mars');
      expect(unknown.url).toContain('google.com/search');
      expect(unknown.url).toContain('Mars');
    });
  });

  describe('Caching', () => {
    it('stores and retrieves items using deterministic keys', () => {
      const key = buildCacheKey('how to vote', 'India', 'English', 'chat');
      setCachedResponse(key, 'Go to the polling booth.');
      
      const retrieved = getCachedResponse(key);
      expect(retrieved).toBe('Go to the polling booth.');
    });

    it('returns null for missing keys', () => {
      expect(getCachedResponse('missing_key')).toBeNull();
    });
  });

  describe('buildGeminiHistory', () => {
    it('formats app messages into Gemini multi-turn format', () => {
      const messages: any[] = [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi there' }
      ];
      
      const history = buildGeminiHistory(messages);
      
      expect(history.length).toBe(2);
      expect(history[0].role).toBe('user');
      expect(history[0].parts[0].text).toBe('hello');
      
      expect(history[1].role).toBe('model');
      expect(history[1].parts[0].text).toBe('hi there');
    });
    
    it('limits history to maxMessages', () => {
      const messages: any[] = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `msg ${i}`
      }));
      
      const history = buildGeminiHistory(messages, 10);
      expect(history.length).toBe(10);
      // The last message in history should match the last message in input
      expect(history[9].parts[0].text).toBe('msg 14');
    });
  });
});

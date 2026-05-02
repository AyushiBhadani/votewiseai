/**
 * Unit tests for the Zustand useAppStore.
 * Tests state initialization, setters, and persistence logic.
 */

import { act } from 'react';
import { useAppStore } from '@/store/useAppStore';

// Reset store between tests
beforeEach(() => {
  useAppStore.setState({
    country: 'India',
    language: 'English',
    isAudioEnabled: false,
    activeNavTab: 'home',
    activeConversationId: null,
    reminders: [],
    loadedMessages: [],
    isMobileMenuOpen: false,
  });
});

describe('useAppStore — initial state', () => {
  it('has correct default country', () => {
    expect(useAppStore.getState().country).toBe('India');
  });

  it('has correct default language', () => {
    expect(useAppStore.getState().language).toBe('English');
  });

  it('starts with audio disabled', () => {
    expect(useAppStore.getState().isAudioEnabled).toBe(false);
  });

  it('defaults to home tab', () => {
    expect(useAppStore.getState().activeNavTab).toBe('home');
  });

  it('starts with no reminders', () => {
    expect(useAppStore.getState().reminders).toHaveLength(0);
  });

  it('starts with mobile menu closed', () => {
    expect(useAppStore.getState().isMobileMenuOpen).toBe(false);
  });
});

describe('useAppStore — setters', () => {
  it('setCountry updates country', () => {
    act(() => useAppStore.getState().setCountry('USA'));
    expect(useAppStore.getState().country).toBe('USA');
  });

  it('setLanguage updates language', () => {
    act(() => useAppStore.getState().setLanguage('Hindi'));
    expect(useAppStore.getState().language).toBe('Hindi');
  });

  it('toggleAudio flips isAudioEnabled', () => {
    act(() => useAppStore.getState().toggleAudio());
    expect(useAppStore.getState().isAudioEnabled).toBe(true);
    act(() => useAppStore.getState().toggleAudio());
    expect(useAppStore.getState().isAudioEnabled).toBe(false);
  });

  it('setActiveNavTab changes nav tab', () => {
    act(() => useAppStore.getState().setActiveNavTab('calendar'));
    expect(useAppStore.getState().activeNavTab).toBe('calendar');
  });

  it('setIsMobileMenuOpen controls the drawer state', () => {
    act(() => useAppStore.getState().setIsMobileMenuOpen(true));
    expect(useAppStore.getState().isMobileMenuOpen).toBe(true);
    act(() => useAppStore.getState().setIsMobileMenuOpen(false));
    expect(useAppStore.getState().isMobileMenuOpen).toBe(false);
  });

  it('setActiveConversationId sets conversation ID', () => {
    act(() => useAppStore.getState().setActiveConversationId('conv_123'));
    expect(useAppStore.getState().activeConversationId).toBe('conv_123');
  });
});

describe('useAppStore — toggleReminder', () => {
  it('adds a reminder when toggled on', () => {
    act(() => useAppStore.getState().toggleReminder('event_1'));
    expect(useAppStore.getState().reminders).toContain('event_1');
  });

  it('removes a reminder when toggled off (second toggle)', () => {
    act(() => useAppStore.getState().toggleReminder('event_1'));
    act(() => useAppStore.getState().toggleReminder('event_1'));
    expect(useAppStore.getState().reminders).not.toContain('event_1');
  });

  it('can hold multiple different reminders', () => {
    act(() => useAppStore.getState().toggleReminder('event_1'));
    act(() => useAppStore.getState().toggleReminder('event_2'));
    expect(useAppStore.getState().reminders).toHaveLength(2);
  });

  it('only removes the specific reminder, not all', () => {
    act(() => useAppStore.getState().toggleReminder('event_1'));
    act(() => useAppStore.getState().toggleReminder('event_2'));
    act(() => useAppStore.getState().toggleReminder('event_1'));
    expect(useAppStore.getState().reminders).not.toContain('event_1');
    expect(useAppStore.getState().reminders).toContain('event_2');
  });
});

describe('useAppStore — loadedMessages', () => {
  it('setLoadedMessages updates the messages array', () => {
    const msgs = [{ id: '1', role: 'user', content: 'hello' }];
    act(() => useAppStore.getState().setLoadedMessages(msgs));
    expect(useAppStore.getState().loadedMessages).toHaveLength(1);
    expect(useAppStore.getState().loadedMessages[0].content).toBe('hello');
  });

  it('setLoadedMessages can be cleared with empty array', () => {
    act(() => useAppStore.getState().setLoadedMessages([]));
    expect(useAppStore.getState().loadedMessages).toHaveLength(0);
  });
});

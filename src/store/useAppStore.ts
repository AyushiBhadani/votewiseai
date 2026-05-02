import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  country: string;
  language: string;
  isAudioEnabled: boolean;
  activeNavTab: string;
  activeConversationId: string | null;
  reminders: string[];
  loadedMessages: any[];
  isMobileMenuOpen: boolean;
  setCountry: (country: string) => void;
  setLanguage: (lang: string) => void;
  toggleAudio: () => void;
  setActiveNavTab: (tab: string) => void;
  setActiveConversationId: (id: string | null) => void;
  toggleReminder: (eventId: string) => void;
  setLoadedMessages: (msgs: any[]) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      country: 'India',
      language: 'English',
      isAudioEnabled: false,
      activeNavTab: 'home',
      activeConversationId: null,
      reminders: [],
      loadedMessages: [],
      isMobileMenuOpen: false,
      setCountry: (country) => set({ country }),
      setLanguage: (language) => set({ language }),
      toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
      setActiveNavTab: (activeNavTab) => set({ activeNavTab }),
      setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
      toggleReminder: (eventId) => set((state) => ({
        reminders: state.reminders.includes(eventId)
          ? state.reminders.filter(id => id !== eventId)
          : [...state.reminders, eventId],
      })),
      setLoadedMessages: (loadedMessages) => set({ loadedMessages }),
      setIsMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
    }),
    {
      name: 'votewise-storage',
      skipHydration: true, // prevents SSR/client hydration mismatch in Next.js
      partialize: (state) => ({
        country: state.country,
        language: state.language,
        isAudioEnabled: state.isAudioEnabled,
        reminders: state.reminders,
      }),
    }
  )
);

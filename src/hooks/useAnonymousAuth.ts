"use client";

import { useEffect } from 'react';
import { ensureAuth } from '@/lib/firebase';

// This hook silently signs the user in anonymously on first load
// so that Firestore security rules (if request.auth != null) work correctly
export function useAnonymousAuth() {
  useEffect(() => {
    ensureAuth().catch(console.error);
  }, []);
}

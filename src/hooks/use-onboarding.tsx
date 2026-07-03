import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'kds-onboarding-seen-v1';

interface OnboardingContextValue {
  active: boolean;
  stepIndex: number;
  totalSteps: number;
  showCompletion: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
  dismissCompletion: (choice: 'training' | 'done') => void;
  startIfFirstLogin: () => void;
  markSeen: () => void;
  hasBeenSeen: () => boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const ONBOARDING_TOTAL_STEPS = 27;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const hasBeenSeen = useCallback(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  }, []);
  const markSeen = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
  }, []);

  const start = useCallback(() => {
    setStepIndex(0);
    setShowCompletion(false);
    setActive(true);
  }, []);

  const startIfFirstLogin = useCallback(() => {
    if (!hasBeenSeen()) start();
  }, [hasBeenSeen, start]);

  const finish = useCallback(() => {
    setActive(false);
    setShowCompletion(true);
    markSeen();
  }, [markSeen]);

  const skip = useCallback(() => { finish(); }, [finish]);

  const next = useCallback(() => {
    setStepIndex(prev => {
      if (prev + 1 >= ONBOARDING_TOTAL_STEPS) {
        setActive(false);
        setShowCompletion(true);
        markSeen();
        return prev;
      }
      return prev + 1;
    });
  }, [markSeen]);

  const prev = useCallback(() => {
    setStepIndex(i => Math.max(0, i - 1));
  }, []);

  const dismissCompletion = useCallback((choice: 'training' | 'done') => {
    setShowCompletion(false);
    if (choice === 'training') {
      // Hand-off stub for future training-mode feature.
      window.dispatchEvent(new CustomEvent('kds:start-training-mode'));
    }
  }, []);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener('kds:start-onboarding', handler);
    return () => window.removeEventListener('kds:start-onboarding', handler);
  }, [start]);

  const value = useMemo<OnboardingContextValue>(() => ({
    active,
    stepIndex,
    totalSteps: ONBOARDING_TOTAL_STEPS,
    showCompletion,
    start,
    next,
    skip,
    finish,
    dismissCompletion,
    startIfFirstLogin,
    markSeen,
    hasBeenSeen,
  }), [active, stepIndex, showCompletion, start, next, skip, finish, dismissCompletion, startIfFirstLogin, markSeen, hasBeenSeen]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

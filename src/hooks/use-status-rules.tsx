import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface StatusRule {
  id: string;
  label: string;
  color: string;
  textColor: 'white' | 'grey' | 'black';
  minMinutes: number;
  maxMinutes: number | null; // null = open-ended (final rule)
}

const DEFAULT_RULES: StatusRule[] = [
  { id: 'start', label: 'Start (New)', color: '#22C55E', textColor: 'white', minMinutes: 0, maxMinutes: 5 },
  { id: 'medium', label: 'Medium (In Progress)', color: '#EAB308', textColor: 'white', minMinutes: 6, maxMinutes: 10 },
  { id: 'delay', label: 'Delay (Warning)', color: '#F97316', textColor: 'white', minMinutes: 11, maxMinutes: 20 },
  { id: 'overtime', label: 'Overtime (Critical)', color: '#EF4444', textColor: 'white', minMinutes: 21, maxMinutes: null },
];

export interface StatusRulesContextValue {
  rules: StatusRule[];
  setRules: (rules: StatusRule[]) => void;
  resetToDefaults: () => void;
  getStatusForElapsed: (elapsedSeconds: number) => { color: string; textColor: string; label: string; ruleId: string };
}

const StatusRulesContext = createContext<StatusRulesContextValue | null>(null);

const STORAGE_KEY = 'posai-status-rules';

function loadRules(): StatusRule[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_RULES;
}

export function StatusRulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRulesState] = useState<StatusRule[]>(loadRules);

  const setRules = useCallback((newRules: StatusRule[]) => {
    setRulesState(newRules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
  }, []);

  const resetToDefaults = useCallback(() => {
    setRulesState(DEFAULT_RULES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getStatusForElapsed = useCallback((elapsedSeconds: number) => {
    const elapsedMinutes = elapsedSeconds / 60;
    // Find matching rule (last rule with open-ended max is fallback)
    for (const rule of rules) {
      if (rule.maxMinutes === null) {
        if (elapsedMinutes >= rule.minMinutes) {
          return { color: rule.color, textColor: rule.textColor === 'grey' ? '#6C7A89' : rule.textColor === 'black' ? '#000000' : '#FFFFFF', label: rule.label, ruleId: rule.id };
        }
      } else if (elapsedMinutes >= rule.minMinutes && elapsedMinutes <= rule.maxMinutes) {
        return { color: rule.color, textColor: rule.textColor === 'grey' ? '#6C7A89' : rule.textColor === 'black' ? '#000000' : '#FFFFFF', label: rule.label, ruleId: rule.id };
      }
    }
    // Fallback to last rule
    const last = rules[rules.length - 1];
    return { color: last.color, textColor: last.textColor === 'grey' ? '#6C7A89' : last.textColor === 'black' ? '#000000' : '#FFFFFF', label: last.label, ruleId: last.id };
  }, [rules]);

  return (
    <StatusRulesContext.Provider value={{ rules, setRules, resetToDefaults, getStatusForElapsed }}>
      {children}
    </StatusRulesContext.Provider>
  );
}

export function useStatusRules() {
  const ctx = useContext(StatusRulesContext);
  if (!ctx) throw new Error('useStatusRules must be used within StatusRulesProvider');
  return ctx;
}

export { DEFAULT_RULES };

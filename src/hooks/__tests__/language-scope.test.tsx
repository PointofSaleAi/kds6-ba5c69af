import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/hooks/use-language';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('Language Scope gating', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Both: translates UI chrome and menu items to Spanish', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setDisplayMode('single');
      result.current.setLanguage('es');
      result.current.setScope('both');
    });

    // UI chrome (t)
    expect(result.current.t.settings).toBe('Ajustes');
    // Menu item (tp)
    expect(result.current.tp('Caesar Salad')).toBe('Ensalada César');
  });

  it('Interface: translates UI chrome but leaves menu items in English', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setDisplayMode('single');
      result.current.setLanguage('es');
      result.current.setScope('interface');
    });

    expect(result.current.t.settings).toBe('Ajustes');
    expect(result.current.tp('Caesar Salad')).toBe('Caesar Salad');
    expect(result.current.tpSecondary('Caesar Salad')).toBe('Caesar Salad');
  });

  it('Menu: translates menu items but leaves UI chrome in English', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setDisplayMode('single');
      result.current.setLanguage('es');
      result.current.setScope('menu');
    });

    expect(result.current.t.settings).toBe('Settings');
    expect(result.current.tp('Caesar Salad')).toBe('Ensalada César');
  });

  it('persists scope to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setScope('interface');
    });
    expect(localStorage.getItem('posai-language-scope')).toBe('interface');
  });
});

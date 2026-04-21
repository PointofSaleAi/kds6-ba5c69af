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

    expect(result.current.t.settings).toBe('Ajustes');
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
    expect(result.current.tc('APPETIZER')).toBe('APPETIZER');
    expect(result.current.ta('GLUTEN')).toBe('GLUTEN');
    expect(result.current.to('DINE IN')).toBe('DINE IN');
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
    expect(result.current.tc('APPETIZER')).toBe('ENTRADA');
    expect(result.current.ta('GLUTEN')).toBe('GLUTEN');
    expect(result.current.to('DINE IN')).toBe('COMER AQUÍ');
  });

  it('persists scope to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setScope('interface');
    });
    expect(localStorage.getItem('posai-language-scope')).toBe('interface');
  });

  it('Dual mode: changing primary language changes tp/tc/ta/to', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setScope('both');
      result.current.setDisplayMode('dual');
      result.current.setPrimaryLang('es');
      result.current.setSecondaryLang('zh');
    });

    expect(result.current.tp('Caesar Salad')).toBe('Ensalada César');
    expect(result.current.tpSecondary('Caesar Salad')).toBe('凯撒沙拉');
    expect(result.current.tc('APPETIZER')).toBe('ENTRADA');
    expect(result.current.ta('GLUTEN')).toBe('GLUTEN');
    expect(result.current.to('DINE IN')).toBe('COMER AQUÍ');
  });

  it('Dual mode: switching primary updates the main translator', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setScope('both');
      result.current.setDisplayMode('dual');
      result.current.setPrimaryLang('es');
    });
    expect(result.current.tp('Caesar Salad')).toBe('Ensalada César');

    act(() => {
      result.current.setPrimaryLang('zh');
    });
    expect(result.current.tp('Caesar Salad')).toBe('凯撒沙拉');
  });

  it('Course/allergen lookup is case-insensitive (uppercase fallback)', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setScope('menu');
      result.current.setDisplayMode('single');
      result.current.setLanguage('es');
    });

    // Lowercase / mixed-case input still resolves via uppercase fallback
    expect(result.current.tc('appetizer')).toBe('ENTRADA');
    expect(result.current.ta('gluten')).toBe('GLUTEN');
    expect(result.current.to('dine in')).toBe('COMER AQUÍ');
  });
});

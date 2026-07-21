import { useState } from 'react';
import { ArrowLeft, Search, Check, Languages, ArrowLeftRight } from 'lucide-react';
import { useLanguage, type LanguageCode, type DisplayMode, type DateFormatIndex, type TimeFormatIndex } from '@/hooks/use-language';

interface LanguageSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface Language {
  code: LanguageCode;
  name: string;
  native: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en-US', name: 'English (US)', native: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', native: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
];

const translations: Record<string, Record<string, string>> = {
  'en-US': { fries: 'French Fries', chicken: 'Grilled Chicken', salad: 'Caesar Salad' },
  'en-GB': { fries: 'Chips', chicken: 'Grilled Chicken', salad: 'Caesar Salad' },
  es: { fries: 'Papas fritas', chicken: 'Pollo a la parrilla', salad: 'Ensalada César' },
  ar: { fries: 'بطاطس مقلية', chicken: 'دجاج مشوي', salad: 'سلطة سيزر' },
  zh: { fries: '薯条', chicken: '烤鸡', salad: '凯撒沙拉' },
  vi: { fries: 'Khoai tây chiên', chicken: 'Gà nướng', salad: 'Salad Caesar' },
  ko: { fries: '감자튀김', chicken: '그릴드 치킨', salad: '시저 샐러드' },
  ja: { fries: 'フライドポテト', chicken: 'グリルドチキン', salad: 'シーザーサラダ' },
};

const previewItems = [
  { qty: 2, key: 'fries' },
  { qty: 1, key: 'chicken' },
  { qty: 1, key: 'salad' },
];

const dateFormats = ['27 March 2026', 'March 27, 2026', '27/03/2026'];
const timeFormats = ['12h (2:34 PM)', '24h (14:34)'];

export default function LanguageSettings({ open, onClose }: LanguageSettingsProps) {
  const { language, setLanguage, t, displayMode, setDisplayMode, primaryLang, setPrimaryLang, secondaryLang, setSecondaryLang, dateFormat: savedDateFormat, setDateFormat: saveDateFormat, timeFormat: savedTimeFormat, setTimeFormat: saveTimeFormat, scope, setScope } = useLanguage();
  const [search, setSearch] = useState('');
  const [dateFormat, setDateFormat] = useState<DateFormatIndex>(savedDateFormat);
  const [timeFormat, setTimeFormat] = useState<TimeFormatIndex>(savedTimeFormat);
  const [localSingleLang, setLocalSingleLang] = useState<LanguageCode>(language);
  const [editTarget, setEditTarget] = useState<'primary' | 'secondary'>('secondary');
  

  if (!open) return null;

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  );

  const handleSwap = () => {
    setPrimaryLang(secondaryLang);
    setSecondaryLang(primaryLang);
  };

  const getLangInfo = (code: LanguageCode): Language =>
    languages.find((l) => l.code === code) ?? languages[0];

  const scopeOptions = [
    { key: 'interface' as const, label: t.appInterface },
    { key: 'menu' as const, label: t.menuItems },
    { key: 'both' as const, label: t.both },
  ];

  const handleSave = () => {
    saveDateFormat(dateFormat);
    saveTimeFormat(timeFormat);
    onClose();
  };

  const selectedLangInList = displayMode === 'dual'
    ? (editTarget === 'primary' ? primaryLang : secondaryLang)
    : localSingleLang;

  const handleSelectLang = (code: LanguageCode) => {
    if (displayMode === 'dual') {
      if (editTarget === 'primary') setPrimaryLang(code);
      else setSecondaryLang(code);
    } else {
      setLocalSingleLang(code);
      setLanguage(code);
    }
  };

  const getTranslation = (key: string, lang: LanguageCode) =>
    translations[lang]?.[key] ?? translations['en-US'][key];

  const primaryInfo = getLangInfo(primaryLang);
  const secondaryInfo = getLangInfo(secondaryLang);

  const previewPrimaryLang = displayMode === 'dual' ? primaryLang : localSingleLang;
  const previewSecondaryLang = secondaryLang;
  const previewPrimaryInfo = getLangInfo(previewPrimaryLang);
  const previewSecondaryInfo = getLangInfo(previewSecondaryLang);

  return (
    <div className="fixed top-0 right-0 bottom-0 left-20 z-50 bg-transparent flex flex-col p-0">


          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Back">
              <ArrowLeft size={20} className="text-text-secondary" />
            </button>
            <Languages size={20} className="text-text-muted" />
            <h2 className="text-lg font-bold text-text-primary flex-1">{t.languageRegion}</h2>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
              <div className="flex flex-col md:flex-row h-full">
                {/* LEFT COLUMN */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 min-w-0">
                  {/* Section A: Language scope */}
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{t.languageScope}</div>
                    <div className="flex bg-muted rounded-lg p-0.5">
                      {scopeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setScope(opt.key)}
                          className={`flex-1 px-2 py-1.5 text-[11px] font-semibold rounded-md transition-colors min-h-[32px] ${
                            scope === opt.key ? 'bg-brand-primary text-primary-foreground' : 'text-text-secondary'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section B: Display mode */}
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{t.displayMode}</div>
                    <div className="flex gap-2">
                      {/* Single language card */}
                      <button
                        onClick={() => setDisplayMode('single')}
                        className="flex-1 rounded-lg p-2.5 text-left transition-all"
                        style={{
                          border: displayMode === 'single' ? '1.5px solid #111' : '1.5px solid hsl(var(--border))',
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                            style={{ borderColor: displayMode === 'single' ? '#111' : 'hsl(var(--border))' }}
                          >
                            {displayMode === 'single' && <div className="w-1.5 h-1.5 rounded-full bg-text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-primary">{t.singleLanguage}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">One language on KDS</div>
                            <div className="mt-1.5 bg-muted/50 rounded px-2 py-1">
                              <span className="text-[11px] font-medium text-text-primary">2x French Fries</span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Dual language card */}
                      <button
                        onClick={() => setDisplayMode('dual')}
                        className="flex-1 rounded-lg p-2.5 text-left transition-all"
                        style={{
                          border: displayMode === 'dual' ? '1.5px solid #111' : '1.5px solid hsl(var(--border))',
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                            style={{ borderColor: displayMode === 'dual' ? '#111' : 'hsl(var(--border))' }}
                          >
                            {displayMode === 'dual' && <div className="w-1.5 h-1.5 rounded-full bg-text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-primary">{t.dualLanguage}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">Two languages per product</div>
                            <div className="mt-1.5 bg-muted/50 rounded px-2 py-1">
                              <div className="text-[11px] font-bold text-text-primary">2x French Fries</div>
                              <div className="text-[9px] text-text-muted">
                                {getTranslation('fries', selectedLangInList)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section C: Language pair (dual only) */}
                  {displayMode === 'dual' && (
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{t.languagePair}</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditTarget('primary')}
                          className="flex-1 bg-muted rounded-lg px-2.5 py-2 text-left transition-all"
                          style={{ border: editTarget === 'primary' ? '1.5px solid hsl(var(--brand-primary))' : '1.5px solid transparent' }}
                        >
                          <div className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Primary {editTarget === 'primary' ? '· editing' : ''}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{primaryInfo.flag}</span>
                            <span className="text-xs font-medium text-text-primary">{primaryInfo.name}</span>
                          </div>
                        </button>
                        <button
                          onClick={handleSwap}
                          className="shrink-0 w-8 h-8 rounded-full bg-brand-primary text-primary-foreground flex items-center justify-center hover:bg-brand-primary/90 transition-colors"
                          aria-label="Swap Languages"
                        >
                          <ArrowLeftRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTarget('secondary')}
                          className="flex-1 bg-muted rounded-lg px-2.5 py-2 text-left transition-all"
                          style={{ border: editTarget === 'secondary' ? '1.5px solid hsl(var(--brand-primary))' : '1.5px solid transparent' }}
                        >
                          <div className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Secondary {editTarget === 'secondary' ? '· editing' : ''}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{secondaryInfo.flag}</span>
                            <span className="text-xs font-medium text-text-primary">{secondaryInfo.name}</span>
                          </div>
                        </button>
                      </div>
                      <div className="text-[9px] text-text-muted text-center mt-1">tap a card to choose which side to edit, or ⇆ to swap</div>
                    </div>
                  )}

                  {/* Section D: Language list */}
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                      {displayMode === 'dual' ? `${t.selectLanguage} (${editTarget})` : t.selectLanguage}
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-2.5 py-1.5 mb-1.5">
                      <Search size={14} className="text-text-muted" />
                      <input
                        type="text"
                        placeholder={t.searchLanguages}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none min-h-[28px]"
                      />
                    </div>
                    <div>
                      {filtered.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleSelectLang(lang.code)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors min-h-[40px] ${
                            selectedLangInList === lang.code ? 'bg-brand-primary/10' : ''
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <div className="text-xs font-semibold text-text-primary">{lang.name}</div>
                            <div className="text-[10px] text-text-muted">{lang.native}</div>
                          </div>
                          {selectedLangInList === lang.code && (
                            <Check size={16} className="text-brand-primary" />
                          )}
                        </button>
                      ))}
                      <div className="px-3 py-2 border-t border-border mt-1">
                        <button
                          onClick={() => window.open('mailto:support@posai.com?subject=Language%20Request', '_blank')}
                          className="w-full flex items-center gap-2.5 py-2 text-left hover:bg-muted/50 rounded-lg transition-colors min-h-[40px]"
                        >
                          <span className="text-base">🌐</span>
                          <span className="text-xs font-semibold text-brand-primary dark:text-foreground">{t.requestLanguage}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VERTICAL DIVIDER */}
                <div className="hidden md:block w-px bg-border shrink-0" />
                {/* HORIZONTAL DIVIDER (mobile) */}
                <div className="md:hidden h-px bg-border shrink-0 mx-3" />

                {/* RIGHT COLUMN - Live preview */}
                <div className="flex-1 p-3 md:p-4 flex flex-col min-w-0">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">
                    {t.previewKDS}
                  </div>
                  <div className="rounded-lg p-3 flex-1" style={{ backgroundColor: '#1a1a2e' }}>
                    {/* Header */}
                    <div className="text-[10px] text-white/50 mb-3 pb-2 border-b border-white/10">
                      Order #1042 · Dine In · Table 12
                    </div>
                    {/* Items */}
                    <div className="space-y-2">
                      {previewItems.map((item) => {
                        const primaryText = getTranslation(item.key, previewPrimaryLang);
                        const secondaryText = displayMode === 'dual' ? getTranslation(item.key, previewSecondaryLang) : null;
                        return (
                          <div key={item.key} className="border-b border-white/5 pb-2 last:border-0">
                            <div className="text-[12px] font-bold text-white">
                              {item.qty}x {primaryText}
                            </div>
                            {secondaryText && (
                              <div className="text-[10px] text-white/40 font-semibold uppercase mt-0.5">
                                {secondaryText}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Description */}
                  <div className="text-[10px] text-text-muted mt-2 text-center">
                    {displayMode === 'dual'
                      ? `Showing ${previewPrimaryInfo.name} (primary) + ${previewSecondaryInfo.name} (secondary) on each item.`
                      : `Showing ${getLangInfo(localSingleLang).name} only on the KDS.`}
                  </div>
                </div>
              </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border shrink-0">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-primary-foreground bg-brand-primary hover:bg-brand-primary/90 transition-colors min-h-[44px]"
            >
              {t.save}
            </button>
        </div>
    </div>
  );
}


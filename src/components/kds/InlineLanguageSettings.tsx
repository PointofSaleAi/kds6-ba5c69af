import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check, ArrowLeftRight, Languages, ChevronDown } from 'lucide-react';
import { useLanguage, type LanguageCode, type DisplayMode, type DateFormatIndex, type TimeFormatIndex } from '@/hooks/use-language';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { toast } from 'sonner';
import { SelectedVariantPreview } from './SelectedVariantPreview';
import { previewTicket } from '@/data/mock-preview-ticket';

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

const dateFormats = ['27 March 2026', 'March 27, 2026', '27/03/2026'];
const timeFormats = ['12h (2:34 PM)', '24h (14:34)'];

const variantLanguages = new Set(['Chinese', 'Portuguese', 'Arabic', 'Malay', 'Uzbek', 'Serbian']);

const popularRequestLanguages = [
  'French', 'German', 'Japanese', 'Korean',
  'Portuguese (Brazil)', 'Portuguese (Portugal)',
  'Hindi', 'Bengali', 'Punjabi', 'Tamil', 'Telugu', 'Marathi',
];

const moreLanguages = [
  'Afrikaans','Albanian','Amharic','Armenian','Azerbaijani','Basque','Belarusian','Bosnian',
  'Bulgarian','Burmese','Catalan','Cebuano','Chichewa','Chinese (Simplified)','Chinese (Traditional)',
  'Corsican','Croatian','Czech','Danish','Dutch','Esperanto','Estonian','Filipino','Finnish',
  'Frisian','Galician','Georgian','Greek','Gujarati','Haitian Creole','Hausa','Hawaiian',
  'Hebrew','Hmong','Hungarian','Icelandic','Igbo','Indonesian','Irish','Italian','Javanese',
  'Kannada','Kazakh','Khmer','Kinyarwanda','Kurdish','Kyrgyz','Lao','Latin','Latvian',
  'Lithuanian','Luxembourgish','Macedonian','Malagasy','Malay','Malayalam','Maltese','Maori',
  'Mongolian','Nepali','Norwegian','Odia','Pashto','Persian','Polish','Romanian','Russian',
  'Samoan','Scots Gaelic','Serbian','Sesotho','Shona','Sindhi','Sinhala','Slovak','Slovenian',
  'Somali','Sundanese','Swahili','Swedish','Tajik','Thai','Turkish','Turkmen','Ukrainian',
  'Urdu','Uyghur','Vietnamese','Welsh','Xhosa','Yiddish','Yoruba','Zulu',
];


const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'INR', label: 'INR (\u20B9)' },
  { value: 'EUR', label: 'EUR (\u20AC)' },
  { value: 'GBP', label: 'GBP (\u00A3)' },
  { value: 'AED', label: 'AED (\u062F.\u0625)' },
];

interface InlineLanguageSettingsProps {
  activeTab: 'language' | 'region';
}

export default function InlineLanguageSettings({ activeTab }: InlineLanguageSettingsProps) {
  const {
    language, setLanguage, t, displayMode, setDisplayMode,
    primaryLang, setPrimaryLang, secondaryLang, setSecondaryLang,
    dateFormat: savedDateFormat, setDateFormat: saveDateFormat,
    timeFormat: savedTimeFormat, setTimeFormat: saveTimeFormat,
    scope, setScope,
  } = useLanguage();

  const {
    currency, setCurrency,
    tempUnit, setTempUnit,
    weekStart, setWeekStart,
  } = useKDSSettings();
  const [search, setSearch] = useState('');
  const [dateFormat, setDateFormat] = useState<DateFormatIndex>(savedDateFormat);
  const [previewLayout, setPreviewLayout] = useState<'standard' | 'compact'>('standard');
  const [timeFormat, setTimeFormat] = useState<TimeFormatIndex>(savedTimeFormat);
  
  const [currOpen, setCurrOpen] = useState(false);
  const [localSingleLang, setLocalSingleLang] = useState<LanguageCode>(language);
  // Which side of the dual pair the language list is editing
  const [editTarget, setEditTarget] = useState<'primary' | 'secondary'>('secondary');

  // Request language form state
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  
  const [reqLangSearch, setReqLangSearch] = useState('');
  const [reqSelectedLang, setReqSelectedLang] = useState('');
  const [reqDialect, setReqDialect] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqDropdownOpen, setReqDropdownOpen] = useState(false);
  const reqInputTriggerRef = useRef<HTMLDivElement>(null);
  const reqDropdownRef = useRef<HTMLDivElement>(null);
  const reqJustSelectedRef = useRef(false);
  const [reqDropdownPos, setReqDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const updateDropdownPos = useCallback(() => {
    if (reqInputTriggerRef.current) {
      const rect = reqInputTriggerRef.current.getBoundingClientRect();
      setReqDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  const existingLangNames = languages.map(l => l.name);
  const filteredPopular = popularRequestLanguages.filter(
    l => !existingLangNames.includes(l) && l.toLowerCase().includes(reqLangSearch.toLowerCase())
  );
  const filteredMore = moreLanguages.filter(
    l => !existingLangNames.includes(l) && l.toLowerCase().includes(reqLangSearch.toLowerCase())
  );

  const hasVariants = variantLanguages.has(reqSelectedLang.split(' ')[0]);

  const handleRequestSubmit = () => {
    if (!reqSelectedLang) return;
    // TODO: submit to backend API
    console.log('Language request:', { language: reqSelectedLang, dialect: reqDialect, reason: reqReason });
    setRequestFormOpen(false);
    setReqSelectedLang('');
    setReqDialect('');
    setReqReason('');
    setReqLangSearch('');
    toast.success("Thanks! We'll notify you when this language is available.");
  };

  // Close dropdown when clicking outside (portal-aware)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        reqDropdownRef.current && !reqDropdownRef.current.contains(target) &&
        reqInputTriggerRef.current && !reqInputTriggerRef.current.contains(target)
      ) {
        setReqDropdownOpen(false);
      }
    };
    if (reqDropdownOpen) {
      document.addEventListener('mousedown', handler);
      updateDropdownPos();
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [reqDropdownOpen, updateDropdownPos]);

  // Reposition dropdown on scroll/resize
  useEffect(() => {
    if (!reqDropdownOpen) return;
    const reposition = () => updateDropdownPos();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [reqDropdownOpen, updateDropdownPos]);

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
    // Language & display mode are already persisted on change via context
    toast.success('Language settings saved');
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
    <div className="flex flex-col h-full">
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'language' ? (
          <div className="flex flex-col md:flex-row h-full gap-8">
            {/* LEFT COLUMN */}
            <div className="flex-1 overflow-y-auto space-y-4 min-w-0">
              {/* Language scope */}
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

              {/* Display mode */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{t.displayMode}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplayMode('single')}
                    className="flex-1 rounded-lg p-2.5 text-left transition-all"
                    style={{ border: displayMode === 'single' ? '1.5px solid #111' : '1.5px solid hsl(var(--border))' }}
                  >
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-text-primary">{t.singleLanguage}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">One language on KDS</div>
                        <div className="mt-1.5 bg-muted/50 rounded px-2 py-1">
                          <span className="text-[11px] font-medium text-text-primary">2x French Fries</span>
                        </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setDisplayMode('dual')}
                    className="flex-1 rounded-lg p-2.5 text-left transition-all"
                    style={{ border: displayMode === 'dual' ? '1.5px solid #111' : '1.5px solid hsl(var(--border))' }}
                  >
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-text-primary">{t.dualLanguage}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">Two languages per product</div>
                        <div className="mt-1.5 bg-muted/50 rounded px-2 py-1">
                          <div className="text-[11px] font-bold text-text-primary">2x French Fries</div>
                          <div className="text-[9px] text-text-muted">{getTranslation('fries', selectedLangInList)}</div>
                        </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Language pair (dual only) */}
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
                      aria-label="Swap languages"
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

              {/* Language list */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                  {displayMode === 'dual'
                    ? `${t.selectLanguage} (${editTarget})`
                    : t.selectLanguage}
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
                <div className="grid grid-cols-2 gap-2">
                  {filtered.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang.code)}
                      className={`flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors min-h-[44px] border ${
                        selectedLangInList === lang.code ? 'bg-brand-primary/10 border-brand-primary' : 'border-border'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs font-semibold text-text-primary truncate">{lang.name}</div>
                        <div className="text-[10px] text-text-muted truncate">{lang.native}</div>
                      </div>
                      {selectedLangInList === lang.code && (
                        <Check size={14} className="text-brand-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <button
                    onClick={() => setRequestFormOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/50 rounded-lg transition-colors min-h-[44px]"
                  >
                    <span className="text-base">🌐</span>
                    <span className="text-xs font-semibold text-brand-primary dark:text-foreground">{t.requestLanguage}</span>
                  </button>
                </div>

                {/* Request a language Modal */}
                {requestFormOpen && (
                  <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    onClick={(e) => {
                      if (reqDropdownRef.current?.contains(e.target as Node)) return;
                      if (reqJustSelectedRef.current) { reqJustSelectedRef.current = false; return; }
                      setRequestFormOpen(false);
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50" />
                    <div
                      className="relative bg-surface-card rounded-lg shadow-xl w-[480px] max-w-[90vw] max-h-[85vh] flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                        <h3 className="text-sm font-bold text-text-primary">Request a language</h3>
                        <button
                          onClick={() => setRequestFormOpen(false)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-text-muted"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Body */}
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                        {/* Language Name */}
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
                            Language name *
                          </label>
                          <div ref={reqDropdownRef} className="relative">
                            <div
                              ref={reqInputTriggerRef}
                              className="flex items-center gap-2 bg-muted rounded-lg px-2.5 py-1.5 cursor-text"
                              onClick={() => setReqDropdownOpen(true)}
                            >
                              <Search size={14} className="text-text-muted shrink-0" />
                              <input
                                type="text"
                                placeholder="Select language"
                                value={reqSelectedLang || reqLangSearch}
                                onChange={(e) => {
                                  setReqLangSearch(e.target.value);
                                  setReqSelectedLang('');
                                  setReqDropdownOpen(true);
                                }}
                                onFocus={() => setReqDropdownOpen(true)}
                                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none min-h-[28px]"
                              />
                              <ChevronDown size={14} className={`text-text-muted shrink-0 transition-transform ${reqDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {reqDropdownOpen && reqDropdownPos && createPortal(
                              <div
                                ref={reqDropdownRef}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-surface-card border border-border rounded-lg shadow-lg max-h-[240px] overflow-y-auto"
                                style={{
                                  position: 'fixed',
                                  zIndex: 9999,
                                  top: reqDropdownPos.top,
                                  left: reqDropdownPos.left,
                                  width: reqDropdownPos.width,
                                }}
                              >
                                {filteredPopular.length > 0 && (
                                  <>
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest sticky top-0 bg-surface-card">Popular</div>
                                    {filteredPopular.map((lang) => (
                                      <button
                                        key={lang}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          reqJustSelectedRef.current = true;
                                          setReqSelectedLang(lang);
                                          setReqLangSearch('');
                                          setReqDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-muted/50 transition-colors"
                                      >
                                        {lang}
                                      </button>
                                    ))}
                                  </>
                                )}
                                {filteredMore.length > 0 && (
                                  <>
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest sticky top-0 bg-surface-card border-t border-border">More languages</div>
                                    {filteredMore.map((lang) => (
                                      <button
                                        key={lang}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          reqJustSelectedRef.current = true;
                                          setReqSelectedLang(lang);
                                          setReqLangSearch('');
                                          setReqDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-muted/50 transition-colors"
                                      >
                                        {lang}
                                      </button>
                                    ))}
                                  </>
                                )}
                                {filteredPopular.length === 0 && filteredMore.length === 0 && (
                                  <div className="px-3 py-3 text-xs text-text-muted text-center">No languages found</div>
                                )}
                              </div>,
                              document.body
                            )}
                          </div>
                        </div>

                        {/* Region / Dialect (conditional) */}
                        {hasVariants && (
                          <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
                              Dialect
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Simplified vs Traditional Chinese"
                              value={reqDialect}
                              onChange={(e) => setReqDialect(e.target.value)}
                              className="w-full bg-muted rounded-lg px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none min-h-[36px]"
                            />
                          </div>
                        )}

                        {/* Reason */}
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
                            Why do you need it?
                          </label>
                          <input
                            type="text"
                            placeholder="Tell us your use case..."
                            value={reqReason}
                            onChange={(e) => setReqReason(e.target.value)}
                            className="w-full bg-muted rounded-lg px-2.5 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none min-h-[36px]"
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3.5 border-t border-border">
                        <button
                          onClick={handleRequestSubmit}
                          disabled={!reqSelectedLang}
                          className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-primary text-primary-foreground hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                        >
                          Submit request
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* VERTICAL DIVIDER */}
            <div className="hidden md:block w-px bg-border shrink-0" />

            {/* RIGHT COLUMN - Static preview (non-interactive) */}
            <div className="w-[360px] shrink-0 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {t.previewKDS}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">View as</span>
                  <div className="flex bg-muted rounded-md p-0.5 border border-border">
                    {(['standard', 'compact'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPreviewLayout(opt)}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors capitalize ${
                          previewLayout === opt ? 'bg-brand-primary text-primary-foreground' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-text-muted mb-2 italic">
                Preview-only. Change the saved layout in Display, Ticket layout. Proper nouns (server name, guest name) are not translated.
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col">
                <div className="flex-1 min-h-0 flex flex-col [&>*]:flex-1 [&>*]:min-h-0 [&>*]:flex [&>*]:flex-col">
                  <OrderCard order={previewTicket} layoutOverride={previewLayout} />
                </div>
              </div>
              <div className="text-[10px] text-text-muted mt-2 text-center">
                {displayMode === 'dual'
                  ? `Showing ${previewPrimaryInfo.name} (primary) + ${previewSecondaryInfo.name} (secondary) on each item.`
                  : `Showing ${getLangInfo(localSingleLang).name} only on the KDS.`}
              </div>
            </div>
          </div>
        ) : (
          /* REGION TAB */
          <div className="overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {/* Date format - left */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Date format</div>
                <div className="space-y-2">
                  {dateFormats.map((fmt, i) => (
                    <button
                      key={fmt}
                      onClick={() => { setDateFormat(i as DateFormatIndex); saveDateFormat(i as DateFormatIndex); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all min-h-[44px]"
                      style={{ border: dateFormat === i ? '1.5px solid #111' : '1.5px solid hsl(var(--border))' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: dateFormat === i ? '#111' : 'hsl(var(--border))' }}
                      >
                        {dateFormat === i && <div className="w-2 h-2 rounded-full bg-text-primary" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{fmt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time format - right */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Time format</div>
                <div className="space-y-2">
                  {timeFormats.map((fmt, i) => (
                    <button
                      key={fmt}
                      onClick={() => { setTimeFormat(i as TimeFormatIndex); saveTimeFormat(i as TimeFormatIndex); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all min-h-[44px]"
                      style={{ border: timeFormat === i ? '1.5px solid #111' : '1.5px solid hsl(var(--border))' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: timeFormat === i ? '#111' : 'hsl(var(--border))' }}
                      >
                        {timeFormat === i && <div className="w-2 h-2 rounded-full bg-text-primary" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{fmt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency - read-only */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Currency</div>
                <div
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg min-h-[44px] bg-muted/50"
                  style={{ border: '1.5px solid hsl(var(--border))' }}
                >
                  <span className="text-sm font-medium text-text-primary">
                    {currencyOptions.find(c => c.value === currency)?.label || '\u2014  Set in Point of Sale Dashboard'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">
                  Currency is set at store level. Change it from your Point of Sale dashboard.
                </p>
              </div>

              {/* Temperature Unit - left */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Temperature unit</div>
                <div className="space-y-2">
                  {(['F', 'C'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTempUnit(unit)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all min-h-[44px]"
                      style={{ border: tempUnit === unit ? '1.5px solid #111' : '1.5px solid hsl(var(--border))' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: tempUnit === unit ? '#111' : 'hsl(var(--border))' }}
                      >
                        {tempUnit === unit && <div className="w-2 h-2 rounded-full bg-text-primary" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{`\u00B0${unit}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Week Start Day - right */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Week start day</div>
                <div className="space-y-2">
                  {(['Sunday', 'Monday'] as const).map((day) => (
                    <button
                      key={day}
                      onClick={() => setWeekStart(day)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all min-h-[44px]"
                      style={{ border: weekStart === day ? '1.5px solid #111' : '1.5px solid hsl(var(--border))' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: weekStart === day ? '#111' : 'hsl(var(--border))' }}
                      >
                        {weekStart === day && <div className="w-2 h-2 rounded-full bg-text-primary" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{day}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="pt-4 shrink-0">
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

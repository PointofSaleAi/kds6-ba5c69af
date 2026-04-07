import { useState } from 'react';
import { X, Search, Check, Globe, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, type LanguageCode, type DisplayMode } from '@/hooks/use-language';
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
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese Simplified', native: '中文简体', flag: '🇨🇳' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', name: 'English (US)', native: 'English', flag: '🇺🇸' },
];

const translations: Record<string, Record<string, string>> = {
  'en-US': { fries: 'French Fries', chicken: 'Grilled Chicken', salad: 'Caesar Salad' },
  es: { fries: 'Papas fritas', chicken: 'Pollo a la parrilla', salad: 'Ensalada César' },
  zh: { fries: '薄薯条', chicken: '烤鸡胸', salad: '寺庙沙拉' },
  vi: { fries: 'Khoai tây chiên', chicken: 'Gà nướng', salad: 'Salad Caesar' },
};

const previewItems = [
  { qty: 2, key: 'fries' },
  { qty: 1, key: 'chicken' },
  { qty: 1, key: 'salad' },
];

const dateFormats = ['27 March 2026', 'March 27, 2026', '27/03/2026'];
const timeFormats = ['12h (2:34 PM)', '24h (14:34)'];

export default function LanguageSettings({ open, onClose }: LanguageSettingsProps) {
  const { language, setLanguage, t, displayMode, setDisplayMode, primaryLang, setPrimaryLang, secondaryLang, setSecondaryLang } = useLanguage();
  const [scope, setScope] = useState<'interface' | 'menu' | 'both'>('both');
  const [search, setSearch] = useState('');
  const [dateFormat, setDateFormat] = useState(0);
  const [timeFormat, setTimeFormat] = useState(0);
  const [localSingleLang, setLocalSingleLang] = useState<LanguageCode>(language);

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
    onClose();
  };

  const selectedLangInList = displayMode === 'dual' ? secondaryLang : localSingleLang;

  const handleSelectLang = (code: LanguageCode) => {
    if (displayMode === 'dual') {
      setSecondaryLang(code);
    } else {
      setLocalSingleLang(code);
      setLanguage(code);
    }
  };

  // Preview helpers
  const getTranslation = (key: string, lang: LanguageCode) =>
    translations[lang]?.[key] ?? translations['en-US'][key];

  const primaryInfo = getLangInfo(primaryLang);
  const secondaryInfo = getLangInfo(secondaryLang);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-dark/60 z-50 flex items-end justify-center sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <Globe size={20} className="text-text-muted" />
            <h2 className="text-lg font-bold text-text-primary">{t.languageRegion}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Scope toggle */}
            <div className="px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{t.languageScope}</div>
              <div className="flex bg-muted rounded-lg p-0.5">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setScope(opt.key)}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors min-h-[36px] ${
                      scope === opt.key ? 'bg-brand-primary text-primary-foreground' : 'text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display mode */}
            <div className="px-4 pt-2 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Display mode</div>
              <div className="flex gap-3">
                {/* Single language card */}
                <button
                  onClick={() => setDisplayMode('single')}
                  className="flex-1 rounded-lg p-3 text-left transition-all"
                  style={{
                    border: displayMode === 'single' ? '1.5px solid #111' : '1.5px solid hsl(var(--border))',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: displayMode === 'single' ? '#111' : 'hsl(var(--border))',
                      }}
                    >
                      {displayMode === 'single' && (
                        <div className="w-2 h-2 rounded-full bg-text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary">Single language</div>
                      <div className="text-[11px] text-text-muted mt-0.5">Show one language only on the KDS</div>
                      <div className="mt-2 bg-muted/50 rounded px-2 py-1.5">
                        <span className="text-[12px] font-medium text-text-primary">2× French Fries</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Dual language card */}
                <button
                  onClick={() => setDisplayMode('dual')}
                  className="flex-1 rounded-lg p-3 text-left transition-all"
                  style={{
                    border: displayMode === 'dual' ? '1.5px solid #111' : '1.5px solid hsl(var(--border))',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: displayMode === 'dual' ? '#111' : 'hsl(var(--border))',
                      }}
                    >
                      {displayMode === 'dual' && (
                        <div className="w-2 h-2 rounded-full bg-text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary">Dual language</div>
                      <div className="text-[11px] text-text-muted mt-0.5">Show two languages on every item</div>
                      <div className="mt-2 bg-muted/50 rounded px-2 py-1.5">
                        <div className="text-[12px] font-bold text-text-primary">2× French Fries</div>
                        <div className="text-[10px] text-text-muted">Papas fritas</div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Language pair (dual mode only) */}
            {displayMode === 'dual' && (
              <div className="px-4 pt-2 pb-2">
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Language pair</div>
                <div className="flex items-center gap-2">
                  {/* Primary slot */}
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2.5">
                    <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Primary</div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{primaryInfo.flag}</span>
                      <span className="text-sm font-medium text-text-primary">{primaryInfo.name}</span>
                    </div>
                  </div>

                  {/* Swap button */}
                  <button
                    onClick={handleSwap}
                    className="shrink-0 w-9 h-9 rounded-full bg-brand-primary text-primary-foreground flex items-center justify-center hover:bg-brand-primary/90 transition-colors"
                    aria-label="Swap languages"
                  >
                    <ArrowLeftRight size={16} />
                  </button>

                  {/* Secondary slot */}
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2.5">
                    <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Secondary</div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{secondaryInfo.flag}</span>
                      <span className="text-sm font-medium text-text-primary">{secondaryInfo.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-text-muted text-center mt-1.5">tap ⇆ to swap primary and secondary</div>
              </div>
            )}

            {/* Section label */}
            <div className="px-4 pt-2 pb-1">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                {displayMode === 'dual' ? 'Select secondary language' : 'Select language'}
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search size={16} className="text-text-muted" />
                <input
                  type="text"
                  placeholder={t.searchLanguages}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-h-[32px]"
                />
              </div>
            </div>

            {/* Language list */}
            <div className="px-2">
              {filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors min-h-[52px] ${
                    selectedLangInList === lang.code ? 'bg-brand-primary/10' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-text-primary">{lang.name}</div>
                    <div className="text-xs text-text-muted">{lang.native}</div>
                  </div>
                  {selectedLangInList === lang.code && (
                    <Check size={18} className="text-brand-primary" />
                  )}
                </button>
              ))}
              <div className="px-4 py-3 border-t border-border">
                <span className="text-xs font-medium text-text-muted">{t.moreLanguages}</span>
              </div>
            </div>

            {/* Live preview */}
            <div className="px-4 pt-2 pb-2">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Preview &mdash; how items will appear on KDS
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#f7f7f7' }}>
                {previewItems.map((item) => {
                  const primaryText = getTranslation(item.key, displayMode === 'dual' ? primaryLang : localSingleLang);
                  const secondaryText = displayMode === 'dual' ? getTranslation(item.key, secondaryLang) : null;
                  return (
                    <div key={item.key} className="py-1.5 border-b border-border/30 last:border-0">
                      <div className="text-[13px] font-bold text-text-primary">
                        {item.qty}× {primaryText}
                      </div>
                      {secondaryText && (
                        <div className="text-[11px] text-text-muted">
                          {secondaryText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional format */}
            <div className="px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">{t.regionalFormat}</div>

              <div className="mb-3">
                <div className="text-sm font-medium text-text-primary mb-1.5">{t.dateFormat}</div>
                <div className="flex gap-2 flex-wrap">
                  {dateFormats.map((fmt, i) => (
                    <button
                      key={fmt}
                      onClick={() => setDateFormat(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                        dateFormat === i
                          ? 'bg-brand-primary text-primary-foreground'
                          : 'bg-muted text-text-secondary'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium text-text-primary mb-1.5">{t.timeFormat}</div>
                <div className="flex gap-2">
                  {timeFormats.map((fmt, i) => (
                    <button
                      key={fmt}
                      onClick={() => setTimeFormat(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                        timeFormat === i
                          ? 'bg-brand-primary text-primary-foreground'
                          : 'bg-muted text-text-secondary'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="px-4 py-4">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

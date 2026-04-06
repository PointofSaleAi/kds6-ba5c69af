import { useState } from 'react';
import { X, Search, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'en-US', name: 'English (US)', native: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese Simplified', native: '中文简体', flag: '🇨🇳' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
];

const dateFormats = ['27 March 2026', 'March 27, 2026', '27/03/2026'];
const timeFormats = ['12h (2:34 PM)', '24h (14:34)'];

export default function LanguageSettings({ open, onClose }: LanguageSettingsProps) {
  const [selectedLang, setSelectedLang] = useState('es');
  const [scope, setScope] = useState<'interface' | 'menu' | 'both'>('both');
  const [search, setSearch] = useState('');
  const [dateFormat, setDateFormat] = useState(0);
  const [timeFormat, setTimeFormat] = useState(0);

  if (!open) return null;

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [
    ...filtered.filter((l) => l.code === selectedLang),
    ...filtered.filter((l) => l.code !== selectedLang),
  ];

  const scopeOptions = [
    { key: 'interface' as const, label: 'App Interface' },
    { key: 'menu' as const, label: 'Menu Items' },
    { key: 'both' as const, label: 'Both' },
  ];

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
            <h2 className="text-lg font-bold text-text-primary">Language & Region</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Scope toggle */}
            <div className="px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Language Scope</div>
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

            {/* Search */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search size={16} className="text-text-muted" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-h-[32px]"
                />
              </div>
            </div>

            {/* Language list */}
            <div className="px-2">
              {sorted.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors min-h-[52px] ${
                    selectedLang === lang.code ? 'bg-brand-primary/10' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-text-primary">{lang.name}</div>
                    <div className="text-xs text-text-muted">{lang.native}</div>
                  </div>
                  {selectedLang === lang.code && (
                    <Check size={18} className="text-brand-primary" />
                  )}
                </button>
              ))}
              <div className="px-4 py-3 border-t border-border">
                <span className="text-xs font-medium text-text-muted">More languages coming soon</span>
              </div>
            </div>

            {/* Regional format preview */}
            <div className="px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Regional Format</div>

              <div className="mb-3">
                <div className="text-sm font-medium text-text-primary mb-1.5">Date Format</div>
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
                <div className="text-sm font-medium text-text-primary mb-1.5">Time Format</div>
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
                onClick={onClose}
                className="w-full py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

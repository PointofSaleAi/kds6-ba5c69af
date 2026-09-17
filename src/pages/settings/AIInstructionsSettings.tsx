import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MessageSquareText,
  Plus,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';

const PREF_KEYS = {
  dos: 'ai_rules_dos',
  donts: 'ai_rules_donts',
  instructions: 'ai_rules_custom_instructions',
  restaurantType: 'ai_rules_restaurant_type',
  knowledgeBase: 'ai_rules_knowledge_base',
};

const DEFAULT_DOS = [
  'Provide accurate information about menu products.',
  'Assist staff with operational guidance.',
  'Suggest upselling products based on menu data.',
  'Provide summaries of reports or operational data.',
];

const DEFAULT_DONTS = [
  'Do not provide incorrect pricing information.',
  'Do not modify orders without user confirmation.',
  'Do not expose sensitive business or customer data.',
  'Avoid generating responses unrelated to restaurant operations.',
];

const RESTAURANT_TYPES = [
  'Fine Dining',
  'Casual Dining',
  'Café',
  'Quick Service',
  'Fast Casual',
  'Bar & Lounge',
  'Bakery',
  'Food Truck',
  'Buffet',
  'Cloud Kitchen',
  'Other',
];

function loadString(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function loadList(key: string, fallback: string[]): string[] {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default function AIInstructionsSettings() {
  const navigate = useNavigate();
  const { tui } = useLanguage();
  const [dos, setDos] = useState<string[]>(DEFAULT_DOS);
  const [donts, setDonts] = useState<string[]>(DEFAULT_DONTS);
  const [customInstructions, setCustomInstructions] = useState('');
  const [restaurantType, setRestaurantType] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [dosOpen, setDosOpen] = useState(true);
  const [dontsOpen, setDontsOpen] = useState(true);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [knowledgeOpen, setKnowledgeOpen] = useState(true);

  const initialLoad = useRef(true);

  useEffect(() => {
    setDos(loadList(PREF_KEYS.dos, DEFAULT_DOS));
    setDonts(loadList(PREF_KEYS.donts, DEFAULT_DONTS));
    setCustomInstructions(loadString(PREF_KEYS.instructions, ''));
    setRestaurantType(loadString(PREF_KEYS.restaurantType, ''));
    setKnowledgeBase(loadString(PREF_KEYS.knowledgeBase, ''));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(PREF_KEYS.dos, JSON.stringify(dos));
        window.localStorage.setItem(PREF_KEYS.donts, JSON.stringify(donts));
        window.localStorage.setItem(PREF_KEYS.instructions, customInstructions);
        window.localStorage.setItem(PREF_KEYS.restaurantType, restaurantType);
        window.localStorage.setItem(PREF_KEYS.knowledgeBase, knowledgeBase);
      } catch {
        // ignore quota errors
      }
    }, 500);
    return () => clearTimeout(t);
  }, [dos, donts, customInstructions, restaurantType, knowledgeBase, loaded]);

  const addDo = () => {
    const t = newDo.trim();
    if (!t) return;
    setDos((p) => [...p, t]);
    setNewDo('');
  };
  const addDont = () => {
    const t = newDont.trim();
    if (!t) return;
    setDonts((p) => [...p, t]);
    setNewDont('');
  };

  if (!loaded) return null;

  const cardStyle = {
    background: 'hsl(var(--surface-card))',
    border: '1px solid hsl(var(--border))',
  } as const;

  const sectionHeader = (
    title: string,
    Icon: typeof ShieldCheck,
    iconColor: string,
    open: boolean,
    onToggle: () => void,
    count?: number,
  ) => (
    <button
      onClick={onToggle}
      type="button"
      className="flex items-center justify-between w-full py-3.5 px-4 active:opacity-70 transition-opacity"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={18} style={{ color: iconColor }} />
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
          {title}
        </span>
        {typeof count === 'number' && (
          <span
            className="text-[11px] rounded-full px-2 py-0.5"
            style={{
              color: 'hsl(var(--text-muted))',
              background: 'hsl(var(--surface-muted))',
            }}
          >
            {count}
          </span>
        )}
      </div>
      {open ? (
        <ChevronUp size={16} style={{ color: 'hsl(var(--text-muted))' }} />
      ) : (
        <ChevronDown size={16} style={{ color: 'hsl(var(--text-muted))' }} />
      )}
    </button>
  );

  return (
    <>
      <div className="flex items-center justify-between pt-0 pb-4 mb-2 relative">
        <button
          type="button"
          onClick={() => navigate('/kds/v1/settings/system/ai-integration')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
          style={cardStyle}
          aria-label={tui('Back')}
        >
          <ChevronLeft size={20} style={{ color: 'hsl(var(--text-primary))' }} />
        </button>
        <h1
          className="absolute left-1/2 -translate-x-1/2"
          style={{ color: 'hsl(var(--text-primary))', fontSize: 20, fontWeight: 600 }}
        >
          AI Instructions
        </h1>
      </div>

      <p
        className="text-[13px] leading-relaxed mb-4 px-1"
        style={{ color: 'hsl(var(--text-muted))' }}
      >
        {tui('Define global rules, custom instructions, and restaurant knowledge to guide AI behavior across all providers.')}
      </p>

      {/* Do's */}
      <div className="mb-3 rounded-[28px] overflow-hidden" style={cardStyle}>
        {sectionHeader("Do's", ShieldCheck, '#16A085', dosOpen, () => setDosOpen(!dosOpen), dos.length)}
        {dosOpen && (
          <div className="px-4 pb-4 space-y-2">
            {dos.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl px-3 py-2.5 group"
                style={{ background: 'hsl(var(--surface-muted))' }}
              >
                <span className="text-[12px] mt-0.5 shrink-0" style={{ color: '#16A085' }}>✓</span>
                <span
                  className="text-[13px] flex-1 leading-relaxed"
                  style={{ color: 'hsl(var(--text-primary))' }}
                >
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => setDos((p) => p.filter((_, idx) => idx !== i))}
                  className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                  style={{ color: 'hsl(var(--text-muted))' }}
                  aria-label={tui('Remove')}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <Input
                value={newDo}
                onChange={(e) => setNewDo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDo()}
                placeholder={tui('Add a new rule...')}
                className="text-sm flex-1"
              />
              <button
                type="button"
                onClick={addDo}
                disabled={!newDo.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity shrink-0 disabled:opacity-30"
                style={{ background: '#16A085' }}
                aria-label={tui('Add Do')}
              >
                <Plus size={16} color="#FFFFFF" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Don'ts */}
      <div className="mb-3 rounded-[28px] overflow-hidden" style={cardStyle}>
        {sectionHeader("Don'ts", ShieldAlert, '#E74C3C', dontsOpen, () => setDontsOpen(!dontsOpen), donts.length)}
        {dontsOpen && (
          <div className="px-4 pb-4 space-y-2">
            {donts.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl px-3 py-2.5 group"
                style={{ background: 'hsl(var(--surface-muted))' }}
              >
                <span className="text-[12px] mt-0.5 shrink-0" style={{ color: '#E74C3C' }}>✗</span>
                <span
                  className="text-[13px] flex-1 leading-relaxed"
                  style={{ color: 'hsl(var(--text-primary))' }}
                >
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => setDonts((p) => p.filter((_, idx) => idx !== i))}
                  className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                  style={{ color: 'hsl(var(--text-muted))' }}
                  aria-label={tui('Remove')}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <Input
                value={newDont}
                onChange={(e) => setNewDont(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDont()}
                placeholder={tui('Add a restriction...')}
                className="text-sm flex-1"
              />
              <button
                type="button"
                onClick={addDont}
                disabled={!newDont.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity shrink-0 disabled:opacity-30"
                style={{ background: '#E74C3C' }}
                aria-label={tui("Add Don't")}
              >
                <Plus size={16} color="#FFFFFF" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Instructions */}
      <div className="mb-3 rounded-[28px] overflow-hidden" style={cardStyle}>
        {sectionHeader(
          tui('Custom Instructions'),
          MessageSquareText,
          '#2980B9',
          instructionsOpen,
          () => setInstructionsOpen(!instructionsOpen),
        )}
        {instructionsOpen && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-[12px] leading-relaxed" style={{ color: 'hsl(var(--text-muted))' }}>
              {tui('Define tone, style, and behavior guidelines. These instructions are sent to every AI conversation.')}
            </p>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder={`Example:\n- Use a professional and friendly tone.\n- Always recommend menu products when relevant.\n- Keep responses concise (under 3 sentences).\n- Assist staff with step-by-step operational guidance.\n- When discussing pricing, always use the current menu prices.`}
              className="text-sm min-h-[160px] resize-y"
              rows={7}
            />
          </div>
        )}
      </div>

      {/* Knowledge Base */}
      <div className="mb-6 rounded-[28px] overflow-hidden" style={cardStyle}>
        {sectionHeader(
          tui('Restaurant Knowledge Base'),
          BookOpen,
          '#F39C12',
          knowledgeOpen,
          () => setKnowledgeOpen(!knowledgeOpen),
        )}
        {knowledgeOpen && (
          <div className="px-4 pb-4 space-y-4">
            <p className="text-[12px] leading-relaxed" style={{ color: 'hsl(var(--text-muted))' }}>
              {tui('Provide restaurant-specific context so AI can give accurate, relevant responses.')}
            </p>

            <div>
              <label
                className="text-[12px] font-medium block mb-2"
                style={{ color: 'hsl(var(--text-secondary))' }}
              >
                {tui('Restaurant Type')}
              </label>
              <div className="flex flex-wrap gap-2">
                {RESTAURANT_TYPES.map((type) => {
                  const selected = restaurantType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRestaurantType(selected ? '' : type)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
                      style={{
                        background: selected
                          ? 'hsl(var(--brand-primary))'
                          : 'hsl(var(--surface-muted))',
                        color: selected
                          ? 'hsl(var(--brand-primary-foreground))'
                          : 'hsl(var(--text-secondary))',
                      }}
                    >
                      {tui(type)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className="text-[12px] font-medium block mb-2"
                style={{ color: 'hsl(var(--text-secondary))' }}
              >
                {tui('Additional Knowledge & Context')}
              </label>
              <Textarea
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                placeholder={`Add restaurant-specific information:\n\n- Menu highlights and specialties\n- Pricing and current promotions\n- Operational workflows\n- Customer service guidelines\n- Dietary and allergen policies\n- Seating and reservation rules`}
                className="text-sm min-h-[160px] resize-y"
                rows={7}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

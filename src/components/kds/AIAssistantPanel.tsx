import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Settings, Bot, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimatedAIIcon from './AnimatedAIIcon';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';
import { useAIIntegration, AI_PROVIDER_LABELS, AI_PROVIDER_SHORT_LABELS, AI_PROVIDER_MODELS } from '@/hooks/use-ai-integration';
import { AIProviderSwitcher } from './AIProviderSwitcher';
import { cn } from '@/lib/utils';
import { useActiveKDSView } from '@/hooks/use-active-kds-view';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { RESTAURANT_PRESETS, buildPresetMessage, type RestaurantPreset, type RestaurantPresetId } from '@/data/restaurant-presets';
import { useTheme } from '@/hooks/use-theme';

interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

type RouteContent = { chips: string[]; example: string; contextKey: string };

const HOME_CONTENT: RouteContent = {
  contextKey: 'home-unseen',
  chips: [
    'Mark all seen',
    'Oldest first',
    'Filter by order type',
    'Allergen alerts',
    'Show overtime tickets',
    'Sort by table',
    'Hide seen tickets',
    'Show all tickets',
    'Busiest station',
    'Fire next course',
    'Show dine-in only',
    'Show delivery only',
  ],
  example: '"How many unseen tickets are waiting?"',
};

const ROUTE_CONTENT: Record<string, RouteContent> = {
  '/kds/v1': HOME_CONTENT,
  '/kds/v2': HOME_CONTENT,
  '/kds/v3': HOME_CONTENT,
  '/kds/v4': HOME_CONTENT,
  '/kds/v1/history': {
    contextKey: 'history',
    chips: [
      'Recall a ticket',
      "Today's summary",
      'Filter by time',
      'Search by table',
      'Show cancelled tickets',
      'Filter by order type',
      'Show overtime tickets',
      'Export summary',
      'Average ticket time',
      'Busiest hour',
      'Top allergens today',
      'Recalled tickets',
    ],
    example: '"Recall ticket 32"',
  },
  '/kds/v1/settings/display': {
    contextKey: 'settings-display',
    chips: [
      'Text size',
      'Ticket layout',
      'Dark mode',
      'Reset display',
      'Order type colours',
      'Language',
      'Allergen badges',
      'Ticket spacing',
      'Cards per row',
      'Stagger mode',
      'Ticket identifier',
      'Header style',
    ],
    example: '"Switch to compact layout"',
  },
  '/kds/v1/settings/orders': {
    contextKey: 'settings-orders',
    chips: [
      'Set up Order Hold',
      'Allergen badges',
      'Servable modifiers',
      'Ticket aging rules',
      'Reset tickets',
      'Header allergen summary',
      'Sort default',
      'Course aging',
      'Order notes',
    ],
    example: '"Enable allergen badges"',
  },
  '/kds/v1/settings/hardware': {
    contextKey: 'settings-hardware',
    chips: [
      'KOT printer',
      'Sound settings',
      'Sync now',
      'Connection',
      'Label printer',
      'Test print',
      'Pair device',
      'Station ID',
    ],
    example: '"Set up my KOT printer"',
  },
  '/kds/v1/settings/account': {
    contextKey: 'settings-account',
    chips: [
      'Device name',
      'Station ID',
      'Bug reporting',
      'Log out',
      'Reset to defaults',
      'Upload logs',
      'App version',
      'Switch user',
    ],
    example: '"What is my station ID?"',
  },
};

const FALLBACK_CONTENT: RouteContent = {
  contextKey: 'settings-nav',
  chips: [
    'Display settings',
    'Ticket settings',
    'Hardware',
    'Account',
    'Language',
    'Sound settings',
    'Order type colours',
    'Reset to defaults',
    'AI integration',
    'AI instructions',
    'Printers',
    'Status rules',
  ],
  example: '"Set text size to large"',
};

const VIEW_CONTENT: Record<string, RouteContent> = {
  history: ROUTE_CONTENT['/kds/v1/history'],
  'seen-orders': {
    contextKey: 'home-seen',
    chips: [
      'Show overtime tickets',
      'Filter by station',
      'Allergen alerts',
      'Sort by order type',
      'Mark all done',
      'Show unseen tickets',
      'Filter by time',
      'Show all tickets',
      'Oldest first',
      'Busiest station',
      'Show dine-in only',
      'Show delivery only',
    ],
    example: '"Show all overtime tickets"',
  },
  'unseen-orders': HOME_CONTENT,
};

function getRouteContent(pathname: string, view?: string | null): RouteContent {
  if (view && VIEW_CONTENT[view]) return VIEW_CONTENT[view];
  if (ROUTE_CONTENT[pathname]) return ROUTE_CONTENT[pathname];
  const match = Object.keys(ROUTE_CONTENT).find(k => pathname.startsWith(k) && k !== '/kds/v1');
  if (match) return ROUTE_CONTENT[match];
  if (pathname === '/' || pathname.startsWith('/kds/v1')) return HOME_CONTENT;
  return FALLBACK_CONTENT;
}

const LEARNED_STORAGE_KEY = 'posai-maya-learned-queries';
type LearnedMap = Record<string, string[]>;

function loadLearned(): LearnedMap {
  try {
    const raw = localStorage.getItem(LEARNED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLearned(map: LearnedMap) {
  try {
    localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

type ChipOption = { label: string; value: string };

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  presetId?: RestaurantPresetId;
  presetApplied?: boolean;
  chips?: ChipOption[];
  chipsUsed?: boolean;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kds-ai-chat`;

export function AIAssistantPanel({ open, onClose }: AIAssistantPanelProps) {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const { layout } = useDockLayout();
  const insets = getOverlayInsets(layout);
  const ai = useAIIntegration();
  const navigate = useNavigate();
  const location = useLocation();
  const { view: activeKDSView } = useActiveKDSView();
  const kdsSettings = useKDSSettings();
  const statusRules = useStatusRules();
  const { theme, setTheme } = useTheme();
  const [selectedPresetId, setSelectedPresetId] = useState<RestaurantPresetId | null>(null);
  const isSettingsRoute = location.pathname.startsWith('/kds/v1/settings');
  const routeContent = getRouteContent(location.pathname, activeKDSView);
  const { chips: SUGGESTION_CHIPS, example: TRY_EXAMPLE, contextKey } = routeContent;
  const [learnedMap, setLearnedMap] = useState<LearnedMap>(() => loadLearned());
  const learnedForContext = (learnedMap[contextKey] || []).slice(0, 3);
  const providerReady = ai.enabled && !!ai.provider && ai.status === 'connected';
  const providerLabel = ai.provider ? AI_PROVIDER_LABELS[ai.provider] : 'Not configured';
  const providerShort = ai.provider ? AI_PROVIDER_SHORT_LABELS[ai.provider] : 'AI';
  const providerModel = ai.provider ? AI_PROVIDER_MODELS[ai.provider] : '';
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const toggleRecording = () => setRecording(r => !r);

  const handleSelectPreset = (preset: RestaurantPreset) => {
    setSelectedPresetId(preset.id);
    // Replace any existing pending preset message; append new one
    setMessages(prev => {
      const filtered = prev.filter(m => !(m.presetId && !m.presetApplied));
      return [
        ...filtered,
        {
          id: `preset-${preset.id}-${Date.now()}`,
          role: 'assistant',
          text: buildPresetMessage(preset),
          presetId: preset.id,
          presetApplied: false,
        },
      ];
    });
  };

  const handleApplyPreset = (messageId: string, presetId: RestaurantPresetId) => {
    const preset = RESTAURANT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    // Apply wired settings
    kdsSettings.setTextSize(preset.textSize);
    kdsSettings.setTicketSpacing(preset.ticketSpacing);
    kdsSettings.setTicketLayout(preset.ticketLayout);
    kdsSettings.setShowAllergens(preset.allergenBadges);
    kdsSettings.setShowHeaderAllergens(preset.ticketHeaderAllergenSummary);
    kdsSettings.setServableModifiers(preset.servableModifiers);
    statusRules.setCourseLevelAging(preset.applyToCourseLevel);
    // Best-effort persistence for remaining keys
    try {
      localStorage.setItem('posai-ticket-identifier', preset.ticketIdentifier);
      localStorage.setItem('posai-aging-preset', preset.agingRules);
      localStorage.setItem('posai-mode-switcher', preset.modeSwitcher);
      localStorage.setItem('posai-language-mode', preset.language);
      localStorage.setItem('posai-enable-badge', String(preset.enableBadge));
      localStorage.setItem('posai-sound-volume', String(preset.volume));
      localStorage.setItem('posai-alert-sound', preset.alertSound);
      localStorage.setItem('posai-restaurant-preset', preset.id);
    } catch { /* ignore */ }

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, presetApplied: true } : m,
    ).concat({
      id: `applied-${Date.now()}`,
      role: 'assistant',
      text: `✓ **${preset.label}** settings applied. You can adjust any of these individually in settings anytime.`,
    }));
    setSelectedPresetId(null);
  };

  const handleCancelPreset = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setSelectedPresetId(null);
  };


  const openAISettings = () => {
    onClose();
    navigate('/kds/v1/settings/system/ai-integration');
  };

  const CANNED_RESPONSES: Record<string, string> = {
    'set up order hold': [
      "**Order Hold** delays new tickets from hitting the kitchen for a set time, so servers can add or edit items before prep starts.",
      '',
      '**Next steps:**',
      '1. Open **Settings → Tickets**.',
      '2. Toggle **Order Hold** on.',
      '3. Tap the **Hold time** pill and pick a delay (1m to 30m).',
      '4. New tickets from the POS will now wait for that duration before appearing on the KDS.',
      '',
      'Want me to walk you through anything else, like turning it off or picking the right hold time for your service?',
    ].join('\n'),
  };

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || streaming) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const assistantId = `a-${Date.now()}`;
    const nextHistory = [...messages, userMsg];

    const canned = CANNED_RESPONSES[trimmed.toLowerCase()];
    if (canned) {
      setMessages([...nextHistory, { id: assistantId, role: 'assistant', text: canned }]);
      setInput('');
      return;
    }


    if (!providerReady) {
      const reason = !ai.enabled
        ? 'AI integration is turned off. Enable it in Settings → System → AI Integration to start chatting.'
        : !ai.provider
          ? 'Maya is not selected. Enable Maya in Settings → System → AI Integration.'
          : `${providerLabel} is not connected (status: ${ai.status.replace('_', ' ')}). Save the provider in Settings → System → AI Integration to connect.`;
      setMessages([...nextHistory, { id: assistantId, role: 'assistant', text: reason }]);
      setInput('');
      return;
    }

    setMessages([...nextHistory, { id: assistantId, role: 'assistant', text: '' }]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: ai.provider,
          messages: nextHistory.map(m => ({ role: m.role, content: m.text })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let errMsg = 'Assistant is unavailable. Please try again.';
        try {
          const data = await res.json();
          if (data?.error) errMsg = data.error;
        } catch {}
        setMessages(m => m.map(msg => msg.id === assistantId ? { ...msg, text: errMsg } : msg));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              acc += delta;
              setMessages(m => m.map(msg => msg.id === assistantId ? { ...msg, text: acc } : msg));
            }
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(m => m.map(msg => msg.id === assistantId
          ? { ...msg, text: 'Connection error. Please try again.' }
          : msg));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const recordLearnedQuery = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setLearnedMap(prev => {
      const existing = (prev[contextKey] || []).filter(x => x.toLowerCase() !== q.toLowerCase());
      const next = { ...prev, [contextKey]: [q, ...existing].slice(0, 3) };
      saveLearned(next);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      recordLearnedQuery(input);
      submitPrompt(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bg-black/40 z-40"
            style={{ left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed z-50 w-[440px] max-w-[95vw] p-[10px] pl-0"
            style={{ right: insets.right, top: insets.top, bottom: insets.bottom }}
          >
            <div
              className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/50 flex flex-col"
              style={{ background: '#131316' }}
            >
              {/* Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between">
                <AIProviderSwitcher provider={ai.provider} model={ai.model} />

                <div className="flex items-center gap-2">
                  <button
                    onClick={openAISettings}
                    className="w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700/60 flex items-center justify-center active:opacity-70 transition-opacity"
                    title="AI Settings"
                  >
                    <Settings className="w-4 h-4 text-neutral-300" />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close AI assistant"
                    className="w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700/60 flex items-center justify-center active:opacity-70 transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Not-ready notice */}
              {!providerReady && (
                <div className="flex-shrink-0 px-4 py-2 text-[11px] leading-snug border-b border-neutral-800/60 bg-amber-500/10 text-amber-300">
                  {!ai.enabled
                    ? 'AI integration is off. '
                    : !ai.provider
                      ? 'No provider selected. '
                      : `${providerLabel} is ${ai.status.replace('_', ' ')}. `}
                  <button onClick={openAISettings} className="underline font-semibold">
                    Open AI Integration
                  </button>
                </div>
              )}

              {/* Messages / Empty state */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                {!hasMessages ? (
                  <div className="min-h-full flex flex-col justify-center px-1">
                    {/* Hero: horizontal layout */}
                    <div className="flex items-center gap-3 mb-5 text-left">
                      <div className="flex-shrink-0 overflow-visible">
                        <AnimatedAIIcon size={44} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-white leading-tight">
                          How can I help you today?
                        </h2>
                        <p className="text-neutral-400 text-xs mt-0.5">
                          Ask about tickets, allergens, courses, or KDS settings.
                        </p>
                      </div>
                    </div>

                    {isSettingsRoute && (
                      <div className="w-full mb-4">
                        <p
                          className="mb-2 text-left"
                          style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}
                        >
                          Set up for your restaurant type
                        </p>
                        <div className="flex flex-wrap" style={{ gap: 6 }}>
                          {RESTAURANT_PRESETS.map(p => {
                            const active = selectedPresetId === p.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => handleSelectPreset(p)}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  padding: '5px 12px',
                                  borderRadius: 20,
                                  background: active ? '#1A1A2E' : '#F3F4F6',
                                  color: active ? '#FFFFFF' : '#374151',
                                  border: `0.5px solid ${active ? '#1A1A2E' : '#E5E7EB'}`,
                                }}
                                className="transition-colors active:opacity-80"
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center">
                      {learnedForContext.map(q => {
                        const label = q.length > 30 ? q.slice(0, 30) + '…' : q;
                        return (
                          <button
                            key={`learned-${q}`}
                            onClick={() => submitPrompt(q)}
                            title={q}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-violet-500/10 text-sm text-white hover:bg-violet-500/20 active:opacity-70 transition-all border border-violet-400/30 text-left"
                          >
                            <Bot className="w-3.5 h-3.5 text-violet-300 flex-shrink-0" />
                            <span className="truncate">{label}</span>
                          </button>
                        );
                      })}
                      {SUGGESTION_CHIPS.map(chip => (
                        <button
                          key={chip}
                          onClick={() => submitPrompt(chip)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-neutral-800/60 text-sm text-white hover:bg-neutral-700/60 active:opacity-70 transition-all border border-neutral-700/50 text-left"
                        >
                          <Bot className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                          <span className="truncate">{chip}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-5 text-center">
                      <p className="text-xs text-neutral-400 mb-1">Try asking:</p>
                      <p className="text-xs text-neutral-500">{TRY_EXAMPLE}</p>
                    </div>
                  </div>

                ) : (
                  <>
                    {messages.filter(m => !(m.role === 'assistant' && !m.text)).map(m => (
                      <div
                        key={m.id}
                        className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        {m.role === 'assistant' && (
                          <div className="flex-shrink-0 -ml-1 mt-0.5">
                            <AnimatedAIIcon size={24} />
                          </div>
                        )}
                        <div className="max-w-[85%]">
                          {m.text && (
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-3 text-sm',
                                m.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-neutral-800/60 text-white'
                              )}
                            >
                              {m.role === 'assistant' ? (
                                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-white">
                                  <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{m.text}</p>
                              )}
                            </div>
                          )}
                          {m.presetId && !m.presetApplied && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleApplyPreset(m.id, m.presetId!)}
                                style={{
                                  background: '#E84C3D', color: '#FFFFFF',
                                  fontSize: 12, fontWeight: 600,
                                  padding: '8px 20px', borderRadius: 8,
                                }}
                                className="active:opacity-80 transition-opacity"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => handleCancelPreset(m.id)}
                                style={{
                                  background: '#F3F4F6', color: '#374151',
                                  fontSize: 12, fontWeight: 600,
                                  padding: '8px 20px', borderRadius: 8,
                                }}
                                className="active:opacity-80 transition-opacity"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {streaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.text && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0 -ml-1 mt-0.5">
                          <AnimatedAIIcon size={24} />
                        </div>
                        <div className="bg-neutral-800/60 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-[10px] text-neutral-400">{providerLabel}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-neutral-800/60">
                <form
                  onSubmit={(e) => { e.preventDefault(); recordLearnedQuery(input); submitPrompt(input); }}
                  className="flex gap-3 items-center"
                >
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={streaming}
                    aria-label={recording ? 'Stop recording' : 'Start voice input'}
                    aria-pressed={recording}
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                      recording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-700/60 hover:text-white'
                    )}
                  >
                    {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={recording ? 'Listening...' : 'Ask me anything...'}
                      disabled={streaming}
                      className={cn(
                        'w-full bg-neutral-800/60 rounded-full px-5 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-60',
                        recording && 'ring-2 ring-red-500/50'
                      )}
                      readOnly={recording}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || streaming || recording}
                    aria-label="Send message"
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                      input.trim() && !streaming && !recording
                        ? 'bg-primary text-primary-foreground active:opacity-70'
                        : 'bg-neutral-800/60 text-neutral-500'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                {recording && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-red-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Listening... Speak your command
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

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
import { useKDSSettings, type TextSize, type TicketLayout, type TicketSpacing, type SortDefault } from '@/hooks/use-kds-settings';
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
    'Mark all Seen',
    'Oldest First',
    'Filter by Order Type',
    'Allergen Alerts',
    'Show Overtime Tickets',
    'Sort by Table',
    'Hide Seen Tickets',
    'Show all Tickets',
    'Busiest Station',
    'Fire Next Course',
    'Show Dine-in Only',
    'Show Delivery Only',
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
      'Recall a Ticket',
      "Today's summary",
      'Filter by Time',
      'Search by Table',
      'Show Cancelled Tickets',
      'Filter by Order Type',
      'Show Overtime Tickets',
      'Export Summary',
      'Average Ticket Time',
      'Busiest Hour',
      'Top Allergens Today',
      'Recalled Tickets',
    ],
    example: '"Recall ticket 32"',
  },
  '/kds/v1/settings/display': {
    contextKey: 'settings-display',
    chips: [
      'Text Size',
      'Ticket Layout',
      'Dark Mode',
      'Reset Display',
      'Order Type Colours',
      'Language',
      'Allergen Badges',
      'Ticket Spacing',
      'Cards per Row',
      'Stagger Mode',
      'Ticket Identifier',
      'Header Style',
    ],
    example: '"Switch to compact layout"',
  },
  '/kds/v1/settings/orders': {
    contextKey: 'settings-orders',
    chips: [
      'Set up Order Hold',
      'Allergen Badges',
      'Servable Modifiers',
      'Ticket Aging Rules',
      'Reset Tickets',
      'Header Allergen Summary',
      'Sort Default',
      'Course Aging',
      'Order Notes',
    ],
    example: '"Enable allergen badges"',
  },
  '/kds/v1/settings/hardware': {
    contextKey: 'settings-hardware',
    chips: [
      'KOT Printer',
      'Sound Settings',
      'Sync Now',
      'Connection',
      'Label Printer',
      'Test Print',
      'Pair Device',
      'Station ID',
    ],
    example: '"Set up my KOT printer"',
  },
  '/kds/v1/settings/account': {
    contextKey: 'settings-account',
    chips: [
      'Device Name',
      'Station ID',
      'Bug Reporting',
      'Log out',
      'Reset to Defaults',
      'Upload Logs',
      'App Version',
      'Switch User',
    ],
    example: '"What is my station ID?"',
  },
};

const FALLBACK_CONTENT: RouteContent = {
  contextKey: 'settings-nav',
  chips: [
    'Display Settings',
    'Ticket Settings',
    'Hardware',
    'Account',
    'Language',
    'Sound Settings',
    'Order Type Colours',
    'Reset to Defaults',
    'AI Integration',
    'AI Instructions',
    'Printers',
    'Status Rules',
  ],
  example: '"Set text size to large"',
};

const VIEW_CONTENT: Record<string, RouteContent> = {
  history: ROUTE_CONTENT['/kds/v1/history'],
  'seen-orders': {
    contextKey: 'home-seen',
    chips: [
      'Show Overtime Tickets',
      'Filter by Station',
      'Allergen Alerts',
      'Sort by Order Type',
      'Mark all Done',
      'Show Unseen Tickets',
      'Filter by Time',
      'Show all Tickets',
      'Oldest First',
      'Busiest Station',
      'Show Dine-in Only',
      'Show Delivery Only',
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

  // Interactive intent flows: user prompt → clarifying question + suggestion chips.
  // Chip value protocol: "apply:<key>:<value>" auto-executes an action.
  type IntentReply = { text: string; chips?: ChipOption[] };
  const INTENT_FLOWS: Record<string, () => IntentReply> = {
    'set up order hold': () => ({
      text: "**Order Hold** delays new tickets so servers can adjust orders before the kitchen sees them. How long should new tickets wait?",
      chips: [
        { label: '1 minute', value: 'apply:orderhold:1' },
        { label: '5 minutes', value: 'apply:orderhold:5' },
        { label: '10 minutes', value: 'apply:orderhold:10' },
        { label: '15 minutes', value: 'apply:orderhold:15' },
        { label: '30 minutes', value: 'apply:orderhold:30' },
        { label: 'Turn it Off', value: 'apply:orderhold:off' },
      ],
    }),
    'dark mode': () => ({
      text: "Sure — do you want dark mode on or off?",
      chips: [
        { label: 'Turn on', value: 'apply:theme:dark' },
        { label: 'Turn Off', value: 'apply:theme:light' },
      ],
    }),
    'text size': () => ({
      text: "Pick a text size and I'll apply it right away.",
      chips: [
        { label: 'Compact', value: 'apply:textsize:Compact' },
        { label: 'Standard', value: 'apply:textsize:Standard' },
        { label: 'Large', value: 'apply:textsize:Large' },
      ],
    }),
    'ticket layout': () => ({
      text: "Which ticket layout do you want to use?",
      chips: [
        { label: 'Standard', value: 'apply:layout:standard' },
        { label: 'Compact', value: 'apply:layout:compact' },
        { label: 'Header Only', value: 'apply:layout:header' },
      ],
    }),
    'ticket spacing': () => ({
      text: "Pick a ticket spacing:",
      chips: [
        { label: 'Compact', value: 'apply:spacing:Compact' },
        { label: 'Standard', value: 'apply:spacing:Standard' },
        { label: 'Spacious', value: 'apply:spacing:Spacious' },
      ],
    }),
    'allergen badges': () => ({
      text: "Allergen badges highlight allergy info on each product. On or off?",
      chips: [
        { label: 'Turn on', value: 'apply:allergens:on' },
        { label: 'Turn Off', value: 'apply:allergens:off' },
      ],
    }),
    'header allergen summary': () => ({
      text: "Show the allergen summary on the ticket header?",
      chips: [
        { label: 'Show', value: 'apply:headerallergens:on' },
        { label: 'Hide', value: 'apply:headerallergens:off' },
      ],
    }),
    'servable modifiers': () => ({
      text: "Servable modifiers move specific modifiers through the 3-step lifecycle. On or off?",
      chips: [
        { label: 'Turn on', value: 'apply:servmods:on' },
        { label: 'Turn Off', value: 'apply:servmods:off' },
      ],
    }),
    'course aging': () => ({
      text: "Apply status aging colours per course block instead of the whole ticket?",
      chips: [
        { label: 'Turn on', value: 'apply:courseaging:on' },
        { label: 'Turn Off', value: 'apply:courseaging:off' },
      ],
    }),
    'stagger mode': () => ({
      text: "Stagger mode releases tickets in batches. On or off?",
      chips: [
        { label: 'Turn on', value: 'apply:stagger:on' },
        { label: 'Turn Off', value: 'apply:stagger:off' },
      ],
    }),
    'sort default': () => ({
      text: "How should tickets be sorted by default?",
      chips: [
        { label: 'By Time', value: 'apply:sort:By time' },
        { label: 'By Table', value: 'apply:sort:By table' },
        { label: 'By Type', value: 'apply:sort:By type' },
      ],
    }),
    'language': () => ({
      text: "Want to open the language settings?",
      chips: [
        { label: 'Open Language Settings', value: 'apply:nav:/kds/v1/settings/display/language' },
        { label: 'Not Now', value: 'apply:noop:cancel' },
      ],
    }),
    'ai integration': () => ({
      text: "I can take you to the AI integration settings.",
      chips: [
        { label: 'Open AI Integration', value: 'apply:nav:/kds/v1/settings/system/ai-integration' },
        { label: 'Not Now', value: 'apply:noop:cancel' },
      ],
    }),
  };

  const runAction = (key: string, val: string): string => {
    switch (key) {
      case 'orderhold': {
        if (val === 'off') { kdsSettings.setOrderHold(false); return '✓ Order Hold is now **off**.'; }
        const mins = parseInt(val, 10);
        kdsSettings.setOrderHold(true);
        kdsSettings.setOrderHoldMinutes(mins);
        return `✓ Order Hold is **on** with a **${mins} minute** delay. New tickets will wait ${mins}m before appearing on the KDS.`;
      }
      case 'theme':
        setTheme(val === 'dark' ? 'dark' : 'light');
        return `✓ Switched to **${val}** theme.`;
      case 'textsize':
        kdsSettings.setTextSize(val as TextSize);
        return `✓ Text size set to **${val}**.`;
      case 'layout':
        kdsSettings.setTicketLayout(val as TicketLayout);
        return `✓ Ticket layout switched to **${val}**.`;
      case 'spacing':
        kdsSettings.setTicketSpacing(val as TicketSpacing);
        return `✓ Ticket spacing set to **${val}**.`;
      case 'allergens':
        kdsSettings.setShowAllergens(val === 'on');
        return `✓ Allergen badges ${val === 'on' ? 'shown' : 'hidden'}.`;
      case 'headerallergens':
        kdsSettings.setShowHeaderAllergens(val === 'on');
        return `✓ Header allergen summary ${val === 'on' ? 'shown' : 'hidden'}.`;
      case 'servmods':
        kdsSettings.setServableModifiers(val === 'on');
        return `✓ Servable modifiers ${val === 'on' ? 'enabled' : 'disabled'}.`;
      case 'courseaging':
        statusRules.setCourseLevelAging(val === 'on');
        return `✓ Course-level aging ${val === 'on' ? 'enabled' : 'disabled'}.`;
      case 'stagger':
        kdsSettings.setStaggerMode(val === 'on');
        return `✓ Stagger mode ${val === 'on' ? 'enabled' : 'disabled'}.`;
      case 'sort':
        kdsSettings.setSortDefault(val as SortDefault);
        return `✓ Default sort set to **${val}**.`;
      case 'nav':
        onClose();
        setTimeout(() => navigate(val), 50);
        return `✓ Opening ${val}…`;
      case 'noop':
        return 'No changes made.';
      default:
        return '';
    }
  };

  const handleChip = (chip: ChipOption, sourceMessageId: string) => {
    // Mark source chips as used
    setMessages(prev => prev.map(m => m.id === sourceMessageId ? { ...m, chipsUsed: true } : m));
    if (chip.value.startsWith('apply:')) {
      const [, key, ...rest] = chip.value.split(':');
      const val = rest.join(':');
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: chip.label };
      const result = runAction(key, val);
      const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', text: result };
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      return;
    }
    submitPrompt(chip.label);
  };

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || streaming) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const assistantId = `a-${Date.now()}`;
    const nextHistory = [...messages, userMsg];

    // Check for an interactive intent flow first.
    const intent = INTENT_FLOWS[trimmed.toLowerCase()];
    if (intent) {
      const reply = intent();
      setMessages([...nextHistory, {
        id: assistantId, role: 'assistant', text: reply.text, chips: reply.chips,
      }]);
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
            style={{ left: insets.left, right: insets.right, top: `calc(${insets.top}px + var(--kds-header-h, 0px) + var(--training-bar-h, 0px))`, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed z-50 w-[440px] max-w-[95vw] p-[10px] pl-0"
            style={{ right: insets.right, top: `calc(${insets.top}px + var(--kds-header-h, 0px) + var(--training-bar-h, 0px))`, bottom: insets.bottom }}
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
                    aria-label="Close AI Assistant"
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

                    {(() => {
                      const MAX_SUGGESTIONS = 3;
                      const learnedShown = learnedForContext.slice(0, MAX_SUGGESTIONS);
                      const remaining = Math.max(0, MAX_SUGGESTIONS - learnedShown.length);
                      const chipsShown = SUGGESTION_CHIPS.slice(0, remaining);
                      return (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {learnedShown.map(q => {
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
                          {chipsShown.map(chip => (
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
                      );
                    })()}

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
                          {m.role === 'assistant' && m.chips && !m.chipsUsed && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {m.chips.map(c => (
                                <button
                                  key={c.value}
                                  onClick={() => handleChip(c, m.id)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-800/60 text-xs text-white hover:bg-neutral-700/60 active:opacity-70 transition-all border border-violet-400/30"
                                >
                                  <Bot className="w-3 h-3 text-violet-300 flex-shrink-0" />
                                  <span>{c.label}</span>
                                </button>
                              ))}
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
                    aria-label="Send Message"
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

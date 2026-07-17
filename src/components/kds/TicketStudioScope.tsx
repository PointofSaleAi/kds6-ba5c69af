import { useEffect, type ReactNode } from 'react';
import { useTicketStudioConfig } from '@/hooks/use-ticket-studio';

const STYLE_ID = 'ticket-studio-scope-css';

/**
 * Global CSS injected once. Rules are scoped to elements carrying the
 * `data-ticket-studio` attribute so they never leak into unrelated UI.
 */
const CSS = `
  [data-ticket-studio][data-ts-density="low"] .space-y-1 > * + *,
  [data-ticket-studio][data-ts-density="low"] .space-y-1\\.5 > * + *,
  [data-ticket-studio][data-ts-density="low"] .space-y-2 > * + * { margin-top: 0.55rem; }
  [data-ticket-studio][data-ts-density="high"] .space-y-1 > * + *,
  [data-ticket-studio][data-ts-density="high"] .space-y-1\\.5 > * + *,
  [data-ticket-studio][data-ts-density="high"] .space-y-2 > * + * { margin-top: 0.1rem; }
  [data-ticket-studio][data-ts-density="high"] .py-2 { padding-top: 0.3rem; padding-bottom: 0.3rem; }
  [data-ticket-studio][data-ts-density="high"] .py-1\\.5 { padding-top: 0.2rem; padding-bottom: 0.2rem; }
  [data-ticket-studio][data-ts-density="low"]  .py-1\\.5 { padding-top: 0.55rem; padding-bottom: 0.55rem; }

  [data-ticket-studio][data-ts-textsize="small"]  { font-size: 92%; }
  [data-ticket-studio][data-ts-textsize="large"]  { font-size: 108%; }

  [data-ticket-studio][data-ts-layout="compact"]  { padding: 2px; }
  [data-ticket-studio][data-ts-layout="spacious"] { padding: 10px; }

  [data-ticket-studio][data-ts-safety="muted"]  .text-\\[\\#C0392B\\],
  [data-ticket-studio][data-ts-safety="muted"]  .bg-\\[\\#E84C3D\\],
  [data-ticket-studio][data-ts-safety="muted"]  .bg-\\[\\#C0392B\\] { filter: saturate(0.4); }
  [data-ticket-studio][data-ts-safety="bright"] .text-\\[\\#C0392B\\],
  [data-ticket-studio][data-ts-safety="bright"] .bg-\\[\\#E84C3D\\],
  [data-ticket-studio][data-ts-safety="bright"] .bg-\\[\\#C0392B\\] { filter: saturate(1.4); }
  [data-ticket-studio][data-ts-safety="highlighted"] .text-\\[\\#C0392B\\],
  [data-ticket-studio][data-ts-safety="highlighted"] .bg-\\[\\#E84C3D\\],
  [data-ticket-studio][data-ts-safety="highlighted"] .bg-\\[\\#C0392B\\] { animation: ts-scope-pulse 1.4s ease-in-out infinite; }
  @keyframes ts-scope-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
`;

function ensureStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/**
 * Wraps a ticket render with the persisted Ticket Studio personalization
 * (layout, density, text size, safety emphasis, theme). Applied on every
 * ticket rendered in Tickets, Seen, Unseen, and History screens.
 */
export function TicketStudioScope({ children }: { children: ReactNode }) {
  const cfg = useTicketStudioConfig();
  useEffect(ensureStyle, []);
  return (
    <div
      data-ticket-studio
      data-ts-board={cfg.board}
      data-ts-layout={cfg.layout}
      data-ts-density={cfg.density}
      data-ts-textsize={cfg.textSize}
      data-ts-safety={cfg.safety}
      data-ts-theme={cfg.theme}
      data-ts-identifier={cfg.identifier}
      
    >
      {children}
    </div>
  );
}

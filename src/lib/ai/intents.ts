import type { VoiceIntent } from '@/types/ai';

const DESTRUCTIVE_ACTIONS = new Set<VoiceIntent['action']>(['recall']);

export function parseIntent(text: string): VoiceIntent {
  const t = text.toLowerCase().trim();

  const bumpMatch = t.match(/\b(?:bump|done|complete|served?)\b[^\d]*(?:table\s+)?(\d+)?/);
  if (bumpMatch) {
    const params: VoiceIntent['params'] = {};
    if (bumpMatch[1]) params.target = bumpMatch[1];
    return { action: 'bump', params, rawText: text };
  }

  const recallMatch = t.match(/\brecall\b[^\d]*(\d+)?/);
  if (recallMatch) {
    return {
      action: 'recall',
      params: recallMatch[1] ? { target: recallMatch[1] } : {},
      rawText: text,
      needsConfirmation: true,
    };
  }

  const filterMatch = t.match(/\b(?:show|filter|only)\s+(grill|fry|salad|dessert|bar|kitchen)/);
  if (filterMatch) {
    return { action: 'filter', params: { station: filterMatch[1] }, rawText: text };
  }

  const etaMatch = t.match(/\b(?:eta|time|how long)\b[^\d]*(\d+)/);
  if (etaMatch) {
    return { action: 'eta', params: { orderNumber: etaMatch[1] }, rawText: text };
  }

  return { action: 'unknown', params: {}, rawText: text };
}

export function describeIntent(intent: VoiceIntent): string {
  switch (intent.action) {
    case 'bump':
      return intent.params.target
        ? `Mark table ${intent.params.target} as served`
        : 'Bump current ticket';
    case 'recall':
      return intent.params.target
        ? `Recall ticket #${intent.params.target}`
        : 'Recall last ticket';
    case 'filter':
      return `Filter view to ${intent.params.station} station`;
    case 'eta':
      return `Read ETA for ticket #${intent.params.orderNumber}`;
    default:
      return 'Could not parse a known command';
  }
}

export function isDestructive(intent: VoiceIntent): boolean {
  return DESTRUCTIVE_ACTIONS.has(intent.action) || !!intent.needsConfirmation;
}

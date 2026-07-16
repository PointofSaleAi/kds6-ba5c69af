import type { ComponentProps } from 'react';
import { OrderCardV2 } from './OrderCardV2';

/**
 * Themed wrapper around the shared V2 card. Applies an accent color and
 * label token via `data-variant` so index.css can restyle without duplicating
 * the whole card. All lifecycle (Seen → Preparing → Ready → Served),
 * long-press 86, recipe modal, undo, secondary language, coursing, and Expo
 * sync behavior is inherited from OrderCardV2.
 */
export interface ThemedV2Props extends ComponentProps<typeof OrderCardV2> {}

export function makeThemedV2(variant: string, accent: string) {
  return function ThemedCard(props: ThemedV2Props) {
    return (
      <div
        data-ticket-variant={variant}
        className="ticket-variant-themed"
        style={{ ['--variant-accent' as string]: accent, borderTop: `3px solid ${accent}`, borderRadius: 10 }}
      >
        <OrderCardV2 {...props} />
      </div>
    );
  };
}

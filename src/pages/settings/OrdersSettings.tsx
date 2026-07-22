import { useState } from 'react';
import { ShoppingBag, Sparkles, AlertTriangle, Timer, Clock, Hourglass, ChevronDown, Check, MessageSquare, ChevronRight } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import { TicketsIcon } from '@/components/kds/icons/TicketsIcon';
import { QuickRepliesModal } from '@/components/settings/QuickRepliesModal';

const HOLD_TIME_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 2, label: '2 minutes' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
];

export default function OrdersSettings() {
  const {
    showAllergens, setShowAllergens,
    showHeaderAllergens, setShowHeaderAllergens,
    servableModifiers, setServableModifiers,
    productTimers, setProductTimers,
    orderHold, setOrderHold,
    orderHoldMinutes, setOrderHoldMinutes,
    quickReplies, setQuickReplies,
    quickReplyItems, setQuickReplyItems,
  } = useKDSSettings();
  const hash = useHashHighlight();

  const holdTimeValue = orderHoldMinutes;
  const selectedLabel = HOLD_TIME_OPTIONS.find((opt) => opt.value === holdTimeValue)?.label || '5 minutes';
  const handleHoldTimeChange = (value: number) => {
    setOrderHoldMinutes(value);
  };

  return (
    <>
      <SectionHeaderCard
        icon={ShoppingBag}
        iconColor={GROUP_COLOR.orders}
        iconNode={<TicketsIcon size={28} className="text-white" />}
        title="Tickets"
        shortDescription="Control how products are flagged on tickets."
        longDescription="Toggle allergen badges or servable modifiers based on your workflow."
      />


      <SettingsPill
        icon={Sparkles}
        iconColor="#7C3AED"
        label="Servable Modifiers"
        helper="Track Queued, Preparing, and Done state on each modifier individually."
        right={<SwitchToggle checked={servableModifiers} onChange={setServableModifiers} />}
        highlighted={hash === 'servable-modifiers'}
      />

      <SettingsPill
        icon={Timer}
        iconColor="#F59E0B"
        label="Coursing Timer"
        helper="Tracks prep time per product, so chefs on different stations can see each other's progress."
        right={<SwitchToggle checked={productTimers} onChange={setProductTimers} />}
        highlighted={hash === 'product-timers'}
      />

      <SettingsPill
        icon={AlertTriangle}
        iconColor="#C0392B"
        label="Allergen Badges"
        helper="Show colored allergen chips next to each product on the ticket."
        right={<SwitchToggle checked={showAllergens} onChange={setShowAllergens} />}
        highlighted={hash === 'allergen-badges'}
      />

      <SettingsPill
        icon={AlertTriangle}
        iconColor="#C0392B"
        label="Ticket Header Allergen Summary"
        helper="Show a combined allergen strip at the top of each ticket card."
        right={<SwitchToggle checked={showHeaderAllergens} onChange={setShowHeaderAllergens} />}
        highlighted={hash === 'header-allergen-summary'}
      />

      <SettingsPill
        icon={Clock}
        iconColor="#3B82F6"
        label="Order Hold"
        helper="Holds new orders for a set time before the kitchen sees them."
        right={<SwitchToggle checked={orderHold} onChange={setOrderHold} />}
        highlighted={hash === 'order-hold'}
      />

      {orderHold && (
        <div className="mb-1 @container/pill">
          <div
            className="rounded-[28px] px-4 py-2.5"
            style={{
              background: 'hsl(var(--surface-card))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'hsl(var(--muted))',
                  }}
                >
                  <Hourglass size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
                </div>
                <span
                  className="text-[15px] font-semibold"
                  style={{ color: 'hsl(var(--text-primary))' }}
                >
                  Hold time
                </span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
                    style={{
                      background: 'hsl(var(--brand-primary))',
                      color: 'hsl(var(--brand-primary-foreground))',
                      minHeight: 32,
                    }}
                  >
                    {selectedLabel}
                    <ChevronDown size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-40 p-1 rounded-xl border border-border bg-popover shadow-md"
                  align="end"
                  sideOffset={6}
                >
                  <div className="flex flex-col">
                    {HOLD_TIME_OPTIONS.map((opt) => {
                      const active = holdTimeValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleHoldTimeChange(opt.value)}
                          className="flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
                          style={{
                            color: active
                              ? 'hsl(var(--brand-primary))'
                              : 'hsl(var(--text-primary))',
                            background: active ? 'hsl(var(--muted))' : 'transparent',
                          }}
                        >
                          {opt.label}
                          {active && <Check size={14} style={{ color: 'hsl(var(--brand-primary))' }} />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <p
            className="text-xs px-2 mb-3 mt-0.5"
            style={{ color: 'hsl(var(--text-muted))' }}
          >
            Sets how long new orders wait before the kitchen sees them.
          </p>
        </div>
      )}

      <SettingsPill
        icon={MessageSquare}
        iconColor="#64748B"
        label="Quick Replies"
        helper="Let kitchen staff send preset quick responses to ticket messages."
        right={<SwitchToggle checked={quickReplies} onChange={setQuickReplies} />}
        highlighted={hash === 'quick-replies'}
      />

      {quickReplies && (
        <div className="mb-1 @container/pill">
          <div
            className="rounded-[28px] px-4 py-3"
            style={{
              background: 'hsl(var(--surface-card))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <div className="flex flex-col gap-2">
              {quickReplyItems.map((item, idx) => {
                const soft = 30;
                const nearLimit = item.length > soft;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                    style={{
                      background: 'hsl(var(--muted))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  >
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const next = [...quickReplyItems];
                        next[idx] = e.target.value;
                        setQuickReplyItems(next);
                      }}
                      placeholder="Reply text"
                      className="flex-1 bg-transparent outline-none text-[14px] font-medium"
                      style={{
                        color: nearLimit
                          ? 'hsl(var(--destructive))'
                          : 'hsl(var(--text-primary))',
                      }}
                    />
                    <span
                      className="text-[11px] tabular-nums"
                      style={{
                        color: nearLimit
                          ? 'hsl(var(--destructive))'
                          : 'hsl(var(--text-muted))',
                      }}
                    >
                      {item.length}/{soft}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuickReplyItems(quickReplyItems.filter((_, i) => i !== idx))
                      }
                      className="flex items-center justify-center rounded-full h-6 w-6 transition-colors hover:bg-black/10"
                      aria-label="Delete reply"
                    >
                      <X size={14} style={{ color: 'hsl(var(--text-muted))' }} />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setQuickReplyItems([...quickReplyItems, ''])}
                className="flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-sm font-semibold transition-colors mt-1"
                style={{
                  background: 'hsl(var(--brand-primary))',
                  color: 'hsl(var(--brand-primary-foreground))',
                }}
              >
                <Plus size={14} /> Add reply
              </button>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setQuickReplyItems([...DEFAULT_QUICK_REPLIES])}
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                  style={{ color: 'hsl(var(--text-muted))' }}
                >
                  <RotateCcw size={12} /> Reset to defaults
                </button>
              </div>
            </div>
          </div>
          <p
            className="text-xs px-2 mb-3 mt-0.5"
            style={{ color: 'hsl(var(--text-muted))' }}
          >
            These replies appear on ticket message threads for one-tap sending.
          </p>
        </div>
      )}

    </>
  );
}

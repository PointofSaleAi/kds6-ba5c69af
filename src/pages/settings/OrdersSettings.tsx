import { ShoppingBag, Sparkles, AlertTriangle, Timer, Clock, Hourglass, ChevronDown, Check } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import { TicketsIcon } from '@/components/kds/icons/TicketsIcon';

const HOLD_TIME_OPTIONS = ['1m', '2m', '5m', '10m', '15m', '30m'];

export default function OrdersSettings() {
  const {
    showAllergens, setShowAllergens,
    showHeaderAllergens, setShowHeaderAllergens,
    servableModifiers, setServableModifiers,
    productTimers, setProductTimers,
    orderHold, setOrderHold,
    orderHoldMinutes, setOrderHoldMinutes,
  } = useKDSSettings();
  const hash = useHashHighlight();

  const holdTimeValue = `${orderHoldMinutes}m`;
  const handleHoldTimeChange = (value: string) => {
    const minutes = parseInt(value.replace('m', ''), 10);
    if (!Number.isNaN(minutes)) setOrderHoldMinutes(minutes);
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
        label="Servable modifiers"
        helper="Track Queued, Preparing, and Done state on each modifier individually."
        right={<SwitchToggle checked={servableModifiers} onChange={setServableModifiers} />}
        highlighted={hash === 'servable-modifiers'}
      />

      <SettingsPill
        icon={Timer}
        iconColor="#F59E0B"
        label="Coursing timer"
        helper="Tracks prep time per product, so chefs on different stations can see each other's progress."
        right={<SwitchToggle checked={productTimers} onChange={setProductTimers} />}
        highlighted={hash === 'product-timers'}
      />

      <SettingsPill
        icon={AlertTriangle}
        iconColor="#C0392B"
        label="Allergen badges"
        helper="Show colored allergen chips next to each product on the ticket."
        right={<SwitchToggle checked={showAllergens} onChange={setShowAllergens} />}
        highlighted={hash === 'allergen-badges'}
      />

      <SettingsPill
        icon={AlertTriangle}
        iconColor="#C0392B"
        label="Ticket header allergen summary"
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
                  className="flex items-center justify-center rounded-full"
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
                    {HOLD_TIME_OPTIONS.includes(holdTimeValue) ? holdTimeValue : '5m'}
                    <ChevronDown size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-32 p-1 rounded-xl border border-border bg-popover shadow-md"
                  align="end"
                  sideOffset={6}
                >
                  <div className="flex flex-col">
                    {HOLD_TIME_OPTIONS.map((opt) => {
                      const active = holdTimeValue === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleHoldTimeChange(opt)}
                          className="flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
                          style={{
                            color: active
                              ? 'hsl(var(--brand-primary))'
                              : 'hsl(var(--text-primary))',
                            background: active ? 'hsl(var(--muted))' : 'transparent',
                          }}
                        >
                          {opt}
                          {active && <Check size={14} style={{ color: 'hsl(var(--brand-primary))' }} />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

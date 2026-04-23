import { useState } from 'react';
import {
  Monitor, LayoutGrid, Type, Rows3, Palette, Sun, Moon, Globe,
  Paintbrush, Bell, IdCard, SlidersHorizontal,
} from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import {
  SegmentedToggle, Stepper, SwitchToggle, ValueText, useHashHighlight,
} from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useKDSMode } from '@/hooks/use-kds-mode';
import LanguageSettings from '@/pages/LanguageSettings';
import StatusSettings from '@/pages/StatusSettings';
import OrderTypeColorsSettings from '@/pages/OrderTypeColorsSettings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function DisplaySettings() {
  const {
    cardsPerRow, setCardsPerRow,
    textSize, setTextSize,
    ticketLayout, setTicketLayout,
    ticketHeaderLayout, setTicketHeaderLayout,
  } = useKDSSettings();
  const { theme, setTheme } = useTheme();
  const { languageName } = useLanguage();
  const { showBadge, setShowBadge } = useBadgeVisibility();
  const { mode, setMode } = useKDSMode();
  const [displayMode, setDisplayMode] = useState('Grid');
  const [statusOpen, setStatusOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [orderTypeColorsOpen, setOrderTypeColorsOpen] = useState(false);
  const hash = useHashHighlight();

  if (statusOpen) {
    return <StatusSettings onBack={() => setStatusOpen(false)} />;
  }

  if (orderTypeColorsOpen) {
    return <OrderTypeColorsSettings onBack={() => setOrderTypeColorsOpen(false)} />;
  }

  return (
    <>
      <SectionHeaderCard
        icon={Monitor}
        iconColor={GROUP_COLOR.display}
        title="Display"
        shortDescription="Customize layout, ticket density, theme, and language for the kitchen display."
        longDescription="Customize layout, ticket density, theme, and language for the kitchen display. Choose how many cards fit per row, scale typography for legibility from across the line, and tune status aging colors to match your kitchen tempo."
      />

      <SettingsPill
        icon={LayoutGrid}
        iconColor="#525252"
        label="Display Mode"
        helper="Grid wraps cards, Horizontal scrolls, Stagger releases in waves."
        right={<SegmentedToggle options={['Grid', 'Horizontal', 'Stagger']} value={displayMode} onChange={setDisplayMode} />}
        highlighted={hash === 'display-mode'}
      />

      <SettingsPill
        icon={LayoutGrid}
        iconColor="#34A885"
        label="Cards per row"
        helper="How many tickets fit across in Grid mode."
        right={<Stepper value={cardsPerRow} onChange={setCardsPerRow} min={2} max={8} />}
        highlighted={hash === 'cards-per-row'}
      />

      <SettingsPill
        icon={Type}
        iconColor="#0A84FF"
        label="Text size"
        helper="Compact fits more tickets, Large is easier from a distance."
        right={<SegmentedToggle options={['Compact', 'Standard', 'Large']} value={textSize} onChange={(v) => setTextSize(v as 'Compact' | 'Standard' | 'Large')} />}
        highlighted={hash === 'text-size'}
      />

      <SettingsPill
        icon={Rows3}
        iconColor="#7C3AED"
        label="Ticket layout"
        helper={ticketLayout === 'compact' ? 'Compact, item names only, tap to expand details.' : 'Standard, full details and modifiers always visible.'}
        right={
          <SegmentedToggle
            options={['Standard', 'Compact']}
            value={ticketLayout === 'compact' ? 'Compact' : 'Standard'}
            onChange={(v) => setTicketLayout(v === 'Compact' ? 'compact' : 'standard')}
          />
        }
        highlighted={hash === 'ticket-layout'}
      />

      <SettingsPill
        icon={Palette}
        iconColor="#F9900E"
        label="Status colors"
        helper="Tickets change color as they age. Adjust thresholds for your kitchen speed."
        onClick={() => setStatusOpen(true)}
        highlighted={hash === 'status-colors'}
      />

      <SettingsPill
        icon={Paintbrush}
        iconColor="#16A085"
        label="Order Type Colors"
        helper="Customize header colors for Dine In, Take Out, Delivery, and Banquet."
        onClick={() => setOrderTypeColorsOpen(true)}
        highlighted={hash === 'order-type-colors'}
      />

      <SettingsPill
        icon={Bell}
        iconColor="#E84C3D"
        label="Enable Badge"
        helper="Show unread count badge on the sidebar icon."
        right={<SwitchToggle checked={showBadge} onChange={setShowBadge} />}
        highlighted={hash === 'enable-badge'}
      />

      <SettingsPill
        icon={IdCard}
        iconColor="#2980B9"
        label="Ticket Identifier"
        helper={ticketHeaderLayout === 'guest' ? 'Show guest name as primary card label.' : 'Show order number as primary card label.'}
        right={
          <SegmentedToggle
            options={['Order Number', 'Guest Name']}
            value={ticketHeaderLayout === 'guest' ? 'Guest Name' : 'Order Number'}
            onChange={(v) => setTicketHeaderLayout(v === 'Guest Name' ? 'guest' : 'kitchen')}
          />
        }
        highlighted={hash === 'ticket-identifier'}
      />

      <SettingsPill
        icon={SlidersHorizontal}
        iconColor="#5E4DD8"
        label="Mode Switcher"
        helper="KDS operational mode: Standard, Expo, or Station."
        right={
          <SegmentedToggle
            options={['Standard', 'Expo', 'Station']}
            value={mode === 'Prep' ? 'Station' : mode}
            onChange={(v) => setMode(v === 'Station' ? 'Prep' : (v as 'Standard' | 'Expo'))}
          />
        }
        highlighted={hash === 'mode-switcher'}
      />

      <SettingsPill
        icon={theme === 'dark' ? Moon : Sun}
        iconColor="#1F2937"
        label="Theme"
        helper="Switch between Light and Dark for the rest of the KDS."
        right={
          <SegmentedToggle
            options={['Light', 'Dark']}
            value={theme === 'dark' ? 'Dark' : 'Light'}
            onChange={(v) => setTheme(v === 'Dark' ? 'dark' : 'light')}
          />
        }
        highlighted={hash === 'theme'}
      />

      <SettingsPill
        icon={Globe}
        iconColor="#16A085"
        label="Language"
        helper="Display language for menu items, buttons, and notifications."
        right={<ValueText>{languageName}</ValueText>}
        onClick={() => setLanguageOpen(true)}
        highlighted={hash === 'language'}
      />

      <LanguageSettings open={languageOpen} onClose={() => setLanguageOpen(false)} />
    </>
  );
}

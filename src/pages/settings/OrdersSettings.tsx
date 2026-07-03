import { ShoppingBag, Sparkles, AlertTriangle, GraduationCap } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import { TicketsIcon } from '@/components/kds/icons/TicketsIcon';

export default function OrdersSettings() {
  const {
    showAllergens, setShowAllergens,
    showHeaderAllergens, setShowHeaderAllergens,
    servableModifiers, setServableModifiers,
  } = useKDSSettings();
  const hash = useHashHighlight();

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
    </>
  );
}

import { ShoppingBag, Sparkles, AlertTriangle } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function OrdersSettings() {
  const {
    showAllergens, setShowAllergens,
    servableModifiers, setServableModifiers,
  } = useKDSSettings();
  const hash = useHashHighlight();

  return (
    <>
      <SectionHeaderCard
        icon={ShoppingBag}
        iconColor={GROUP_COLOR.orders}
        title="Orders"
        shortDescription="Control how items are flagged on tickets."
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
        helper="Show colored allergen chips on every ticket containing flagged items."
        right={<SwitchToggle checked={showAllergens} onChange={setShowAllergens} />}
        highlighted={hash === 'allergen-badges'}
      />
      <CategoryFilterPanel open={categoryOpen} onClose={() => setCategoryOpen(false)} onApply={() => {}} />
      <RevenueCenterFilter open={revenueOpen} onClose={() => setRevenueOpen(false)} onApply={() => {}} />
      <StaggerModeSettings open={staggerOpen} onClose={() => setStaggerOpen(false)} />
    </>
  );
}

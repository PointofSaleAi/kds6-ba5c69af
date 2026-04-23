import { useState } from 'react';
import { ShoppingBag, Filter, Building2, Clock, Sparkles, AlertTriangle, ArrowDownAZ } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SegmentedToggle, SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import CategoryFilterPanel from '@/pages/CategoryFilterPanel';
import RevenueCenterFilter from '@/pages/RevenueCenterFilter';
import StaggerModeSettings from '@/pages/StaggerModeSettings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function OrdersSettings() {
  const {
    showAllergens, setShowAllergens,
    staggerMode, setStaggerMode,
    servableModifiers, setServableModifiers,
    sortDefault, setSortDefault,
  } = useKDSSettings();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [staggerOpen, setStaggerOpen] = useState(false);
  const hash = useHashHighlight();

  return (
    <>
      <SectionHeaderCard
        icon={ShoppingBag}
        iconColor={GROUP_COLOR.orders}
        title="Orders"
        shortDescription="Control which orders reach the kitchen, how they are paced, and how items are flagged."
        longDescription="Control which orders reach the kitchen, how they are paced, and how items are flagged. Filter by category or revenue center to focus on what your station prepares, and toggle allergen badges or servable modifiers based on your workflow."
      />

      <SettingsPill
        icon={Filter}
        iconColor="#F9900E"
        label="Category filter"
        helper="Show only the categories your station prepares."
        onClick={() => setCategoryOpen(true)}
        highlighted={hash === 'category-filter'}
      />

      <SettingsPill
        icon={Building2}
        iconColor="#0A84FF"
        label="Revenue center filter"
        helper="Limit orders to specific stations or revenue centers."
        onClick={() => setRevenueOpen(true)}
        highlighted={hash === 'revenue-center'}
      />

      <SettingsPill
        icon={Clock}
        iconColor="#5E4DD8"
        label="Stagger mode"
        helper={staggerMode ? 'Configure batch size and release interval.' : 'Release orders in batches to pace the kitchen.'}
        right={<SwitchToggle checked={staggerMode} onChange={setStaggerMode} />}
        onClick={staggerMode ? () => setStaggerOpen(true) : undefined}
        highlighted={hash === 'stagger-mode'}
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

      <SettingsPill
        icon={ArrowDownAZ}
        iconColor="#525252"
        label="Default sort"
        helper="How tickets are ordered when no manual sort is applied."
        right={
          <SegmentedToggle
            options={['By Time', 'By Table', 'By Type']}
            value={sortDefault}
            onChange={(v) => setSortDefault(v as 'By Time' | 'By Table' | 'By Type')}
          />
        }
        highlighted={hash === 'sort-default'}
      />

      <CategoryFilterPanel open={categoryOpen} onClose={() => setCategoryOpen(false)} onApply={() => {}} />
      <RevenueCenterFilter open={revenueOpen} onClose={() => setRevenueOpen(false)} onApply={() => {}} />
      <StaggerModeSettings open={staggerOpen} onClose={() => setStaggerOpen(false)} />
    </>
  );
}

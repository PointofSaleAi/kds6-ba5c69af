import { Send } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SegmentedToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function ExpoSettings() {
  const { expoSendButtonMode, setExpoSendButtonMode } = useKDSSettings();
  const hash = useHashHighlight();

  return (
    <>
      <SectionHeaderCard
        icon={Send}
        iconColor={GROUP_COLOR.expo}
        title="Expo View"
        shortDescription="Control how the Expediter view presents Send actions and ticket readiness."
        longDescription="Control how the Expediter view presents Send actions and ticket readiness. Choose whether the Send button is always available, or only after stations have marked their products done on the KDS."
      />

      <SettingsPill
        icon={Send}
        iconColor="#7C3AED"
        label="Show Send Button"
        helper={expoSendButtonMode === 'always'
          ? 'Always visible on every product.'
          : 'Only when the product is marked done on the KDS.'}
        right={
          <SegmentedToggle
            options={['Always', 'When ready']}
            value={expoSendButtonMode === 'always' ? 'Always' : 'When ready'}
            onChange={(v) => setExpoSendButtonMode(v === 'Always' ? 'always' : 'when-ready')}
          />
        }
        highlighted={hash === 'expo-send-button'}
      />
    </>
  );
}

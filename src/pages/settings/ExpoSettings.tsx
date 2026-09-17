import { Send } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SegmentedToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import { useLanguage } from '@/hooks/use-language';

export default function ExpoSettings() {
  const { expoSendButtonMode, setExpoSendButtonMode } = useKDSSettings();
  const { tui } = useLanguage();
  const hash = useHashHighlight();

  return (
    <>
      <SectionHeaderCard
        icon={Send}
        iconColor={GROUP_COLOR.expo}
        title={tui('Expo View')}
        shortDescription={tui('Control how the Expediter view presents Send actions and ticket readiness.')}
        longDescription={tui('Control how the Expediter view presents Send actions and ticket readiness. Choose whether the Send button is always available, or only after stations have marked their products done on the KDS.')}
      />

      <SettingsPill
        icon={Send}
        iconColor="#7C3AED"
        label={tui('Show Send Button')}
        helper={expoSendButtonMode === 'always'
          ? tui('Always visible on every product.')
          : tui('Only when the product is marked done on the KDS.')}
        right={
          <SegmentedToggle
            options={[tui('Always'), tui('When ready')]}
            value={expoSendButtonMode === 'always' ? tui('Always') : tui('When ready')}
            onChange={(v) => setExpoSendButtonMode(v === tui('Always') ? 'always' : 'when-ready')}
          />
        }
        highlighted={hash === 'expo-send-button'}
      />
    </>
  );
}

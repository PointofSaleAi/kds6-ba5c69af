import { useNavigate } from 'react-router-dom';
import { Cog, Sparkles, GraduationCap } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { useHashHighlight } from '@/components/settings/SettingsControls';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import systemIcon from '@/assets/icons/settings-system.png';

export default function SystemSettings() {
  const navigate = useNavigate();
  const hash = useHashHighlight();

  return (
    <>
      <SectionHeaderCard
        icon={Cog}
        iconSrc={systemIcon}
        iconColor={GROUP_COLOR.system}
        title="System"
        shortDescription="These settings allow you to manage and personalise your Point of Sale environment while maintaining stable system performance and functionality."
        longDescription="These settings allow you to manage and personalise your Point of Sale environment while maintaining stable system performance and functionality. Configure essential controls and preferences to ensure smooth daily operations without impacting core system behaviour."
      />


      <SettingsPill
        icon={Sparkles}
        iconColor="#3B82F6"
        label="AI Integration"
        helper="Configure external AI providers, manage API keys, and control AI-powered features."
        onClick={() => navigate('/kds/v1/settings/system/ai-integration')}
        highlighted={hash === 'ai-integration'}
      />

      <SettingsPill
        icon={GraduationCap}
        iconColor="#F59E0B"
        label="Show me how this KDS works"
        helper="Replay the new-staff onboarding walkthrough on the KDS ticket screen."
        onClick={() => window.dispatchEvent(new CustomEvent('kds:start-onboarding'))}
      />
    </>
  );
}

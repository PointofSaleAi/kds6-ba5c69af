import { useNavigate } from 'react-router-dom';
import { Cog, Sparkles } from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { useHashHighlight } from '@/components/settings/SettingsControls';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function SystemSettings() {
  const navigate = useNavigate();
  const hash = useHashHighlight();

  return (
    <>
      <SectionHeaderCard
        icon={Cog}
        iconColor={GROUP_COLOR.system}
        title="System"
        shortDescription="Manage system-level integrations and platform connections for this Kitchen Display."
        longDescription="Manage system-level integrations and platform connections for this Kitchen Display. Configure external AI providers, automation, and other platform-wide services without impacting core KDS behaviour."
      />

      <SettingsPill
        icon={Sparkles}
        iconColor="#3B82F6"
        label="AI Integration & Settings"
        helper="Connect an external AI provider (OpenAI, Gemini, Maya) with your own API key."
        onClick={() => navigate('/kds/full/settings/system/ai-integration')}
        highlighted={hash === 'ai-integration'}
      />
    </>
  );
}

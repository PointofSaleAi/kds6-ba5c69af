import { Outlet, useNavigate } from 'react-router-dom';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';

/**
 * Two-pane Settings shell. Forces light theme tokens regardless of the
 * user's global theme so the settings surface stays consistent and matches
 * the reference layout. Only this subtree is forced light, the rest of the
 * app (KDS surfaces) keeps its theme.
 */
export default function SettingsLayout() {
  const navigate = useNavigate();

  return (
    <div
      className="light flex h-screen w-screen overflow-hidden"
      style={{ background: 'hsl(var(--surface-bg))' }}
    >
      <SettingsSidebar onBackToKDS={() => navigate('/kds/full')} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { KDSSidebar } from '@/components/kds/KDSSidebar';

/**
 * Settings shell rendered inside the main KDS frame: the KDS left rail stays
 * visible so the user can jump back to Home, History, etc. without losing
 * context. The middle pane is the settings group nav, the right pane is the
 * routed settings outlet. Forced light theme for the settings surface only.
 */
export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKdsNavigate = (target: string) => {
    switch (target) {
      case 'home':
      case 'history':
      case 'seen-orders':
      case 'unseen-orders':
      case 'alerts':
        navigate('/kds/full');
        break;
      case 'settings':
        navigate('/kds/full/settings');
        break;
      default:
        navigate('/kds/full');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sidebar-bg">
      <KDSSidebar
        activeFilter="all"
        onFilterChange={() => {}}
        onNavigate={handleKdsNavigate}
        activeNav="settings"
        settingsOpen={true}
      />
      <div
        className="flex flex-1 overflow-hidden p-4 gap-4"
        style={{ background: 'hsl(var(--surface-bg))' }}
      >
        <div
          className="w-[280px] shrink-0 rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: 'hsl(var(--surface-card))',
            boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04)',
          }}
        >
          <SettingsSidebar />
        </div>
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="w-full px-4 py-6">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>
    </div>
  );
}

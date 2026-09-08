import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { usePortrait } from '@/hooks/use-portrait';
import { getTicketsRoutePath, readStoredTicketsRoute } from '@/lib/ticket-card-variant';
import { useGlassChromeMode } from '@/hooks/use-glass-chrome';

/**
 * Settings shell rendered inside the main KDS frame: the KDS left rail stays
 * visible so the user can jump back to Home, History, etc. without losing
 * context. The middle pane is the settings group nav, the right pane is the
 * routed settings outlet. Forced light theme for the settings surface only.
 */
export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPortrait } = usePortrait();
  // Settings opened while the Glass layout is active inherits its frosted chrome.
  useGlassChromeMode(readStoredTicketsRoute('v3') === 'glass');

  const resolveTicketsRoute = () => {
    return getTicketsRoutePath(readStoredTicketsRoute('v3'));
  };

  const handleKdsNavigate = (target: string) => {
    switch (target) {
      case 'home':
      case 'history':
      case 'seen-orders':
      case 'unseen-orders':
      case 'alerts':
        navigate(resolveTicketsRoute());
        break;
      case 'settings':
        navigate('/kds/v1/settings');
        break;
      default:
        navigate(resolveTicketsRoute());
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent">
      <KDSSidebar
        activeFilter="all"
        onFilterChange={() => {}}
        onNavigate={handleKdsNavigate}
        activeNav="settings"
        settingsOpen={true}
      />
      <div
        className="flex flex-1 overflow-hidden pl-0 pr-2 py-2 gap-2"
        style={{ background: 'hsl(var(--surface-bg))' }}
      >
        <div
          className={`${isPortrait ? 'w-[184px]' : 'w-[197px]'} shrink-0 overflow-hidden flex flex-col rounded-3xl`}
          style={{
            background: 'hsl(var(--surface-card))',
            boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04)',
          }}
        >
          <SettingsSidebar />
        </div>
        <main
          className="flex-1 overflow-y-auto scrollbar-hide p-4"
          style={{ background: 'hsl(var(--surface-bg))' }}
        >
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
}

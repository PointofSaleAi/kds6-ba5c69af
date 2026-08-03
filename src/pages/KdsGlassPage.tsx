import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KDSTopHeader } from '@/components/kds/KDSTopHeader';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { TicketBoard } from '@/components/kds/glass/TicketBoard';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { useOrderStore } from '@/hooks/use-order-store';
import { useTheme } from '@/hooks/use-theme';
import { getTicketsRoutePath, readStoredTicketsRoute } from '@/lib/ticket-card-variant';
import type { SortMode, ViewMode } from '@/types/kds';

/**
 * Glass ticket board screen. Reuses the persistent KDS shell (top header,
 * left rail, summary panel, bottom status bar) untouched — only the main
 * content area is the new glass TicketBoard.
 */
export default function KdsGlassPage() {
  const navigate = useNavigate();
  const { layout: dockLayout } = useDockLayout();
  const { orders } = useOrderStore();
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('stagger');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const handleNavigate = (target: string) => {
    if (target === 'settings') navigate('/kds/v1/settings');
    else navigate(getTicketsRoutePath(readStoredTicketsRoute('v3')));
  };

  return (
    <>
      <KDSTopHeader aiAssistantOpen={aiAssistantOpen} onToggleAiAssistant={() => setAiAssistantOpen((v) => !v)} />
      <div
        className={`fixed inset-0 flex bg-tickets-bg ${dockLayout.bottomBar === 'top' ? 'flex-col-reverse' : 'flex-col'}`}
        style={{ paddingTop: 'calc(var(--training-bar-h, 0px) + var(--kds-header-h, 44px))' }}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="flex shrink-0" style={{ order: dockLayout.mainSidebar === 'left' ? 0 : 4 }}>
            <KDSSidebar activeFilter="all" onFilterChange={() => {}} onNavigate={handleNavigate} activeNav="home" />
          </div>
          <main className="flex-1 overflow-auto" style={{ order: 2 }}>
            <TicketBoard />
          </main>
          <div className="flex shrink-0" style={{ order: dockLayout.summaryPanel === 'left' ? 1 : 3 }}>
            <ItemSummaryPanel orders={orders} />
          </div>
        </div>
        <BottomStatusBar
          orderCount={orders.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          aiAssistantOpen={aiAssistantOpen}
          onToggleAiAssistant={() => setAiAssistantOpen((v) => !v)}
        />
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KDSTopHeader } from '@/components/kds/KDSTopHeader';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { TicketBoard } from '@/components/kds/glass/TicketBoard';
import { GlassBoardProvider, useGlassBoard } from '@/components/kds/glass/glass-board-context';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useGlassChromeMode } from '@/hooks/use-glass-chrome';
import { useTheme } from '@/hooks/use-theme';
import { getTicketsRoutePath, readStoredTicketsRoute } from '@/lib/ticket-card-variant';

/**
 * Glass ticket board screen. Reuses the persistent KDS shell (top header,
 * left rail, summary panel, bottom status bar) untouched — the shell controls
 * are wired to the shared glass board state so they actually drive the board.
 */
function GlassShell() {
  const navigate = useNavigate();
  const { layout: dockLayout } = useDockLayout();
  const { theme, toggleTheme } = useTheme();
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const board = useGlassBoard();
  const { mode: kdsMode } = useKDSMode();
  useGlassChromeMode(true);

  const handleNavigate = (target: string) => {
    if (target === 'settings') { navigate('/kds/v1/settings'); return; }
    if (target === 'home' || target === 'history' || target === 'seen-orders' || target === 'unseen-orders') {
      board.setView(target);
      return;
    }
    navigate(getTicketsRoutePath(readStoredTicketsRoute('v3')));
  };

  const filterCount = board.selectedItems.size + board.selectedCategories.size;

  return (
    <>
      <KDSTopHeader aiAssistantOpen={aiAssistantOpen} onToggleAiAssistant={() => setAiAssistantOpen((v) => !v)} />
      <div
        className={`fixed inset-0 flex bg-tickets-bg ${dockLayout.bottomBar === 'top' ? 'flex-col-reverse' : 'flex-col'}`}
        style={{ paddingTop: 'calc(var(--training-bar-h, 0px) + var(--kds-header-h, 44px))' }}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="flex shrink-0" style={{ order: dockLayout.mainSidebar === 'left' ? 0 : 4 }}>
            <KDSSidebar
              activeFilter="all"
              onFilterChange={() => {}}
              onNavigate={handleNavigate}
              activeNav={board.view}
              seenCount={board.seenCount}
              unseenCount={board.unseenCount}
              historyCount={board.historyCount}
            />


          </div>

          <main className="flex-1 overflow-auto flex flex-col" style={{ order: 2 }}>
            <div className="flex-1 min-h-0">
              <TicketBoard />
            </div>
          </main>
          <div className="flex shrink-0" style={{ order: dockLayout.summaryPanel === 'left' ? 1 : 3 }}>
            <ItemSummaryPanel
              orders={board.orders}
              selectedItems={board.selectedItems}
              onItemToggle={board.toggleItem}
              selectedCategories={board.selectedCategories}
              onCategoryToggle={board.toggleCategory}
              onClearAll={board.clearAll}
              matchingTicketCount={filterCount > 0 ? board.tickets.length : undefined}
              expandAll={board.expandAll}
              onExpandAllChange={board.setExpandAll}
            />
          </div>
        </div>
        <BottomStatusBar
          orderCount={board.tickets.length}
          viewMode={board.viewMode}
          onViewModeChange={board.setViewMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          sortMode={board.sortMode}
          onSortModeChange={board.setSortMode}
          onOpenLanguageSettings={() => navigate('/kds/v1/settings/display#language')}
          orderTypeFilter={board.orderTypeFilter}
          onOrderTypeFilterChange={board.setOrderTypeFilter}
          aiAssistantOpen={aiAssistantOpen}
          onToggleAiAssistant={() => setAiAssistantOpen((v) => !v)}
        />
      </div>
    </>
  );
}

export default function KdsGlassPage() {
  return (
    <GlassBoardProvider>
      <GlassShell />
    </GlassBoardProvider>
  );
}

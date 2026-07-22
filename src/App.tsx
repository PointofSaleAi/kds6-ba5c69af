import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { KDSModeProvider } from "@/hooks/use-kds-mode";
import { BadgeVisibilityProvider } from "@/hooks/use-badge-visibility";
import { SoundProvider } from "@/hooks/use-sound";
import { StatusRulesProvider } from "@/hooks/use-status-rules";
import { LanguageProvider } from "@/hooks/use-language";
import { KDSSettingsProvider } from "@/hooks/use-kds-settings";
import { OrderStoreProvider } from "@/hooks/use-order-store";
import { Flag86Provider } from "@/hooks/use-flag86";
import { ItemPrepTimersProvider } from "@/hooks/use-item-prep-timers";
import { PrinterAssignmentsProvider } from "@/hooks/use-printer-assignments";
import { PortraitProvider } from "@/hooks/use-portrait";
import { KitchenMessagesProvider } from "@/hooks/use-kitchen-messages";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { DockLayoutProvider } from "@/hooks/use-dock-layout";
import { ActiveKDSViewProvider } from "@/hooks/use-active-kds-view";
import { ActiveIdentityProvider } from "@/hooks/use-active-identity";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { TrainingModeProvider } from "@/hooks/use-training-mode";
import { ScreenModeProvider, useScreenMode } from "@/hooks/use-screen-mode";
import { TrainingModeBar } from "@/components/kds/TrainingModeBar";
import { DockDragLayer } from "@/components/kds/DockDragLayer";
import { NotificationStationSync } from "@/components/kds/NotificationStationSync";
import { NotificationToastStack } from "@/components/kds/NotificationToastStack";
import PosModeShell from "@/components/kds/PosModeShell";
import Index from "./pages/Index.tsx";
import IndexOnlineOrdering from "./pages/IndexOnlineOrdering.tsx";
import NotFound from "./pages/NotFound.tsx";
import SettingsLayout from "./pages/SettingsLayout.tsx";
import DisplaySettings from "./pages/settings/DisplaySettings.tsx";
import OrdersSettings from "./pages/settings/OrdersSettings.tsx";
import ExpoSettings from "./pages/settings/ExpoSettings.tsx";
import HardwareSettings from "./pages/settings/HardwareSettings.tsx";
import AccountSettings from "./pages/settings/AccountSettings.tsx";
import SystemSettings from "./pages/settings/SystemSettings.tsx";
import AIIntegrationSettings from "./pages/settings/AIIntegrationSettings.tsx";
import AIInstructionsSettings from "./pages/settings/AIInstructionsSettings.tsx";


import KdsReplyPage from "./pages/KdsReplyPage.tsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.tsx";
import KdsV7Page from "./pages/KdsV7Page.tsx";
import QrStickersPage from "./pages/QrStickersPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
      <KDSModeProvider>
      <KDSSettingsProvider>
      <SoundProvider>
      <BadgeVisibilityProvider>
      <StatusRulesProvider>
      <OrderStoreProvider>
      <Flag86Provider>
      <ItemPrepTimersProvider>
      <PrinterAssignmentsProvider>
      <PortraitProvider>
      <KitchenMessagesProvider>
      <NotificationsProvider>
      <DockLayoutProvider>
      <ActiveKDSViewProvider>
      <ActiveIdentityProvider>
      <OnboardingProvider>
      <TrainingModeProvider>
      <TooltipProvider>
        <DockDragLayer>
          <TrainingModeBar />
          <NotificationToastStack />
          <NotificationStationSync />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/kds/v3" replace />} />
              <Route path="/kds/v1" element={<Index />} />
              <Route path="/kds/default" element={<Index />} />
              <Route path="/kds/v2" element={<Index cardVariant="v1" />} />
              <Route path="/kds/v3" element={<Index cardVariant="v2" />} />
              <Route path="/kds/v3-lite" element={<Index cardVariant="v2" />} />
              <Route path="/kds/v4" element={<Index cardVariant="v3" />} />
              <Route path="/kds/v5" element={<Index cardVariant="v4" />} />
              <Route path="/kds/v6" element={<Index cardVariant="v5" />} />
              <Route path="/kds/v7" element={<KdsV7Page />} />
              <Route path="/kds/qr-stickers" element={<QrStickersPage />} />
              <Route path="/kds/home-onlineordering" element={<IndexOnlineOrdering />} />

              {/* Settings render inside the main KDS shell so the left rail
                  and bottom status bar stay visible. */}
              <Route path="/kds/v1/settings" element={<Index />}>
                <Route index element={<Navigate to="display" replace />} />
                <Route path="display" element={<DisplaySettings />} />
                <Route path="orders" element={<OrdersSettings />} />
                <Route path="expo" element={<ExpoSettings />} />
                <Route path="hardware" element={<HardwareSettings />} />
                <Route path="system" element={<SystemSettings />} />
                <Route path="system/ai-integration" element={<AIIntegrationSettings />} />
                <Route path="system/ai-integration/ai-instructions" element={<AIInstructionsSettings />} />
                <Route path="account" element={<AccountSettings />} />
              </Route>


              <Route path="/kds-reply" element={<KdsReplyPage />} />
              <Route path="/recipe/:name" element={<RecipeDetailPage />} />
              <Route path="/recipe" element={<RecipeDetailPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DockDragLayer>
      </TooltipProvider>
      </TrainingModeProvider>
      </OnboardingProvider>
      </ActiveIdentityProvider>
      </ActiveKDSViewProvider>
      </DockLayoutProvider>
      </NotificationsProvider>
      </KitchenMessagesProvider>
      </PortraitProvider>
      </PrinterAssignmentsProvider>
      </ItemPrepTimersProvider>
      </Flag86Provider>
      </OrderStoreProvider>
      </StatusRulesProvider>
      </BadgeVisibilityProvider>
      </SoundProvider>
      </KDSSettingsProvider>
      </KDSModeProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

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
import { PrinterAssignmentsProvider } from "@/hooks/use-printer-assignments";
import { PortraitProvider } from "@/hooks/use-portrait";
import { KitchenMessagesProvider } from "@/hooks/use-kitchen-messages";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { DockLayoutProvider } from "@/hooks/use-dock-layout";
import { DockDragLayer } from "@/components/kds/DockDragLayer";
import { NotificationStationSync } from "@/components/kds/NotificationStationSync";
import { NotificationToastStack } from "@/components/kds/NotificationToastStack";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import SettingsLayout from "./pages/SettingsLayout.tsx";
import DisplaySettings from "./pages/settings/DisplaySettings.tsx";
import OrdersSettings from "./pages/settings/OrdersSettings.tsx";
import ExpoSettings from "./pages/settings/ExpoSettings.tsx";
import HardwareSettings from "./pages/settings/HardwareSettings.tsx";
import AccountSettings from "./pages/settings/AccountSettings.tsx";


import KdsReplyPage from "./pages/KdsReplyPage.tsx";

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
      <PrinterAssignmentsProvider>
      <PortraitProvider>
      <KitchenMessagesProvider>
      <NotificationsProvider>
      <DockLayoutProvider>
      <TooltipProvider>
        <DockDragLayer>
          <NotificationToastStack />
          <NotificationStationSync />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/kds/full" replace />} />
              <Route path="/kds/full" element={<Index />} />

              {/* Settings render inside the main KDS shell so the left rail
                  and bottom status bar stay visible. */}
              <Route path="/kds/full/settings" element={<Index />}>
                <Route index element={<Navigate to="display" replace />} />
                <Route path="display" element={<DisplaySettings />} />
                <Route path="orders" element={<OrdersSettings />} />
                <Route path="expo" element={<ExpoSettings />} />
                <Route path="hardware" element={<HardwareSettings />} />
                <Route path="account" element={<AccountSettings />} />
              </Route>

              <Route path="/kds-reply" element={<KdsReplyPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DockDragLayer>
      </TooltipProvider>
      </DockLayoutProvider>
      </NotificationsProvider>
      </KitchenMessagesProvider>
      </PortraitProvider>
      </PrinterAssignmentsProvider>
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

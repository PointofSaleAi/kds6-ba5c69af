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
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

import StationKDSView from "./pages/StationKDSView.tsx";

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/kds/full" replace />} />
            <Route path="/kds/full" element={<Index />} />
            <Route path="/kds/station" element={<StationKDSView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
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

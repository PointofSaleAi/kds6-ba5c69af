import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { KDSModeProvider } from "@/hooks/use-kds-mode";
import { BadgeVisibilityProvider } from "@/hooks/use-badge-visibility";
import { SoundProvider } from "@/hooks/use-sound";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FullKDSView from "./pages/FullKDSView.tsx";
import StationKDSView from "./pages/StationKDSView.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <KDSModeProvider>
      <SoundProvider>
      <BadgeVisibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kds/full" element={<FullKDSView />} />
            <Route path="/kds/station" element={<StationKDSView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </BadgeVisibilityProvider>
      </SoundProvider>
      </KDSModeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

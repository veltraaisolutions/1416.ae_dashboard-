import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Enquiries from "./pages/Enquiries";
import Schedule from "./pages/Schedule";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import { LockScreen } from "./components/LockScreen";
import { useAppLock } from "./hooks/useAppLock";

const queryClient = new QueryClient();

function AppContent() {
  const { isUnlocked, isChecking, attemptUnlock } = useAppLock();

  // Don't flash the app while checking sessionStorage
  if (isChecking) return null;

  // Show lock screen until unlocked
  if (!isUnlocked) {
    return <LockScreen onUnlock={attemptUnlock} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />
        <Route
          path="/leads"
          element={<Jobs />}
        />
        <Route
          path="/enquiries"
          element={<Enquiries />}
        />
        <Route
          path="/schedule"
          element={<Schedule />}
        />
        <Route
          path="/messages"
          element={<Messages />}
        />
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

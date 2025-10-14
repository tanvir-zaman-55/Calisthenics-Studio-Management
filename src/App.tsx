import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Classes from "./pages/Classes";
import Schedule from "./pages/Schedule";
import Admins from "./pages/Admins";
import Workouts from "./pages/Workouts";
import TraineeWorkouts from "./pages/TraineeWorkouts";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

// Wrapper component to handle role-based routing for workouts
const WorkoutsRoute = () => {
  const { isTrainee } = useAuth();
  return isTrainee ? <TraineeWorkouts /> : <Workouts />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/workouts" element={<WorkoutsRoute />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/admins" element={<Admins />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

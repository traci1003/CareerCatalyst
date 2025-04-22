import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { AuthProvider } from "@/context/AuthContext";
import { AnimationProvider } from "@/context/AnimationContext";
import { SoundProvider } from "@/context/SoundContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/applications/Applications";
import Resumes from "@/pages/resumes/Resumes";
import Portfolio from "@/pages/portfolio/Portfolio";
import Analytics from "@/pages/analytics/Analytics";
import Settings from "@/pages/settings/Settings";
import JobSearch from "@/pages/jobs/JobSearch";
import JobFilters, { NewJobFilter } from "@/pages/jobs/JobFilters";
import AuthPage from "@/pages/auth/AuthPage";
import SoundEffects from "@/components/SoundEffects";
import AnimatedBackground from "@/components/animated/AnimatedBackground";
import TestAnimationPage from "@/pages/test-animation";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/test-animation" component={TestAnimationPage} />
      
      <ProtectedRoute path="/" component={DashboardLayout} />
      <ProtectedRoute path="/applications" component={DashboardLayout} />
      <ProtectedRoute path="/resumes" component={DashboardLayout} />
      <ProtectedRoute path="/portfolio" component={DashboardLayout} />
      <ProtectedRoute path="/jobs" component={DashboardLayout} />
      <ProtectedRoute path="/jobs/filters" component={DashboardLayout} />
      <ProtectedRoute path="/jobs/filters/new" component={DashboardLayout} />
      <ProtectedRoute path="/analytics" component={DashboardLayout} />
      <ProtectedRoute path="/settings" component={DashboardLayout} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 bg-neutral-50 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/applications" component={Applications} />
          <Route path="/resumes" component={Resumes} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/jobs" component={JobSearch} />
          <Route path="/jobs/filters" component={JobFilters} />
          <Route path="/jobs/filters/new" component={NewJobFilter} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApplicationProvider>
          <AnimationProvider>
            <SoundProvider>
              <TooltipProvider>
                <Toaster />
                <SoundEffects />
                <AnimatedBackground />
                <Router />
              </TooltipProvider>
            </SoundProvider>
          </AnimationProvider>
        </ApplicationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

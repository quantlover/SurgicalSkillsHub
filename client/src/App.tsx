import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import LearnerDashboard from "@/pages/learner-dashboard";
import EvaluatorDashboard from "@/pages/evaluator-dashboard";
import ResearcherDashboard from "@/pages/researcher-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading } = useDemoAuth();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/learner" component={LearnerDashboard} />
      <Route path="/evaluator" component={EvaluatorDashboard} />
      <Route path="/researcher" component={ResearcherDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

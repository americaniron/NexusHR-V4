import { useEffect, useRef, lazy, Suspense } from "react";
import { ClerkProvider, Show, useClerk } from '@clerk/react';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/lib/queryClient";

import { AppLayout } from "@/components/layout/app-layout";
import LandingPage from "@/pages/landing";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import DashboardPage from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

const MarketplacePage = lazy(() => import("@/pages/marketplace"));
const MarketplaceDetailPage = lazy(() => import("@/pages/marketplace-detail"));
const TeamPage = lazy(() => import("@/pages/team"));
const TasksPage = lazy(() => import("@/pages/tasks"));
const WorkflowsPage = lazy(() => import("@/pages/workflows"));
const ConversationsPage = lazy(() => import("@/pages/conversations"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const BillingPage = lazy(() => import("@/pages/billing"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const HelpPage = lazy(() => import("@/pages/help"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const EmployeeDetailPage = lazy(() => import("@/pages/employee-detail"));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = createQueryClient();

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <OnboardingRedirect />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function OnboardingRedirect() {
  const onboarded = localStorage.getItem("nexushr_onboarded");
  if (!onboarded) {
    return <Redirect to="/onboarding" />;
  }
  return <Redirect to="/dashboard" />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <Suspense fallback={<PageFallback />}>
            <Component />
          </Suspense>
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/onboarding">
              {() => (
                <Show when="signed-in">
                  <Suspense fallback={<PageFallback />}>
                    <OnboardingPage />
                  </Suspense>
                </Show>
              )}
            </Route>

            <Route path="/dashboard">
              <ProtectedRoute component={DashboardPage} />
            </Route>
            <Route path="/marketplace">
              <ProtectedRoute component={MarketplacePage} />
            </Route>
            <Route path="/marketplace/:id">
              <ProtectedRoute component={MarketplaceDetailPage} />
            </Route>
            <Route path="/team">
              <ProtectedRoute component={TeamPage} />
            </Route>
            <Route path="/team/:id">
              <ProtectedRoute component={EmployeeDetailPage} />
            </Route>
            <Route path="/tasks">
              <ProtectedRoute component={TasksPage} />
            </Route>
            <Route path="/workflows">
              <ProtectedRoute component={WorkflowsPage} />
            </Route>
            <Route path="/conversations">
              <ProtectedRoute component={ConversationsPage} />
            </Route>
            <Route path="/analytics">
              <ProtectedRoute component={AnalyticsPage} />
            </Route>
            <Route path="/integrations">
              <ProtectedRoute component={IntegrationsPage} />
            </Route>
            <Route path="/billing">
              <ProtectedRoute component={BillingPage} />
            </Route>
            <Route path="/settings">
              <ProtectedRoute component={SettingsPage} />
            </Route>
            <Route path="/help">
              <ProtectedRoute component={HelpPage} />
            </Route>

            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;

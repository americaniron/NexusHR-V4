import { QueryClient } from "@tanstack/react-query";

export const STALE_TIMES = {
  realtime: 0,
  fast: 10_000,
  standard: 30_000,
  slow: 60_000,
  static: 5 * 60_000,
} as const;

export const ENTITY_STALE_TIMES: Record<string, number> = {
  "/api/tasks": STALE_TIMES.fast,
  "/api/employees": STALE_TIMES.standard,
  "/api/conversations": STALE_TIMES.realtime,
  "/api/notifications": STALE_TIMES.fast,
  "/api/dashboard": STALE_TIMES.standard,
  "/api/roles": STALE_TIMES.static,
  "/api/billing": STALE_TIMES.slow,
  "/api/integrations": STALE_TIMES.slow,
  "/api/workflows": STALE_TIMES.standard,
  "/api/analytics": STALE_TIMES.slow,
  "/api/organizations": STALE_TIMES.slow,
  "/api/users": STALE_TIMES.slow,
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIMES.standard,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status;
            if (status === 401 || status === 403 || status === 404) return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function getStaleTime(apiPath: string): number {
  return ENTITY_STALE_TIMES[apiPath] ?? STALE_TIMES.standard;
}

export function invalidateEntity(queryClient: QueryClient, apiPath: string) {
  queryClient.invalidateQueries({ queryKey: [apiPath] });
}

export function invalidateMultiple(queryClient: QueryClient, apiPaths: string[]) {
  apiPaths.forEach((path) => invalidateEntity(queryClient, path));
}

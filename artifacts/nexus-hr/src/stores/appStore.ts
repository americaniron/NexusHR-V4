import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
}

interface Preferences {
  compactMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoRefreshInterval: number;
}

interface AppState {
  theme: "dark" | "light" | "system";
  sidebar: SidebarState;
  preferences: Preferences;
  lastVisitedPath: string;

  setTheme: (theme: "dark" | "light" | "system") => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  setLastVisitedPath: (path: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebar: { collapsed: false, mobileOpen: false },
      preferences: {
        compactMode: false,
        notificationsEnabled: true,
        soundEnabled: true,
        autoRefreshInterval: 30000,
      },
      lastVisitedPath: "/dashboard",

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({
          sidebar: { ...state.sidebar, collapsed: !state.sidebar.collapsed },
        })),

      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          sidebar: { ...state.sidebar, collapsed },
        })),

      setMobileSidebarOpen: (open) =>
        set((state) => ({
          sidebar: { ...state.sidebar, mobileOpen: open },
        })),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setLastVisitedPath: (path) => set({ lastVisitedPath: path }),
    }),
    {
      name: "nexushr-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebar: { collapsed: state.sidebar.collapsed, mobileOpen: false },
        preferences: state.preferences,
        lastVisitedPath: state.lastVisitedPath,
      }),
    },
  ),
);

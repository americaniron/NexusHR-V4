import { create } from "zustand";

interface OrgContext {
  id: number | null;
  name: string | null;
  clerkOrgId: string | null;
}

interface AuthState {
  userId: string | null;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
  org: OrgContext;
  isInitialized: boolean;

  setUser: (user: { userId: string; email: string; fullName: string; imageUrl: string | null }) => void;
  setOrg: (org: OrgContext) => void;
  clearAuth: () => void;
  setInitialized: (initialized: boolean) => void;
}

const initialOrg: OrgContext = { id: null, name: null, clerkOrgId: null };

export const useAuthStore = create<AuthState>()((set) => ({
  userId: null,
  email: null,
  fullName: null,
  imageUrl: null,
  org: initialOrg,
  isInitialized: false,

  setUser: (user) =>
    set({
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
    }),

  setOrg: (org) => set({ org }),

  clearAuth: () =>
    set({
      userId: null,
      email: null,
      fullName: null,
      imageUrl: null,
      org: initialOrg,
      isInitialized: false,
    }),

  setInitialized: (initialized) => set({ isInitialized: initialized }),
}));

import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { Profile } from '../types/database.types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
}

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NotificationState {
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }[];
  addNotification: (notification: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  removeNotification: (id: string) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,
  setUser: (user: User | null) => set({ user }),
  setProfile: (profile: Profile | null) => set({ profile }),
}));

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Math.random().toString(), ...notification },
      ],
    })),
  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
})); 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SyncState = 'idle' | 'pushing' | 'pulling' | 'offline' | 'error';

interface AppState {
  activeVehicleId: string | null;
  setActiveVehicleId: (id: string | null) => void;

  dbReady: boolean;
  setDbReady: (ready: boolean) => void;

  singleTabBlocked: boolean;
  setSingleTabBlocked: (blocked: boolean) => void;

  syncStatus: SyncState;
  setSyncStatus: (status: SyncState) => void;

  conflictCount: number;
  setConflictCount: (count: number) => void;

  updateAvailable: boolean;
  setUpdateAvailable: (available: boolean) => void;

  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeVehicleId: 'c9aa4040-a7ca-41a0-9b1f-d8cdb7221d13', // seed vehicle id default
      setActiveVehicleId: (activeVehicleId) => set({ activeVehicleId }),

      dbReady: false,
      setDbReady: (dbReady) => set({ dbReady }),

      singleTabBlocked: false,
      setSingleTabBlocked: (singleTabBlocked) => set({ singleTabBlocked }),

      syncStatus: 'idle',
      setSyncStatus: (syncStatus) => set({ syncStatus }),

      conflictCount: 0,
      setConflictCount: (conflictCount) => set({ conflictCount }),

      updateAvailable: false,
      setUpdateAvailable: (updateAvailable) => set({ updateAvailable }),

      isPremium: false,
      setIsPremium: (isPremium) => set({ isPremium }),
    }),
    {
      name: 'careta-app-store',
      partialize: (state) => ({ activeVehicleId: state.activeVehicleId }),
    },
  ),
);

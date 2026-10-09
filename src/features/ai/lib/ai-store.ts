import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdapterId =
  | 'openrouter_gemini'
  | 'openrouter_deepseek'
  | 'gemini_direct'
  | 'deepseek_direct';

interface AiSettingsState {
  adapterOrder: AdapterId[];
  customApiKey: string;
  setAdapterOrder: (order: AdapterId[]) => void;
  setCustomApiKey: (key: string) => void;
  resetDefaults: () => void;
}

const DEFAULT_ORDER: AdapterId[] = [
  'openrouter_gemini',
  'gemini_direct',
  'openrouter_deepseek',
  'deepseek_direct',
];

export const useAiSettingsStore = create<AiSettingsState>()(
  persist(
    (set) => ({
      adapterOrder: DEFAULT_ORDER,
      customApiKey: '',
      setAdapterOrder: (adapterOrder) => set({ adapterOrder }),
      setCustomApiKey: (customApiKey) => set({ customApiKey }),
      resetDefaults: () => set({ adapterOrder: DEFAULT_ORDER, customApiKey: '' }),
    }),
    {
      name: 'careta-ai-settings-v1',
    },
  ),
);

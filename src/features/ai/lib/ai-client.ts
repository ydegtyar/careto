import { useAiSettingsStore } from './ai-store';

export type TaskPurpose = 'expense' | 'vin' | 'wheels' | 'note';

export interface NoteParseResult {
  notes?: string;
  date?: string;
  odometerKm?: number;
  merchant?: string;
  vendorName?: string;
  lat?: number;
  lon?: number;
  rawText?: string;
}

export interface SubItemParseResult {
  name: string;
  cost?: number;
  partNumber?: string;
  quantity?: number;
}

export interface ExpenseParseResult {
  amount?: number;
  date?: string;
  merchant?: string;
  vendorName?: string;
  lat?: number;
  lon?: number;
  category?: 'fuel' | 'service' | 'insurance' | 'parking' | 'wash' | 'fine' | 'other';
  fuelVolume?: number;
  fuelUnit?: 'liters' | 'gallons';
  pricePerUnit?: number;
  currency?: string;
  notes?: string;
  subItems?: SubItemParseResult[];
  rawText?: string;
}

export interface VinParseResult {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  confidence?: number;
  plate?: string;
  rawText?: string;
}

export interface WheelsParseResult {
  tireSize?: string;
  width?: number;
  profile?: number;
  rimDiameter?: number;
  speedRating?: string;
  loadIndex?: number;
  brand?: string;
  model?: string;
  season?: 'summer' | 'winter' | 'all_season';
  conditionNotes?: string;
  rawText?: string;
}

export type ParsePurposeResultMap = {
  expense: ExpenseParseResult;
  vin: VinParseResult;
  wheels: WheelsParseResult;
  note: NoteParseResult;
};

export interface ParseResponse<T extends TaskPurpose> {
  success: boolean;
  purpose: T;
  data?: ParsePurposeResultMap[T];
  providerUsed?: string;
  latencyMs?: number;
  error?: string;
}

export async function convertFileToBase64(
  file: File | Blob,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mimeType = file.type || 'image/jpeg';
      resolve({ base64: dataUrl, mimeType });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function parseImageWithAi<T extends TaskPurpose>(
  purpose: T,
  fileOrBlob: File | Blob,
): Promise<ParseResponse<T>> {
  const { adapterOrder, customApiKey } = useAiSettingsStore.getState();
  const { base64, mimeType } = await convertFileToBase64(fileOrBlob);

  const res = await fetch('/api/ai/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose,
      imageBase64: base64,
      mimeType,
      options: {
        adapterOrder,
        customApiKey: customApiKey || undefined,
      },
    }),
  });

  const json = (await res.json()) as ParseResponse<T>;
  return json;
}

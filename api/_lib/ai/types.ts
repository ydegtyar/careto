export type AdapterId = 'openrouter_gemini' | 'openrouter_deepseek' | 'gemini_direct' | 'deepseek_direct';

export type TaskPurpose = 'expense' | 'vin' | 'wheels';

export interface SubItemParseResult {
  name: string;
  cost?: number;
  partNumber?: string;
  quantity?: number;
}

export interface ExpenseParseResult {
  amount?: number;
  date?: string; // YYYY-MM-DD
  merchant?: string;
  vendorName?: string;
  lat?: number;
  lon?: number;
  category?: 'fuel' | 'service' | 'insurance' | 'parking' | 'wash' | 'fine' | 'other';
  fuelVolume?: number; // in Liters
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
  tireSize?: string; // e.g. "225/45 R17 91V"
  width?: number; // e.g. 225
  profile?: number; // e.g. 45
  rimDiameter?: number; // e.g. 17
  speedRating?: string; // e.g. "V"
  loadIndex?: number; // e.g. 91
  brand?: string; // e.g. "Michelin"
  model?: string; // e.g. "Pilot Sport 5"
  season?: 'summer' | 'winter' | 'all_season';
  conditionNotes?: string;
  rawText?: string;
}

export type ParsePurposeResultMap = {
  expense: ExpenseParseResult;
  vin: VinParseResult;
  wheels: WheelsParseResult;
};

export interface WaterfallOptions {
  adapterOrder?: AdapterId[];
  customApiKey?: string;
}

export interface ParseRequest<T extends TaskPurpose = TaskPurpose> {
  purpose: T;
  imageBase64: string; // base64 or data URL
  mimeType?: string;
  options?: WaterfallOptions;
}

export interface ParseResponse<T extends TaskPurpose = TaskPurpose> {
  success: boolean;
  purpose: T;
  data?: ParsePurposeResultMap[T];
  providerUsed?: AdapterId;
  latencyMs?: number;
  error?: string;
}

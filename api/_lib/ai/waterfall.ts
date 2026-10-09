import { ALL_ADAPTERS } from './adapters/index.js';
import { SYSTEM_PROMPTS } from './prompts.js';
import type { AdapterId, ParsePurposeResultMap, ParseRequest, ParseResponse, TaskPurpose } from './types.js';

function cleanAndParseJson<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  
  // Find first '{' and last '}'
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned) as T;
}

export async function runWaterfallParse<T extends TaskPurpose>(
  req: ParseRequest<T>
): Promise<ParseResponse<T>> {
  const startTime = Date.now();
  const { purpose, imageBase64, mimeType = 'image/jpeg', options = {} } = req;

  const prompt = SYSTEM_PROMPTS[purpose];
  if (!prompt) {
    return {
      success: false,
      purpose,
      error: `Unknown purpose: ${purpose}`,
    };
  }

  // Waterfall priority order: user requested -> fallback default sequence
  const requestedOrder = options.adapterOrder || [];
  const defaultFallbackOrder: AdapterId[] = [
    'openrouter_gemini',
    'gemini_direct',
    'openrouter_deepseek',
    'deepseek_direct',
  ];

  // Merge unique requested adapters then remaining defaults
  const adapterOrder = Array.from(new Set([...requestedOrder, ...defaultFallbackOrder]));

  let lastError: Error | null = null;

  for (const adapterId of adapterOrder) {
    const adapter = ALL_ADAPTERS[adapterId];
    if (!adapter) continue;

    if (!adapter.isAvailable(options.customApiKey)) {
      console.warn(`[AI Waterfall] Adapter ${adapterId} skipped: API key unavailable`);
      continue;
    }

    try {
      console.log(`[AI Waterfall] Attempting purpose '${purpose}' with adapter '${adapterId}'...`);
      const rawOutput = await adapter.parseImage(
        imageBase64,
        mimeType,
        prompt,
        options.customApiKey
      );

      const parsedData = cleanAndParseJson<ParsePurposeResultMap[T]>(rawOutput);
      const latencyMs = Date.now() - startTime;

      console.log(`[AI Waterfall] Success using adapter '${adapterId}' in ${latencyMs}ms`);

      return {
        success: true,
        purpose,
        data: parsedData,
        providerUsed: adapterId,
        latencyMs,
      };
    } catch (err: any) {
      console.warn(`[AI Waterfall] Adapter '${adapterId}' failed for purpose '${purpose}':`, err.message);
      lastError = err;
    }
  }

  return {
    success: false,
    purpose,
    error: `All waterfall LLM adapters failed. Last error: ${lastError?.message || 'No available adapter'}`,
    latencyMs: Date.now() - startTime,
  };
}

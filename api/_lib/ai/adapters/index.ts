import type { AdapterId } from '../types.js';

export interface LlmAdapter {
  id: AdapterId;
  name: string;
  isAvailable(customApiKey?: string): boolean;
  parseImage(
    base64Data: string,
    mimeType: string,
    prompt: string,
    customApiKey?: string
  ): Promise<string>;
}

/**
 * OpenRouter Gemini Adapter (uses OPENROUTER_API_KEY)
 */
export class OpenRouterGeminiAdapter implements LlmAdapter {
  id: AdapterId = 'openrouter_gemini';
  name = 'OpenRouter (Gemini 2.0 Flash)';

  isAvailable(customApiKey?: string): boolean {
    return !!(customApiKey || process.env.OPENROUTER_API_KEY);
  }

  async parseImage(
    base64Data: string,
    mimeType: string,
    prompt: string,
    customApiKey?: string
  ): Promise<string> {
    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key missing');

    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const formattedDataUrl = `data:${mimeType || 'image/jpeg'};base64,${cleanBase64}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careto.app',
        'X-Title': 'Careto Automotive App',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: formattedDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter Gemini returned empty response');
    return content;
  }
}

/**
 * OpenRouter DeepSeek / Vision Adapter (uses OPENROUTER_API_KEY)
 */
export class OpenRouterDeepSeekAdapter implements LlmAdapter {
  id: AdapterId = 'openrouter_deepseek';
  name = 'OpenRouter (DeepSeek / Qwen Vision)';

  isAvailable(customApiKey?: string): boolean {
    return !!(customApiKey || process.env.OPENROUTER_API_KEY);
  }

  async parseImage(
    base64Data: string,
    mimeType: string,
    prompt: string,
    customApiKey?: string
  ): Promise<string> {
    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key missing');

    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const formattedDataUrl = `data:${mimeType || 'image/jpeg'};base64,${cleanBase64}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careto.app',
        'X-Title': 'Careto Automotive App',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-vl-72b-instruct:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: formattedDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter DeepSeek API HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter DeepSeek returned empty response');
    return content;
  }
}

/**
 * Direct Gemini API Adapter (uses GEMINI_API_KEY)
 */
export class GeminiDirectAdapter implements LlmAdapter {
  id: AdapterId = 'gemini_direct';
  name = 'Direct Gemini API (Google)';

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async parseImage(
    base64Data: string,
    mimeType: string,
    prompt: string
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key missing');

    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Direct Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Direct Gemini API returned empty response');
    return content;
  }
}

/**
 * Direct DeepSeek Adapter (uses DEEPSEEK_API_KEY)
 */
export class DeepSeekDirectAdapter implements LlmAdapter {
  id: AdapterId = 'deepseek_direct';
  name = 'Direct DeepSeek API';

  isAvailable(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  async parseImage(
    base64Data: string,
    mimeType: string,
    prompt: string
  ): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('DeepSeek API key missing');

    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const formattedDataUrl = `data:${mimeType || 'image/jpeg'};base64,${cleanBase64}`;

    // DeepSeek API supports OpenAI-compatible chat endpoints
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: formattedDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Direct DeepSeek API HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Direct DeepSeek API returned empty response');
    return content;
  }
}

export const ALL_ADAPTERS: Record<AdapterId, LlmAdapter> = {
  openrouter_gemini: new OpenRouterGeminiAdapter(),
  openrouter_deepseek: new OpenRouterDeepSeekAdapter(),
  gemini_direct: new GeminiDirectAdapter(),
  deepseek_direct: new DeepSeekDirectAdapter(),
};

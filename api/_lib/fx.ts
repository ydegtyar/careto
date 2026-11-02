import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db.js';

export const USD_FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.925,
  GBP: 0.787,
  CAD: 1.36,
  UAH: 41.5,
  ALL: 91.2,
};

export async function getUsdFxRate(currency: string, date?: string): Promise<number> {
  const code = (currency || 'USD').toUpperCase();
  if (code === 'USD') return 1.0;

  const targetDate = date || new Date().toISOString().slice(0, 10);

  try {
    const rows = await sql`
      SELECT date, rates 
      FROM fx_rates 
      WHERE date <= ${targetDate} 
      ORDER BY date DESC 
      LIMIT 1
    `;

    if (rows.length > 0 && rows[0]?.rates) {
      const rates = rows[0].rates as Record<string, number>;
      if (typeof rates[code] === 'number' && rates[code] > 0) {
        return rates[code];
      }
    }

    const latestRows = await sql`
      SELECT date, rates 
      FROM fx_rates 
      ORDER BY date DESC 
      LIMIT 1
    `;

    if (latestRows.length > 0 && latestRows[0]?.rates) {
      const rates = latestRows[0].rates as Record<string, number>;
      if (typeof rates[code] === 'number' && rates[code] > 0) {
        return rates[code];
      }
    }

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (response.ok) {
        const data = (await response.json()) as any;
        if (data.result === 'success' && data.rates) {
          await sql`
            INSERT INTO fx_rates (date, base, rates, source, fetched_at)
            VALUES (${todayStr}, 'USD', ${JSON.stringify(data.rates)}::jsonb, 'open.er-api.com', now())
          `;
          if (typeof data.rates[code] === 'number' && data.rates[code] > 0) {
            return data.rates[code];
          }
        }
      }
    } catch (fetchErr) {
      console.warn('Failed to fetch open.er-api.com:', fetchErr);
    }
  } catch (err) {
    console.warn('Database error in getUsdFxRate:', err);
  }

  return USD_FALLBACK_RATES[code] ?? 1.0;
}

export async function convertToUsdMinorAsync(
  amountMinor: number | undefined | null,
  currency: string | undefined | null,
  date?: string,
): Promise<number | undefined> {
  if (amountMinor === undefined || amountMinor === null) return undefined;
  if (amountMinor === 0) return 0;

  const code = (currency || 'USD').toUpperCase();
  if (code === 'USD') return Math.round(amountMinor);

  try {
    const rate = await getUsdFxRate(code, date);
    if (rate > 0) {
      return Math.round(amountMinor / rate);
    }
  } catch (err) {
    console.warn('Error during convertToUsdMinorAsync:', err);
  }

  const fallback = USD_FALLBACK_RATES[code] ?? 1.0;
  return Math.round(amountMinor / fallback);
}

export async function handleFxLatest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const todayStr = new Date().toISOString().slice(0, 10);

  try {
    const existing = await sql`
      SELECT date, base, rates, source, fetched_at 
      FROM fx_rates 
      WHERE date = ${todayStr} 
      LIMIT 1
    `;

    if (existing.length > 0) {
      return res.status(200).json({
        date: existing[0]!.date,
        base: existing[0]!.base,
        rates: existing[0]!.rates,
        source: existing[0]!.source,
        stale: false,
      });
    }

    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (response.ok) {
        const data = await response.json() as any;
        if (data.result === 'success' && data.rates) {
          await sql`
            INSERT INTO fx_rates (date, base, rates, source, fetched_at)
            VALUES (${todayStr}, 'USD', ${JSON.stringify(data.rates)}::jsonb, 'open.er-api.com', now())
            ON CONFLICT DO NOTHING
          `;

          return res.status(200).json({
            date: todayStr,
            base: 'USD',
            rates: data.rates,
            source: 'open.er-api.com',
            stale: false,
          });
        }
      }
    } catch (fetchErr) {
      console.warn('Failed to fetch from open.er-api.com:', fetchErr);
    }

    const latestKnown = await sql`
      SELECT date, base, rates, source, fetched_at 
      FROM fx_rates 
      ORDER BY date DESC 
      LIMIT 1
    `;

    if (latestKnown.length > 0) {
      return res.status(200).json({
        date: latestKnown[0]!.date,
        base: latestKnown[0]!.base,
        rates: latestKnown[0]!.rates,
        source: latestKnown[0]!.source,
        stale: true,
      });
    }

    return res.status(200).json({
      date: todayStr,
      base: 'USD',
      rates: { EUR: 0.925, GBP: 0.787, CAD: 1.36, UAH: 41.5, ALL: 91.2, USD: 1.0 },
      source: 'hardcoded-fallback',
      stale: true,
    });
  } catch (err: any) {
    console.error('FX rates error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleFxOn(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const currency = ((req.query.currency as string) || 'USD').toUpperCase();

  try {
    const rate = await getUsdFxRate(currency, date);
    return res.status(200).json({ date, currency, rate, source: 'fx_rates' });
  } catch (err: any) {
    console.error('FX on-date error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleFxBatch(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const queries = (req.body?.queries || []) as Array<{ date: string; currency: string }>;
  if (!Array.isArray(queries) || queries.length === 0) {
    return res.status(400).json({ error: 'queries array required' });
  }

  try {
    const results = await Promise.all(
      queries.map(async (q) => {
        const rate = await getUsdFxRate(q.currency, q.date);
        return {
          date: q.date,
          currency: q.currency,
          rate,
        };
      })
    );

    return res.status(200).json({ results });
  } catch (err: any) {
    console.error('FX batch error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

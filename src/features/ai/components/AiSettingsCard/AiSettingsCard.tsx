import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { type AdapterId, useAiSettingsStore } from '../../lib/ai-store';

const ADAPTER_LABELS: Record<AdapterId, { title: string; desc: string }> = {
  openrouter_gemini: {
    title: 'OpenRouter — Gemini 2.0 Flash',
    desc: 'Fast, high-accuracy vision parsing via OpenRouter',
  },
  openrouter_deepseek: {
    title: 'OpenRouter — DeepSeek / Qwen Vision',
    desc: 'Alternative vision adapter via OpenRouter fallback',
  },
  gemini_direct: {
    title: 'Google Direct — Gemini 2.0 Flash',
    desc: 'Direct Google Gemini API using GEMINI_API_KEY',
  },
  deepseek_direct: {
    title: 'DeepSeek Direct API',
    desc: 'Direct DeepSeek API using DEEPSEEK_API_KEY',
  },
};

export function AiSettingsCard() {
  const { adapterOrder, customApiKey, setAdapterOrder, setCustomApiKey, resetDefaults } =
    useAiSettingsStore();

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const moveAdapter = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...adapterOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index]!;
    newOrder[index] = newOrder[targetIndex]!;
    newOrder[targetIndex] = temp;
    setAdapterOrder(newOrder);
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/adapters');
      const json = await res.json();
      if (json.success) {
        const avail = json.adapters
          .filter((a: any) => a.available)
          .map((a: any) => a.name)
          .join(', ');
        setTestResult(`Waterfall active! Available backend providers: ${avail || 'None'}`);
      } else {
        setTestResult(`Test error: ${json.error}`);
      }
    } catch (e: any) {
      setTestResult(`Failed to query AI API: ${e.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <GlassCard style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AutoAwesomeIcon sx={{ color: '#38bdf8' }} />
        <div>
          <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600 }}>
            AI Vision & LLM Waterfall Settings
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Customize LLM adapter priority for expense receipts, VIN code & wheel recognition
          </Typography>
        </div>
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <div>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Waterfall Adapter Execution Priority Order
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          If the primary adapter fails or is rate-limited, Careta automatically falls back down the
          list.
        </Typography>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {adapterOrder.map((id, idx) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(125, 211, 252, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Chip
                  label={`#${idx + 1}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    backgroundColor:
                      idx === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: idx === 0 ? '#38bdf8' : 'text.primary',
                  }}
                />
                <div>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {ADAPTER_LABELS[id]?.title || id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {ADAPTER_LABELS[id]?.desc}
                  </Typography>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                <Button
                  size="small"
                  disabled={idx === 0}
                  onClick={() => moveAdapter(idx, 'up')}
                  sx={{ minWidth: 32, px: 0, textTransform: 'none' }}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  disabled={idx === adapterOrder.length - 1}
                  onClick={() => moveAdapter(idx, 'down')}
                  sx={{ minWidth: 32, px: 0, textTransform: 'none' }}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TextField
        label="Custom OpenRouter API Key (Optional Override)"
        variant="outlined"
        size="small"
        type="password"
        value={customApiKey}
        onChange={(e) => setCustomApiKey(e.target.value)}
        helperText="Leave empty to use server environment key (OPENROUTER_API_KEY)"
        fullWidth
        sx={{ mt: 1 }}
      />

      {testResult && (
        <Alert severity="info" onClose={() => setTestResult(null)} sx={{ borderRadius: 2 }}>
          {testResult}
        </Alert>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={resetDefaults}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          Reset Defaults
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={testLoading}
          startIcon={testLoading ? <CircularProgress size={16} /> : <SwapVertIcon />}
          onClick={handleTestConnection}
          sx={{
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {testLoading ? 'Checking Waterfall...' : 'Test Waterfall Connections'}
        </Button>
      </div>
    </GlassCard>
  );
}

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useRef, useState } from 'react';
import { type ExpenseParseResult, parseImageWithAi } from '../../lib/ai-client';

interface ExpenseScannerProps {
  onParsed: (data: ExpenseParseResult) => void;
}

export function ExpenseScanner({ onParsed }: ExpenseScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    provider: string;
    amount?: number;
    merchant?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await parseImageWithAi('expense', file);
      if (res.success && res.data) {
        setLastResult({
          provider: res.providerUsed || 'AI Model',
          amount: res.data.amount,
          merchant: res.data.merchant,
        });
        onParsed(res.data);
      } else {
        setError(res.error || 'Failed to parse receipt image');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading receipt image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
          color: '#ffffff',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 2,
          py: 1,
          boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)',
        }}
      >
        {loading ? 'AI Parsing Receipt...' : 'AI Auto-Fill Form from Receipt'}
      </Button>

      {lastResult && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircleIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Form filled {lastResult.merchant ? `(${lastResult.merchant})` : ''}
            </Typography>
          </div>
          <Chip
            label={lastResult.provider}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem', backgroundColor: 'rgba(56, 189, 248, 0.2)' }}
          />
        </div>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ py: 0.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </div>
  );
}

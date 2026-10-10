import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useRef, useState } from 'react';
import { parseImageWithAi, type VinParseResult } from '../../lib/ai-client';

interface Props {
  onParsed: (data: VinParseResult) => void;
  variant?: 'button' | 'icon-button';
}

export function VinScanner({ onParsed, variant = 'button' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    provider: string;
    vin?: string;
    make?: string;
    model?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await parseImageWithAi('vin', file);
      if (res.success && res.data) {
        setLastResult({
          provider: res.providerUsed || 'AI Model',
          vin: res.data.vin,
          make: res.data.make,
          model: res.data.model,
        });
        onParsed(res.data);
      } else {
        setError(res.error || 'Failed to parse VIN from image');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error uploading VIN image');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon-button') {
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Tooltip title="Scan VIN from Photo">
          <span>
            <IconButton
              size="small"
              aria-label="Scan VIN from Photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{ color: 'primary.main' }}
            >
              {loading ? <CircularProgress size={18} /> : <CameraAltIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </span>
        </Tooltip>
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={18} /> : <AutoAwesomeIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        sx={{
          borderColor: 'rgba(56, 189, 248, 0.4)',
          color: 'primary.main',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 2,
          py: 1,
        }}
      >
        {loading ? 'Scanning VIN with AI...' : 'Scan VIN Code / Registration Photo'}
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
              {lastResult.vin ? `VIN: ${lastResult.vin}` : 'Vehicle data extracted'}
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

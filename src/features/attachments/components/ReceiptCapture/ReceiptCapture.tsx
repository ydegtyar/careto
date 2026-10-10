import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useRef, useState } from 'react';
import { type CompressedImage, compressAndPrepareImage } from '../../lib/image-compressor';

interface Props {
  onImageReady: (img: CompressedImage | null) => void;
}

export function ReceiptCapture({ onImageReady }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [stats, setStats] = useState<{ origKb: number; compKb: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const origKb = Math.round(file.size / 1024);
      const result = await compressAndPrepareImage(file);
      const compKb = Math.round(result.byteSize / 1024);

      setPreview(URL.createObjectURL(result.blob));
      setStats({ origKb, compKb });
      onImageReady(result);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setStats(null);
    onImageReady(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!preview ? (
        <Button
          variant="outlined"
          startIcon={compressing ? <CircularProgress size={18} /> : <CameraAltIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={compressing}
          sx={{
            borderColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)',
            color: 'primary.main',
            textTransform: 'none',
            borderRadius: 2,
            py: 1,
            backgroundColor: 'var(--mui-palette-surfaceContainer)',
          }}
        >
          {compressing ? 'Compressing receipt...' : 'Attach Receipt / Photo'}
        </Button>
      ) : (
        <div
          style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--mui-palette-divider)',
            backgroundColor: 'var(--mui-palette-surfaceContainer)',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={preview}
            alt="Receipt preview"
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Receipt Prepared
              </Typography>
            </div>
            {stats && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Optimized: {stats.origKb} KB → {stats.compKb} KB (WebP)
              </Typography>
            )}
          </div>

          <IconButton size="small" onClick={handleClear} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      )}
    </div>
  );
}

import SyncIcon from '@mui/icons-material/Sync';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { data } from '@/data/client';
import type { ConflictRecord, SyncStatus } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export function SyncStatusCard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SyncStatus>({
    state: 'idle',
    pendingOpsCount: 0,
    currentSeq: 0,
  });
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const s = await data.getSyncStatus();
      setStatus(s);
      const c = await data.getConflicts();
      setConflicts(c);
    } catch {
      // Worker loading
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) await refreshStatus();
    };
    run();
    const interval = setInterval(run, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshStatus]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await data.syncNow();
      await refreshStatus();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SyncIcon
            sx={{
              color: status.state === 'error' ? 'error.main' : 'primary.main',
              fontSize: 24,
              animation: isSyncing ? 'spin 1s linear infinite' : undefined,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <div>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Cloud Sync: {status.state === 'syncing' || isSyncing ? 'Syncing...' : 'Active'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Sequence: #{status.currentSeq} • {status.pendingOpsCount} pending local ops
            </Typography>
          </div>
        </div>

        <Button
          size="small"
          variant="outlined"
          onClick={handleSyncNow}
          disabled={isSyncing}
          sx={{
            borderColor: 'rgba(125, 211, 252, 0.3)',
            color: 'primary.main',
            fontSize: '0.75rem',
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 80,
          }}
        >
          {isSyncing ? <CircularProgress size={16} sx={{ color: 'primary.main' }} /> : 'Sync Now'}
        </Button>
      </div>

      {conflicts.length > 0 && (
        <button
          type="button"
          onClick={() => navigate({ to: '/settings/conflicts' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 107, 107, 0.15)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            cursor: 'pointer',
            width: '100%',
            font: 'inherit',
            color: 'inherit',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningAmberIcon sx={{ color: 'error.main', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
              {conflicts.length} sync conflict{conflicts.length > 1 ? 's' : ''} require resolution
            </Typography>
          </div>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
            Resolve →
          </Typography>
        </button>
      )}
    </GlassCard>
  );
}

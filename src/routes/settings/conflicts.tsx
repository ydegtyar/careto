import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DifferenceIcon from '@mui/icons-material/Difference';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { data } from '@/data/client';
import type { ConflictRecord } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/settings/conflicts')({
  component: ConflictsPage,
});

function ConflictsPage() {
  const navigate = useNavigate();
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictRecord | null>(null);

  React.useEffect(() => {
    data.getConflicts().then((c) => {
      setConflicts(c);
      if (c.length > 0 && c[0]) setSelectedConflict(c[0]);
    });
  }, []);

  const handleResolve = async (conflictId: string, resolution: 'local' | 'remote') => {
    await data.resolveConflict(conflictId, resolution);
    const updated = conflicts.filter((c) => c.id !== conflictId);
    setConflicts(updated);
    setSelectedConflict(updated[0] || null);
  };

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton
          onClick={() => navigate({ to: '/settings' })}
          sx={{ color: 'text.primary', border: '1px solid rgba(125, 211, 252, 0.15)' }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <div>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            Conflict Center
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Resolve offline concurrent modifications
          </Typography>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <GlassCard
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 48 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            No Conflicts Detected
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 280 }}>
            All your local replicas and cloud records are in sync.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate({ to: '/settings' })}
            sx={{
              mt: 1,
              borderColor: 'rgba(125, 211, 252, 0.3)',
              color: 'primary.main',
              borderRadius: 2,
            }}
          >
            Back to Settings
          </Button>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedConflict && (
            <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DifferenceIcon sx={{ color: '#c8a0f0' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Conflict in {selectedConflict.tbl} ({selectedConflict.rowId.slice(0, 8)})
                </Typography>
              </div>

              {/* Side by side diff preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div
                  style={{
                    backgroundColor: 'rgba(15, 21, 36, 0.6)',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid rgba(125, 211, 252, 0.2)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    LOCAL DEVICE
                  </Typography>
                  <pre
                    style={{
                      fontSize: '0.75rem',
                      color: '#e0e8f0',
                      marginTop: 6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {JSON.stringify(selectedConflict.localData, null, 2)}
                  </pre>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(15, 21, 36, 0.6)',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid rgba(200, 160, 240, 0.2)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#c8a0f0', fontWeight: 700 }}>
                    SERVER CLOUD
                  </Typography>
                  <pre
                    style={{
                      fontSize: '0.75rem',
                      color: '#e0e8f0',
                      marginTop: 6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {JSON.stringify(selectedConflict.remoteData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleResolve(selectedConflict.id, 'local')}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  Keep Local
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleResolve(selectedConflict.id, 'remote')}
                  sx={{
                    backgroundColor: '#c8a0f0',
                    color: '#0a0e1a',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#b48ce0' },
                  }}
                >
                  Accept Server
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}

import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './VehicleInviteSection.styles';

export interface Props {
  vehicleId: string;
  onUnauthorized?: () => void;
}

export const VehicleInviteSection: React.FC<Props> = ({ vehicleId, onUnauthorized }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteUrl(null);

    try {
      const res = await fetch('/api/vehicles/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ vehicleId, email, role }),
      });

      if (res.status === 401) {
        onUnauthorized?.();
        throw new Error('Unauthorized. Please sign in again.');
      }

      const data = (await res.json()) as { error?: string; inviteUrl?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invite');
      }

      setInviteUrl(data.inviteUrl || null);
      setEmail('');
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GlassCard style={styles.card}>
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <ShareOutlinedIcon sx={styles.headerIcon} />
        </div>
        <Typography variant="subtitle2" sx={styles.headerTitle}>
          Invite New Member
        </Typography>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleCreateInvite} style={styles.form}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="driver@gmail.com"
          required
          fullWidth
          size="small"
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
          >
            <MenuItem value="editor">Editor — Can log refuels, services, notes</MenuItem>
            <MenuItem value="viewer">Viewer — Read-only telemetry and stats</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          startIcon={
            loading ? (
              <CircularProgress size={18} sx={styles.submitSpinner} />
            ) : (
              <LinkIcon sx={{ fontSize: 18 }} />
            )
          }
          sx={styles.submitButton}
        >
          {loading ? 'Generating...' : 'Generate Invite Link'}
        </Button>
      </form>

      {inviteUrl && (
        <div style={styles.inviteLinkContainer}>
          <Typography variant="caption" sx={styles.inviteLinkTitle}>
            Invite Link Generated (Valid for 7 Days):
          </Typography>
          <div style={styles.inviteInputRow}>
            <input readOnly value={inviteUrl} style={styles.inviteInput} />
            <IconButton size="small" onClick={handleCopy} sx={styles.copyButton}>
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default VehicleInviteSection;

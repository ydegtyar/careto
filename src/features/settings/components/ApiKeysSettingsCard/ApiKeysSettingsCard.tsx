import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyIcon from '@mui/icons-material/Key';
import TerminalIcon from '@mui/icons-material/Terminal';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { type ApiKeyItem, ApiKeyRow } from './ApiKeyRow';

export const ApiKeysSettingsCard = () => {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = useSession();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnauthorized = useCallback(() => {
    setKeys([]);
    queryClient.removeQueries({ queryKey: ['api_keys'] });
  }, [queryClient]);

  const fetchKeys = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/keys/list', { credentials: 'include' });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (session?.user) {
      fetch('/api/keys/list', { credentials: 'include' })
        .then((res) => {
          if (res.status === 401) {
            handleUnauthorized();
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then((data) => {
          if (!ignore && data?.keys) {
            setKeys(data.keys);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch API keys:', err);
        });
    }

    return () => {
      ignore = true;
    };
  }, [session?.user, handleUnauthorized]);

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: keyName.trim() }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        setCreateError('Unauthorized. Please sign in again.');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setKeyName('');
        fetchKeys();
      } else {
        const errData = await res.json().catch(() => ({}));
        setCreateError(errData.error || 'Failed to create key. Please check authentication.');
      }
    } catch (err) {
      console.error('Failed to create key:', err);
      setCreateError('Network error while creating key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mcpConfigSnippet = (token: string) =>
    JSON.stringify(
      {
        mcpServers: {
          careto: {
            url: `${window.location.origin}/api/mcp/sse`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      },
      null,
      2,
    );

  return (
    <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <div>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Integrations & MCP API Keys
            </Typography>

            {/* RULE: Use plain div instead of Box without props */}
            <div>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Connect AI assistants (Claude, ChatGPT, Cursor, Gemini) to your Careto vehicles via
                MCP.
              </Typography>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <RouterLink to="/mcp" style={{ textDecoration: 'none' }}>
            <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
              MCP Docs
            </Button>
          </RouterLink>
          <Button
            size="small"
            variant="contained"
            disabled={!session?.user}
            onClick={() => {
              setCreateError(null);
              setCreateOpen(true);
            }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Create API Key
          </Button>
        </div>
      </div>

      {!sessionLoading && !session?.user ? (
        <Alert
          severity="warning"
          sx={{ borderRadius: 2 }}
          action={
            <RouterLink to="/sign-in" style={{ textDecoration: 'none' }}>
              <Button color="inherit" size="small">
                Sign In
              </Button>
            </RouterLink>
          }
        >
          Sign in to generate and manage API keys for MCP client integrations.
        </Alert>
      ) : keys.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No active API keys found. Create a key to connect third-party apps or MCP servers.
        </Alert>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {keys.map((k) => (
            <ApiKeyRow key={k.id} apiKey={k} onRevoke={handleRevoke} />
          ))}
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate MCP API Key</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          {!newKey ? (
            <>
              {createError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {createError}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary">
                Enter a name to identify where this key will be used (e.g. "Claude Desktop", "Cursor
                AI").
              </Typography>
              <TextField
                label="Key Name"
                fullWidth
                size="small"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </>
          ) : (
            <>
              <Alert severity="warning">Save your API key! It will not be shown again.</Alert>

              <div>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Your Secret API Key
                </Typography>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: 'var(--mui-palette-surfaceContainer)',
                    border: '1px solid var(--mui-palette-divider)',
                    color: 'var(--mui-palette-text-primary)',
                    fontFamily: 'monospace',
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontSize: 13, wordBreak: 'break-all' }}>{newKey}</span>
                  <IconButton size="small" onClick={() => handleCopy(newKey)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>

              <div>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <TerminalIcon fontSize="inherit" /> MCP Server Configuration Snippet
                </Typography>
                <pre
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: 'var(--mui-palette-surfaceContainer)',
                    border: '1px solid var(--mui-palette-divider)',
                    color: 'var(--mui-palette-text-primary)',
                    fontSize: 12,
                    overflowX: 'auto',
                    marginTop: 4,
                  }}
                >
                  {mcpConfigSnippet(newKey)}
                </pre>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleCopy(mcpConfigSnippet(newKey))}
                  startIcon={<ContentCopyIcon />}
                  sx={{ textTransform: 'none', mt: 1 }}
                >
                  {copied ? 'Copied Config!' : 'Copy Config'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '8px 24px 16px' }}>
          {!newKey ? (
            <>
              <Button onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={!keyName.trim() || isSubmitting}
              >
                {isSubmitting ? 'Generating...' : 'Generate Key'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                setNewKey(null);
                setCreateOpen(false);
              }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </GlassCard>
  );
};

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
import { Link as RouterLink } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export function ApiKeysSettingsCard() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys/list');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to create key:', err);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
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
            onClick={() => setCreateOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Create API Key
          </Button>
        </div>
      </div>

      {keys.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No active API keys found. Create a key to connect third-party apps or MCP servers.
        </Alert>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {keys.map((k) => (
            <div
              key={k.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {k.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                >
                  {k.keyPrefix}
                </Typography>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {k.lastUsedAt
                    ? `Used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                    : 'Never used'}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={() => handleRevoke(k.id)}
                  sx={{ textTransform: 'none' }}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate MCP API Key</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          {!newKey ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Enter a name to identify where this key will be used (e.g. "Claude Desktop", "Cursor
                AI").
              </Typography>
              <TextField
                autoFocus
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
                    backgroundColor: 'rgba(0,0,0,0.3)',
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
                    backgroundColor: 'rgba(0,0,0,0.4)',
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
              <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreate} disabled={!keyName.trim()}>
                Generate Key
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
}

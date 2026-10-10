import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import KeyIcon from '@mui/icons-material/Key';
import TerminalIcon from '@mui/icons-material/Terminal';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { useState } from 'react';
import { CARETO_MCP_TOOLS } from '@/../api/_lib/mcp/tools';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/mcp')({
  component: McpDocumentationPage,
});

function McpDocumentationPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://careto.vercel.app';

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        careto: {
          url: `${currentOrigin}/api/mcp/sse`,
          headers: {
            Authorization: 'Bearer careto_sk_YOUR_SECRET_API_KEY',
          },
        },
      },
    },
    null,
    2,
  );

  return (
    <Container maxWidth="md" style={{ paddingTop: 24, paddingBottom: 48 }}>
      {/* Header & Back Nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <RouterLink to="/settings" style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none' }}>
            Back to Settings
          </Button>
        </RouterLink>
        <Chip
          icon={<IntegrationInstructionsIcon />}
          label="MCP v1.0.0 Spec Compliant"
          color="primary"
          variant="outlined"
          size="small"
        />
      </div>

      {/* Hero Title */}
      <div style={{ marginBottom: 32 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Careto Model Context Protocol (MCP) Server
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Connect AI assistants (Claude Desktop, Cursor, ChatGPT, Gemini) directly to your Careto
          automotive logs, expense analytics, service reminders, and Vision AI receipt recognition.
        </Typography>
      </div>

      {/* Quick Setup Card */}
      <GlassCard
        style={{ padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <KeyIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              1. Get Your API Key
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Generate a secret <code style={{ color: '#7dd3fc' }}>careto_sk_...</code> key in your
              Careto settings.
            </Typography>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <RouterLink to="/settings" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Manage API Keys in Settings
            </Button>
          </RouterLink>
        </div>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TerminalIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              2. Add to MCP Client Configuration
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Add this block to your Claude Desktop (
              <code style={{ color: '#7dd3fc' }}>claude_desktop_config.json</code>) or Cursor
              settings:
            </Typography>
          </div>
        </div>

        {/* RULE: Avoid <Box> without props */}
        <div style={{ position: 'relative' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <pre style={{ margin: 0 }}>{claudeConfig}</pre>
          </Paper>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopy(claudeConfig, 'config')}
            sx={{
              textTransform: 'none',
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            {copiedKey === 'config' ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </GlassCard>

      {/* Available Tools Inventory */}
      <div style={{ marginBottom: 24 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Available MCP Tools ({CARETO_MCP_TOOLS.length})
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          All tools support real-time execution via HTTP SSE and HTTP POST transport protocols.
        </Typography>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {CARETO_MCP_TOOLS.map((tool) => (
            <GlassCard key={tool.name} style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}
                >
                  {tool.name}
                </Typography>
                <Chip label="Tool" size="small" variant="outlined" />
              </div>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
                {tool.description}
              </Typography>

              {tool.inputSchema.properties && (
                <div>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 1 }}
                  >
                    Input Parameters:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 1.5,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {Object.entries(tool.inputSchema.properties).map(
                      ([param, spec]: [string, any]) => (
                        <div key={param} style={{ marginBottom: 4 }}>
                          <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{param}</span>
                          {tool.inputSchema.required?.includes(param) && (
                            <span style={{ color: '#ef4444' }}>*</span>
                          )}
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {' '}
                            ({spec.type}):{' '}
                          </span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {spec.description}
                          </span>
                        </div>
                      ),
                    )}
                  </Paper>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Endpoints & Technical Details */}
      <GlassCard style={{ padding: 20 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Server Endpoints & Authentication
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Careto MCP Server implements the standard Model Context Protocol:
        </Typography>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              SSE Transport Endpoint
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
              GET /api/mcp/sse
            </Typography>
          </div>

          <div>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              JSON-RPC / Message Post Endpoint
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
              POST /api/mcp/messages
            </Typography>
          </div>

          <Alert severity="success" sx={{ borderRadius: 2, mt: 1 }}>
            Supports standard{' '}
            <code style={{ fontWeight: 700 }}>Authorization: Bearer careto_sk_...</code> headers.
          </Alert>
        </div>
      </GlassCard>
    </Container>
  );
}

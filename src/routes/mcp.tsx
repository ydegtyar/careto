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
import { useSession } from '@/lib/auth-client';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/mcp')({
  component: McpDocumentationPage,
});

function McpDocumentationPage() {
  const { data: session } = useSession();
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
        <RouterLink to={session ? '/settings' : '/sign-in'} style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none' }}>
            {session ? 'Back to Settings' : 'Sign In'}
          </Button>
        </RouterLink>
        <Chip
          icon={<IntegrationInstructionsIcon />}
          label="Public MCP Spec Compliant"
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
              1. Get Your API Key or Connect with OAuth
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Generate a secret{' '}
              <code style={{ color: 'var(--mui-palette-primary-main)' }}>careto_sk_...</code> key in your
              settings, or connect directly using Gemini / ChatGPT OAuth 2.1.
            </Typography>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {session ? (
            <RouterLink to="/settings" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Manage API Keys in Settings
              </Button>
            </RouterLink>
          ) : (
            <RouterLink to="/sign-in" search={{ redirect: '/mcp' }} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Sign In to Generate Keys
              </Button>
            </RouterLink>
          )}
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
              <code style={{ color: 'var(--mui-palette-primary-main)' }}>claude_desktop_config.json</code>) or Cursor
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
              bgcolor: 'var(--mui-palette-surfaceContainer)',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
              border: '1px solid var(--mui-palette-divider)',
              color: 'var(--mui-palette-text-primary)',
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
              bgcolor: 'var(--mui-palette-background-paper)',
              backdropFilter: 'blur(8px)',
              borderColor: 'var(--mui-palette-divider)',
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
                      bgcolor: 'var(--mui-palette-surfaceContainer)',
                      borderRadius: 1.5,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      border: '1px solid var(--mui-palette-divider)',
                    }}
                  >
                    {Object.entries(tool.inputSchema.properties).map(
                      ([param, spec]: [string, any]) => (
                        <div key={param} style={{ marginBottom: 4 }}>
                          <span style={{ color: 'var(--mui-palette-primary-main)', fontWeight: 600 }}>{param}</span>
                          {tool.inputSchema.required?.includes(param) && (
                            <span style={{ color: 'var(--mui-palette-error-main)' }}>*</span>
                          )}
                          <span style={{ color: 'var(--mui-palette-text-secondary)', opacity: 0.85 }}>
                            {' '}
                            ({spec.type}):{' '}
                          </span>
                          <span style={{ color: 'var(--mui-palette-text-primary)' }}>
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
              OAuth 2.1 Discovery (Gemini & ChatGPT)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
              GET /.well-known/oauth-protected-resource
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
              GET /.well-known/oauth-authorization-server
            </Typography>
          </div>

          <Alert severity="success" sx={{ borderRadius: 2, mt: 1 }}>
            Fully compatible with <strong>Gemini & ChatGPT OAuth 2.1</strong> standard discovery as well as static{' '}
            <code style={{ fontWeight: 700 }}>Authorization: Bearer careto_sk_...</code> headers.
          </Alert>
        </div>
      </GlassCard>
    </Container>
  );
}

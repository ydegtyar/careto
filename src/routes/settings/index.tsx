import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PaidIcon from '@mui/icons-material/Paid';
import SecurityIcon from '@mui/icons-material/Security';
import SendIcon from '@mui/icons-material/Send';
import StorageIcon from '@mui/icons-material/Storage';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { data } from '@/data/client';
import { createExportZip, downloadExportZip, parseImportZip } from '@/data/compute/export-import';
import { AiSettingsCard } from '@/features/ai/components/AiSettingsCard/AiSettingsCard';
import {
  getPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/features/reminders/lib/push-client';
import { CurrencyChip } from '@/features/settings/components/CurrencyChip/CurrencyChip';
import { SyncStatusCard } from '@/features/settings/components/SyncStatusCard/SyncStatusCard';
import { ThemeSelectionCard } from '@/features/settings/components/ThemeSelectionCard/ThemeSelectionCard';
import {
  ALL_CURRENCIES,
  useFavoriteCurrencies,
  useLastUsedCurrency,
} from '@/shared/lib/currencies';
import { clearQueryCacheStorage, getQueryCacheStorageType } from '@/shared/lib/queryPersister';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();

  const [favoriteCurrencies, setFavoriteCurrencies] = useFavoriteCurrencies();
  const [lastUsedCurrency, setLastUsedCurrency] = useLastUsedCurrency();

  const handleToggleFavoriteCurrency = (code: string) => {
    if (favoriteCurrencies.includes(code)) {
      if (favoriteCurrencies.length === 1) return; // keep at least one
      const updated = favoriteCurrencies.filter((c) => c !== code);
      setFavoriteCurrencies(updated);
      if (lastUsedCurrency === code && updated.length > 0) {
        setLastUsedCurrency(updated[0]!);
      }
    } else {
      setFavoriteCurrencies([...favoriteCurrencies, code]);
    }
  };

  const [_offlineSync, _setOfflineSync] = useState(true);

  // Push Notifications state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);

  // Storage Cache State
  const [cacheStorageType, setCacheStorageType] = useState<'IndexedDB' | 'localStorage' | 'None'>(
    'IndexedDB',
  );

  // Export / Import state
  const [backupMessage, setBackupMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isPushSupported().then((supported) => {
      setPushSupported(supported);
      if (supported) {
        getPushSubscription().then((sub) => setPushSubscribed(!!sub));
      }
    });
    getQueryCacheStorageType().then(setCacheStorageType);
  }, []);

  const handleTogglePush = async (enable: boolean) => {
    setPushLoading(true);
    setTestPushStatus(null);
    try {
      if (enable) {
        const res = await subscribeToPush();
        if (res.success) {
          setPushSubscribed(true);
        } else {
          setTestPushStatus(`Subscription error: ${res.error}`);
        }
      } else {
        await unsubscribeFromPush();
        setPushSubscribed(false);
      }
    } finally {
      setPushLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setTestPushStatus('Sending test notification...');
    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Careto Alert',
          body: 'Dual-trigger reminder: Service is upcoming in 450 km',
          url: '/reminders',
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setTestPushStatus(`Test push sent successfully (${json.sent} devices reached)`);
      } else {
        setTestPushStatus(`Error sending push: ${json.error || json.message}`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      setTestPushStatus(`Failed to send test push: ${err.message}`);
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    setBackupMessage(null);
    try {
      const fullData = await data.getAllData();
      const zip = createExportZip(fullData);
      downloadExportZip(zip, `careto-backup-${new Date().toISOString().split('T')[0]}.aem.zip`);
      setBackupMessage({
        type: 'success',
        text: `Exported ${fullData.vehicles.length} vehicle(s), ${fullData.entries.length} entries, ${fullData.reminders.length} reminders.`,
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setBackupMessage({ type: 'error', text: `Export failed: ${errorObj.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupMessage(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const parsed = parseImportZip(uint8);

      const res = await data.importData({
        vehicles: parsed.vehicles,
        entries: parsed.entries,
        reminders: parsed.reminders,
        notes: parsed.notes,
      });

      setBackupMessage({
        type: 'success',
        text: `Successfully imported ${res.importedCount} records from ${file.name}.`,
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setBackupMessage({ type: 'error', text: `Import failed: ${errorObj.message}` });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePurgeQueryCache = async () => {
    if (
      !window.confirm(
        'Are you sure you want to purge local query cache? Cached API responses will be cleared.',
      )
    ) {
      return;
    }
    try {
      await clearQueryCacheStorage();
      queryClient.clear();
      setBackupMessage({
        type: 'success',
        text: 'TanStack Query cache purged successfully.',
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setBackupMessage({ type: 'error', text: `Failed to purge query cache: ${errorObj.message}` });
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all local cache and reset state?')) {
      return;
    }
    try {
      await clearQueryCacheStorage();
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
      setBackupMessage({
        type: 'success',
        text: 'Local cache cleared successfully. Reloading...',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setBackupMessage({ type: 'error', text: `Failed to clear cache: ${errorObj.message}` });
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Priority Sync Status Card */}
      <SyncStatusCard />

      {/* Grid of Settings Cards for Desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
        }}
      >
        {/* Theme Selection Card */}
        <ThemeSelectionCard />

        {/* Web Push Notifications Card */}
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NotificationsActiveIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <div>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Web Push Reminders
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Server-side dual trigger notifications
                </Typography>
              </div>
            </div>
            <Switch
              checked={pushSubscribed}
              disabled={!pushSupported || pushLoading}
              onChange={(e) => handleTogglePush(e.target.checked)}
              slotProps={{ input: { 'aria-label': 'Enable Web Push notifications' } }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
          </div>

          {pushSubscribed && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={handleSendTestPush}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Send Test Notification
              </Button>
            </div>
          )}

          {testPushStatus && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {testPushStatus}
            </Typography>
          )}
        </GlassCard>

        {/* Favorite Currencies Selection Card */}
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PaidIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Favorite Currencies
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Select currencies available in expense forms (USD reporting auto-converted)
              </Typography>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {ALL_CURRENCIES.map((item) => (
              <CurrencyChip
                key={item.code}
                item={item}
                isFav={favoriteCurrencies.includes(item.code)}
                onToggle={handleToggleFavoriteCurrency}
              />
            ))}
          </div>
        </GlassCard>

        {/* AI Vision & LLM Waterfall Settings */}
        <AiSettingsCard />

        {/* Backups & Data Management */}
        <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudDownloadIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Backup & Data Export
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Full offline archive with NDJSON & CSV summaries
              </Typography>
            </div>
          </div>

          {backupMessage && (
            <Alert severity={backupMessage.type} sx={{ py: 0.5, borderRadius: 2 }}>
              {backupMessage.text}
            </Alert>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<CloudDownloadIcon />}
              disabled={isExporting}
              onClick={handleExportBackup}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Export Backup (.aem.zip)
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Restore Backup
            </Button>

            <input
              type="file"
              accept=".zip,.aem.zip"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />

            <Button
              size="small"
              variant="text"
              startIcon={<FileDownloadIcon />}
              href="/api/export/download"
              target="_blank"
              download
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Download GDPR Data (JSON)
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<StorageIcon />}
              onClick={handlePurgeQueryCache}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Purge Query Cache ({cacheStorageType})
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={handleClearCache}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Clear Local Cache
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Legal & Compliance */}
      <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Legal & Compliance
          </Typography>
        </div>
        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          Careto is operating under legal terms and privacy protections. Read our documentation
          below:
        </Typography>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <RouterLink to="/terms" style={{ textDecoration: 'none' }}>
            <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Terms of Service
            </Button>
          </RouterLink>
          <RouterLink to="/privacy" style={{ textDecoration: 'none' }}>
            <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Privacy Policy
            </Button>
          </RouterLink>
        </div>
      </GlassCard>

      {/* About & Attribution */}
      <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Security & Attribution
          </Typography>
        </div>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Real-time and historic exchange rates powered by{' '}
          <Link
            href="https://open.er-api.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'primary.main' }}
          >
            Exchange Rate API
          </Link>
          .
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
          App Version: 0.3.1 (Glacier Edition)
        </Typography>
      </GlassCard>
    </div>
  );
}

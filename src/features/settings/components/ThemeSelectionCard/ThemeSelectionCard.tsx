import BrightnessAutoOutlinedIcon from '@mui/icons-material/BrightnessAutoOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { useColorScheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { cardStyle, headerContainerStyle, toggleButtonGroupSx } from './ThemeSelectionCard.styles';

export const ThemeSelectionCard: React.FC = () => {
  const { mode, setMode } = useColorScheme();
  const currentThemeMode = mode || 'system';

  const handleThemeChange = (newMode: 'system' | 'dark' | 'light' | null) => {
    if (!newMode) return;
    setMode(newMode);
    if (typeof document !== 'undefined') {
      const isDark =
        newMode === 'dark' ||
        (newMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#0a0e1a' : '#f4f8fb');
      }
    }
  };

  return (
    <GlassCard style={cardStyle}>
      <div style={headerContainerStyle}>
        <PaletteOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        <div>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Appearance & Theme
          </Typography>
        </div>
      </div>
      <ToggleButtonGroup
        value={currentThemeMode}
        exclusive
        onChange={(_, val) => handleThemeChange(val)}
        aria-label="Theme mode selection"
        fullWidth
        size="small"
        sx={toggleButtonGroupSx}
      >
        <ToggleButton value="system" aria-label="System Theme">
          <BrightnessAutoOutlinedIcon sx={{ fontSize: 18 }} />
          <span>System</span>
        </ToggleButton>
        <ToggleButton value="dark" aria-label="Dark Theme">
          <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Dark</span>
        </ToggleButton>
        <ToggleButton value="light" aria-label="Light Theme">
          <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Light</span>
        </ToggleButton>
      </ToggleButtonGroup>
    </GlassCard>
  );
};

export default ThemeSelectionCard;

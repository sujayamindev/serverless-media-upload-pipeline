import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { t } from '../lib/tokens';

const ORDER = ['system', 'light', 'dark'];
const LABEL = { system: 'System', light: 'Light', dark: 'Dark' };
const ICON = {
  system: SettingsBrightnessOutlinedIcon,
  light: LightModeOutlinedIcon,
  dark: DarkModeOutlinedIcon,
};

/** Round capsule-style button cycling system → light → dark (DESIGN.md §8). */
export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const current = ORDER.includes(mode) ? mode : 'system';
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = ICON[current];
  const label = `Theme: ${LABEL[current]}. Switch to ${LABEL[next].toLowerCase()}.`;

  return (
    <Tooltip title={`Theme · ${LABEL[current]}`}>
      <IconButton
        onClick={() => setMode(next)}
        aria-label={label}
        sx={{
          width: 28,
          height: 28,
          p: 0,
          flex: 'none',
          bgcolor: t.ink6,
          color: t.ink70,
          boxShadow: t.shadowNav,
          '&:hover': { bgcolor: t.ink10, color: t.ink },
        }}
      >
        <Icon sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  );
}

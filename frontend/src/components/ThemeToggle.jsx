import { IconButton } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

const ORDER = ['system', 'light', 'dark'];
const ICON = {
  system: SettingsBrightnessOutlinedIcon,
  light: LightModeOutlinedIcon,
  dark: DarkModeOutlinedIcon,
};

/** Icon-only button cycling system → light → dark (DESIGN.md §8). */
export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const current = ORDER.includes(mode) ? mode : 'system';
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = ICON[current];

  return (
    <IconButton onClick={() => setMode(next)} aria-label={`Theme: ${current}. Switch to ${next}.`} size="small">
      <Icon sx={{ fontSize: 20 }} />
    </IconButton>
  );
}

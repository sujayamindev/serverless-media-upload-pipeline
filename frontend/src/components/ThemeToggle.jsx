import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { t } from '../lib/tokens';

const LABEL = { light: 'Light', dark: 'Dark' };
const ICON = { light: SunIcon, dark: MoonIcon };

/** Round capsule-style button switching between light and dark (DESIGN.md §8). */
export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  // Until the user picks one, MUI reports 'system'; show what the OS resolved to.
  const current = (mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
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
        <Icon size={16} weight="regular" />
      </IconButton>
    </Tooltip>
  );
}

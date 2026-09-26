import { Box } from '@mui/material';
import { eyebrowType, t } from '../lib/tokens';
import StatusDot from './StatusDot';

const TONE = { ink: t.ink60, orange: t.orange, olive: t.green };

/**
 * Mono uppercase eyebrow chip (DESIGN.md §6). `dot` prepends a coloured status
 * dot, optionally pulsing.
 */
export default function Eyebrow({ tone = 'ink', dot, pulse = false, sx, children }) {
  return (
    <Box
      component="span"
      sx={[
        {
          ...eyebrowType,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          px: '9px',
          py: '5px',
          bgcolor: t.chipBg,
          color: TONE[tone],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {dot && <StatusDot color={dot} size={6} pulse={pulse} />}
      {children}
    </Box>
  );
}

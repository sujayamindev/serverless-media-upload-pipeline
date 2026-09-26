import { Box } from '@mui/material';
import { eyebrowType, t } from '../lib/tokens';
import StatusDot from './StatusDot';

const TONE = {
  ink: t.ink60,
  strong: t.ink70,
  orange: t.orange,
  olive: t.green,
  inverse: 'color-mix(in srgb, var(--inverse-fg) 60%, transparent)',
};

/**
 * Mono uppercase label (DESIGN.md §6 "Eyebrow chip"). `chip` gives it the cream
 * fill; `dot` prepends a coloured data dot (optionally pulsing).
 */
export default function Eyebrow({ tone = 'ink', chip = true, dot, pulse = false, component = 'span', sx, children, ...props }) {
  return (
    <Box
      component={component}
      {...props}
      sx={[
        {
          ...eyebrowType,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          m: 0,
          color: TONE[tone] ?? tone,
          ...(chip ? { bgcolor: t.chipBg, px: '9px', py: '5px' } : null),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {dot && <StatusDot color={dot} size={6} pulse={pulse} />}
      {children}
    </Box>
  );
}

import { Box } from '@mui/material';
import { bracketTicks, t } from '../lib/tokens';

/**
 * Square-cornered card with a dashed hairline border and ink corner ticks
 * (DESIGN.md §4, §6 "Card"). `inverse` is the one emphasised ink card per page:
 * filled, no border, no ticks. `active` switches the border to solid ink.
 */
export default function BracketFrame({ inverse = false, active = false, filled = false, sx, children, ...props }) {
  return (
    <Box
      {...props}
      sx={[
        {
          position: 'relative',
          p: { xs: 3, sm: 4 },
          minWidth: 0,
        },
        inverse
          ? { bgcolor: t.inverseBg, color: t.inverseFg }
          : {
              border: `1px ${active ? 'solid' : 'dashed'} ${active ? t.ink : t.rule}`,
              bgcolor: filled ? t.card : 'transparent',
              transition: 'border-color 250ms var(--ease), background-color 250ms var(--ease)',
              '&::before': bracketTicks(),
            },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

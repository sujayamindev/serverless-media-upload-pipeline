import { Box } from '@mui/material';
import { bracketTicks, t } from '../lib/tokens';

/**
 * Square-cornered frame with a dashed hairline border and ink corner ticks.
 * `active` switches the border to solid ink.
 */
export default function BracketFrame({ active = false, sx, children, ...props }) {
  return (
    <Box
      {...props}
      sx={[
        {
          position: 'relative',
          minWidth: 0,
          border: `1px ${active ? 'solid' : 'dashed'} ${active ? t.ink : t.rule}`,
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

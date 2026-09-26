import { Box } from '@mui/material';
import { eyebrowType, t } from '../lib/tokens';
import StatusDot from './StatusDot';

/**
 * Floating data annotation (DESIGN.md §6): card chip, 4px radius, float shadow,
 * a coloured dot and mono text. `leader` draws a dashed orange line of that
 * length out of the given side toward the point being annotated.
 */
export default function Annotation({ dot = t.chartOrange, pulse = false, leader, side = 'left', sx, children, ...props }) {
  const horizontal = side === 'left' || side === 'right';
  return (
    <Box
      component="span"
      {...props}
      sx={[
        {
          ...eyebrowType,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          px: '10px',
          py: '7px',
          borderRadius: '4px',
          bgcolor: t.card,
          color: t.ink,
          boxShadow: t.shadowFloat,
          whiteSpace: 'nowrap',
        },
        leader && {
          '&::before': {
            content: '""',
            position: 'absolute',
            [side]: -leader,
            ...(horizontal
              ? { top: '50%', width: leader, borderTop: `1px dashed ${t.chartOrange}` }
              : { left: 16, height: leader, borderLeft: `1px dashed ${t.chartOrange}` }),
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <StatusDot color={dot} size={7} pulse={pulse} />
      {children}
    </Box>
  );
}

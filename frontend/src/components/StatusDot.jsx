import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { reducedMotion, t } from '../lib/tokens';

const ring = keyframes`
  from { transform: scale(1); opacity: .9; }
  to { transform: scale(2.8); opacity: 0; }
`;

const breathe = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: .45; }
`;

/**
 * Small filled data dot. `pulse` adds the PENDING treatment: opacity breathing
 * plus a 1px ring expanding outward (off under prefers-reduced-motion).
 */
export default function StatusDot({ color = t.chartInk, size = 7, pulse = false, hollow = false, sx }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={[
        {
          position: 'relative',
          display: 'inline-block',
          flex: 'none',
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: hollow ? 'transparent' : color,
          border: hollow ? `1px solid ${t.rule}` : 0,
          boxSizing: 'border-box',
        },
        pulse && {
          animation: `${breathe} 1.8s var(--ease) infinite`,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            animation: `${ring} 1.8s var(--ease) infinite`,
          },
          [reducedMotion]: { animation: 'none', '&::after': { animation: 'none', opacity: 0 } },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

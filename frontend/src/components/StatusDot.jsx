import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { reducedMotion, t } from '../lib/tokens';

// PENDING treatment: a 1px ring expanding outward.
const ring = keyframes`
  from { transform: scale(1); opacity: .9; }
  to { transform: scale(2.8); opacity: 0; }
`;

/** Small filled status dot; `hollow` for not-started, `pulse` for in progress. */
export default function StatusDot({ color = t.chartInk, size = 7, pulse = false, hollow = false }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        position: 'relative',
        display: 'inline-block',
        flex: 'none',
        width: size,
        height: size,
        borderRadius: '50%',
        boxSizing: 'border-box',
        bgcolor: hollow ? 'transparent' : color,
        border: hollow ? `1px solid ${t.rule}` : 0,
        ...(pulse && {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            animation: `${ring} 1.8s var(--ease) infinite`,
          },
          [reducedMotion]: { '&::after': { animation: 'none', opacity: 0 } },
        }),
      }}
    />
  );
}

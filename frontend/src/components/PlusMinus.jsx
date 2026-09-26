import { Box } from '@mui/material';
import { SANS } from '../lib/tokens';

// Accordion marker: a sans "+" that becomes "−" when the row is expanded.
// MUI adds .Mui-expanded to the icon wrapper, which the CSS keys off.
export default function PlusMinus() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        fontFamily: SANS,
        fontSize: 22,
        lineHeight: 1,
        fontWeight: 300,
        width: 16,
        textAlign: 'center',
        '&::before': { content: '"+"' },
        '.Mui-expanded > &::before': { content: '"\\2212"' },
      }}
    />
  );
}

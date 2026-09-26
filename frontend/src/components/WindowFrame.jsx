import { Box } from '@mui/material';
import { metaType, t } from '../lib/tokens';

/**
 * Preview "window" (DESIGN.md §6): card panel with a 28px title bar, three grey
 * dots and a centred mono title.
 */
export default function WindowFrame({ title, bodySx, sx, children, ...props }) {
  return (
    <Box
      {...props}
      sx={[
        {
          bgcolor: t.card,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadowWindow,
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <Box aria-hidden sx={{ position: 'absolute', left: 12, display: 'flex', gap: '5px' }}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: t.ink20 }} />
          ))}
        </Box>
        <Box component="span" sx={{ ...metaType, color: t.ink42, px: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </Box>
      </Box>
      <Box sx={[{ bgcolor: t.windowBody }, ...(Array.isArray(bodySx) ? bodySx : [bodySx])]}>{children}</Box>
    </Box>
  );
}

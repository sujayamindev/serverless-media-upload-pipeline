import { useState } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { t } from '../lib/tokens';

/**
 * Full-screen viewer for the architecture diagram. Opens at actual size so the
 * small text is readable (scroll to pan); clicking the diagram toggles fit-to-
 * screen. Closes with the X button or Esc.
 */
export default function DiagramViewer({ open, onClose, src, alt }) {
  const [fit, setFit] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-labelledby="diagram-viewer-title"
      slotProps={{
        paper: { sx: { bgcolor: t.diagramBg, backgroundImage: 'none' } },
        transition: { onExited: () => setFit(false) },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: `1px solid ${t.border}`,
          bgcolor: t.card,
          color: t.ink,
        }}
      >
        <Typography id="diagram-viewer-title" variant="subtitle2" sx={{ flex: 1 }}>
          Architecture diagram
        </Typography>
        <Typography variant="meta" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {fit ? 'Click to view actual size' : 'Click to fit the screen · Esc to close'}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close diagram" autoFocus sx={{ color: t.ink }}>
          <XIcon size={20} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', p: { xs: 1, sm: 2 } }}>
        <Box
          component="img"
          src={src}
          alt={alt}
          onClick={() => setFit((f) => !f)}
          sx={{
            display: 'block',
            m: 'auto',
            cursor: fit ? 'zoom-in' : 'zoom-out',
            ...(fit
              ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }
              : { width: 2424, maxWidth: 'none', height: 'auto' }),
          }}
        />
      </Box>
    </Dialog>
  );
}

import { useEffect, useId, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { CloudArrowUpIcon, FilmStripIcon, ImageIcon } from '@phosphor-icons/react';
import BracketFrame from './BracketFrame';
import { ACCEPTED_FORMATS, MAX_SIZE_LABEL, formatBytes } from '../lib/format';
import { metaType, reducedMotion, t } from '../lib/tokens';

// The CloudFront CSP allows data: images but not blob:, so local previews are
// read as data URLs. Skip anything big enough to make that slow.
const MAX_PREVIEW_BYTES = 8 * 1024 * 1024;

const scan = keyframes`
  from { top: 0%; }
  to { top: 100%; }
`;

const hiddenInput = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  border: 0,
};

/**
 * File picker in a large bracket frame (DESIGN.md §9). Drag-over turns the
 * dashed border solid ink with a 6% ink fill. While `scanning` is true a
 * hairline sweeps over the preview, matching the server-side content check.
 * `children` are rendered as extra actions when a file is selected.
 */
export default function Dropzone({ file, disabled, scanning, onSelect, onClear, onReject, children }) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/') || file.size > MAX_PREVIEW_BYTES) return undefined;
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled) setPreview({ file, url: reader.result });
    };
    reader.readAsDataURL(file);
    return () => {
      cancelled = true;
    };
  }, [file]);

  const previewUrl = preview?.file === file ? preview.url : null;

  const accept = (candidate) => {
    if (!candidate) return;
    if (!/^(image|video)\//.test(candidate.type)) {
      onReject('Choose an image or video file.');
      return;
    }
    onSelect(candidate);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    accept(event.dataTransfer.files?.[0]);
  };

  const handleInput = (event) => {
    accept(event.target.files?.[0]);
    // Allow picking the same file again after clearing it.
    event.target.value = '';
  };

  const FileIcon = file?.type.startsWith('video/') ? FilmStripIcon : ImageIcon;

  return (
    <BracketFrame
      active={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        p: { xs: 2.5, sm: 4 },
        bgcolor: dragging ? t.ink6 : t.card,
        '&:focus-within': { outline: `1px solid ${t.ink}`, outlineOffset: 4 },
      }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*,video/*"
        disabled={disabled}
        onChange={handleInput}
        style={hiddenInput}
      />

      {file ? (
        <Stack spacing={2.5}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '16 / 10',
              maxHeight: 360,
              overflow: 'hidden',
              bgcolor: t.ink6,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt={`Preview of ${file.name}`}
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <FileIcon size={48} weight="thin" color={t.ink42} />
            )}
            {scanning && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: t.chartOrange,
                  top: '50%',
                  animation: `${scan} 2.4s var(--ease) infinite alternate`,
                  [reducedMotion]: { animation: 'none' },
                }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
              {file.name}
            </Typography>
            <Typography variant="meta">
              {formatBytes(file.size)} · {file.type}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
            {children}
            <Button component="label" htmlFor={inputId} variant="outlined" disabled={disabled}>
              Choose another
            </Button>
            <Button onClick={onClear} variant="text" disabled={disabled}>
              Remove
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            minHeight: 240,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          <CloudArrowUpIcon size={36} weight="thin" color={dragging ? t.ink : t.ink42} />
          <Typography variant="h4" component="span">
            Drop an image or video here
          </Typography>
          <Typography variant="body2" sx={{ color: t.ink60 }}>
            or click to choose a file
          </Typography>
          <Box component="span" sx={{ ...metaType, color: t.ink42, mt: 1 }}>
            {ACCEPTED_FORMATS}, up to {MAX_SIZE_LABEL}
          </Box>
        </Box>
      )}
    </BracketFrame>
  );
}

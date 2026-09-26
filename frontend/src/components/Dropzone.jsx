import { useEffect, useId, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import BracketFrame from './BracketFrame';
import Eyebrow from './Eyebrow';
import { ACCEPTED_FORMATS, ACCEPTED_FORMATS_META, MAX_SIZE_LABEL, formatBytes } from '../lib/format';
import { MONO, metaType, reducedMotion, t } from '../lib/tokens';
import { srOnly } from '../lib/layout';

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
  const hintId = useId();
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

  const FileIcon = file?.type.startsWith('video/') ? MovieOutlinedIcon : ImageOutlinedIcon;

  return (
    <BracketFrame
      active={dragging}
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: dragging ? t.ink6 : 'transparent',
        '&:focus-within': { outline: `1px solid ${t.ink}`, outlineOffset: 4 },
      }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*,video/*"
        disabled={disabled}
        onChange={handleInput}
        aria-describedby={hintId}
        style={hiddenInput}
      />

      {file ? (
        <Stack spacing={3}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '16 / 10',
              overflow: 'hidden',
              bgcolor: t.windowBody,
              border: `1px solid ${t.border}`,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt={`Preview of ${file.name}`}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <FileIcon sx={{ fontSize: 48, color: t.ink42 }} />
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

          <Box sx={{ minWidth: 0 }}>
            <Eyebrow tone="ink" sx={{ mb: 1.5 }}>
              Selected file
            </Eyebrow>
            <Typography sx={{ fontFamily: MONO, fontSize: 14, lineHeight: '21px', wordBreak: 'break-all' }}>
              {file.name}
            </Typography>
            <Typography id={hintId} variant="meta" component="p" sx={{ mt: 0.5 }}>
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
            minHeight: { xs: 260, md: 340 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 2,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          <Eyebrow tone={dragging ? 'orange' : 'ink'} dot={dragging ? t.chartOrange : t.chartInk}>
            {dragging ? 'Release to select' : 'Step 01 · Choose'}
          </Eyebrow>
          <Typography variant="h3" component="span" sx={{ maxWidth: 420 }}>
            Drop a photo or video
          </Typography>
          <Typography variant="body1" component="span" sx={{ color: t.ink60 }}>
            or{' '}
            <Box component="span" sx={{ color: t.ink, textDecoration: 'underline', textDecorationColor: t.rule, textUnderlineOffset: 3 }}>
              choose a file
            </Box>{' '}
            from this device
          </Typography>
          <Box component="span" id={hintId} sx={{ ...metaType, color: t.ink42, mt: 1 }}>
            {ACCEPTED_FORMATS_META} — max {MAX_SIZE_LABEL}
            <Box component="span" sx={srOnly}>
              Accepted: {ACCEPTED_FORMATS}.
            </Box>
          </Box>
        </Box>
      )}
    </BracketFrame>
  );
}

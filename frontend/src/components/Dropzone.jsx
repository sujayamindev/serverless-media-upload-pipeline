import { useEffect, useId, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { ACCEPTED_FORMATS, MAX_SIZE_LABEL, formatBytes } from '../lib/format';

// The CloudFront CSP allows data: images but not blob:, so local previews are
// read as data URLs. Skip anything big enough to make that slow.
const MAX_PREVIEW_BYTES = 8 * 1024 * 1024;

const scan = keyframes`
  from { top: 0%; }
  to { top: 100%; }
`;

const CORNER = 22;
const CORNERS = [
  { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
];

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
 * File picker framed by viewfinder corner marks. While `scanning` is true a
 * line sweeps over the preview, matching the server-side content check.
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

  const markColor = dragging || file ? 'primary.main' : 'text.secondary';
  const FileIcon = file?.type.startsWith('video/') ? MovieOutlinedIcon : ImageOutlinedIcon;

  return (
    <Box
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        p: { xs: 2.5, sm: 4 },
        bgcolor: (theme) =>
          dragging ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper,
        transition: 'background-color 120ms',
        '&:focus-within': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 4,
        },
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

      {CORNERS.map((corner, index) => (
        <Box
          key={index}
          aria-hidden
          sx={{
            position: 'absolute',
            width: CORNER,
            height: CORNER,
            borderStyle: 'solid',
            borderWidth: 0,
            borderColor: markColor,
            transition: 'border-color 120ms',
            ...corner,
          }}
        />
      ))}

      {file ? (
        <Stack spacing={2.5}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '16 / 10',
              overflow: 'hidden',
              borderRadius: 0.5,
              bgcolor: 'action.hover',
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
              <FileIcon sx={{ fontSize: 56, color: 'text.secondary' }} />
            )}
            {scanning && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: 'primary.main',
                  boxShadow: (theme) => `0 0 12px 2px ${alpha(theme.palette.primary.main, 0.6)}`,
                  top: '50%',
                  '@media (prefers-reduced-motion: no-preference)': {
                    animation: `${scan} 1.6s ease-in-out infinite alternate`,
                  },
                }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
              {file.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatBytes(file.size)} · {file.type}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {children}
            <Button component="label" htmlFor={inputId} variant="outlined" color="inherit" disabled={disabled}>
              Choose another
            </Button>
            <Button onClick={onClear} color="inherit" disabled={disabled} sx={{ color: 'text.secondary' }}>
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
          <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: markColor }} />
          <Typography variant="h4" component="span">
            Drop an image or video here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to choose a file
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {ACCEPTED_FORMATS}, up to {MAX_SIZE_LABEL}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

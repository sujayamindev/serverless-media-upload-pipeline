import { Box, Button, Stack, Typography } from '@mui/material';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import WindowFrame from './WindowFrame';
import Eyebrow from './Eyebrow';
import BurstIllustration from './BurstIllustration';
import { STEP } from '../hooks/useMediaUpload';
import { MONO, metaType, t } from '../lib/tokens';
import { formatBytes } from '../lib/format';

const canPlayQuicktime = document.createElement('video').canPlayType('video/quicktime') !== '';

function Preview({ url, contentType }) {
  if (contentType?.startsWith('video/')) {
    if (contentType === 'video/quicktime' && !canPlayQuicktime) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 4, px: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: t.ink60 }}>
            This browser can&rsquo;t play MOV files. Download the file to view it.
          </Typography>
          <Button variant="outlined" href={url} download startIcon={<CloudDownloadOutlinedIcon />}>
            Download file
          </Button>
        </Stack>
      );
    }
    return (
      <video
        controls
        crossOrigin="anonymous"
        preload="metadata"
        style={{ maxWidth: '100%', maxHeight: 420, display: 'block' }}
      >
        <source src={url} type={contentType} />
        Your browser does not support the video tag.
      </video>
    );
  }
  return (
    <Box component="img" src={url} alt="Approved upload" sx={{ maxWidth: '100%', maxHeight: 420, display: 'block' }} />
  );
}

// Status → chip tone and dot (DESIGN.md §2.3).
const STATE = {
  uploading: { label: 'Uploading', tone: 'strong', dot: t.chartAmber, pulse: true },
  pending: { label: 'Pending', tone: 'strong', dot: t.chartAmber, pulse: true },
  approved: { label: 'Approved', tone: 'olive', dot: t.chartOlive },
  rejected: { label: 'Rejected', tone: 'orange', dot: t.chartOrange },
  idle: { label: 'Awaiting file', tone: 'ink', dot: t.chartInk },
  failed: { label: 'Stopped', tone: 'orange', dot: t.chartOrange },
};

function KeyValues({ rows }) {
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)' }}>
      {rows.map(([key, value]) => (
        <Box key={key} sx={{ display: 'contents', '& > *': { py: 1.25, borderTop: `1px solid ${t.border}` } }}>
          <Box component="dt" sx={{ ...metaType, color: t.ink42, pr: 3 }}>
            {key}
          </Box>
          <Box component="dd" sx={{ m: 0, fontFamily: MONO, fontSize: 12, lineHeight: '16.5px', color: t.ink, wordBreak: 'break-all', textAlign: 'right' }}>
            {value}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function headline(state, mediaStatus) {
  if (state === 'approved') return 'Approved.';
  if (state === 'rejected') return 'Rejected.';
  if (state === 'uploading') return 'Sending it to S3.';
  if (state === 'pending') return 'Checking what’s inside.';
  if (state === 'failed') return 'The run stopped.';
  if (mediaStatus) return 'Result';
  return 'Nothing to show yet.';
}

function body(state, mediaStatus) {
  if (state === 'rejected') return mediaStatus.rejection_reason || 'No reason was given.';
  if (state === 'uploading') return 'Your browser uploads straight to S3 with a five-minute signed policy. The backend never handles the bytes.';
  if (state === 'pending') return 'The validator reads the file’s bytes, not its name. This page checks back every 3 seconds.';
  if (state === 'failed') return 'See the message above the dropzone, then try again.';
  if (state === 'approved') return null;
  if (mediaStatus) return `Unexpected status: ${mediaStatus.status}.`;
  return 'Upload a file and the verdict appears here, with a private preview link if it’s approved.';
}

/**
 * Result "window" (DESIGN.md §9): eyebrow status chip, serif verdict, a mono
 * key/value list and, for approved files, the preview.
 */
export default function ResultPanel({ mediaStatus, activeStep, statusLoading, failedAt }) {
  let state = 'idle';
  if (mediaStatus) state = STATE[mediaStatus.status] ? mediaStatus.status : 'other';
  else if (failedAt) state = 'failed';
  else if (activeStep >= STEP.CHECKING || statusLoading) state = 'pending';
  else if (activeStep >= STEP.PERMISSION) state = 'uploading';

  const chip = STATE[state] ?? { label: mediaStatus?.status ?? 'Unknown', tone: 'ink', dot: t.chartInk };
  const approved = state === 'approved';

  const rows = mediaStatus
    ? [
        ['Status', mediaStatus.status],
        mediaStatus.media_id && ['Media ID', mediaStatus.media_id],
        mediaStatus.content_type && ['Content type', mediaStatus.content_type],
        Number(mediaStatus.file_size) > 0 && ['Size', formatBytes(Number(mediaStatus.file_size))],
        mediaStatus.final_key && ['Stored at', mediaStatus.final_key],
        mediaStatus.checked_at && ['Checked', mediaStatus.checked_at],
      ].filter(Boolean)
    : [];

  return (
    <WindowFrame
      component="section"
      aria-labelledby="result-heading"
      title="Pipeline · Result"
      bodySx={{ p: { xs: 2.5, sm: 3.5 } }}
    >
      <Eyebrow tone={chip.tone} dot={chip.dot} pulse={chip.pulse}>
        {chip.label}
      </Eyebrow>
      <Typography id="result-heading" variant="h3" component="h2" sx={{ mt: 2.5 }}>
        {headline(state, mediaStatus)}
      </Typography>
      {body(state, mediaStatus) && (
        <Typography variant="body1" sx={{ color: t.ink70, mt: 2, maxWidth: 460 }}>
          {body(state, mediaStatus)}
        </Typography>
      )}

      {state === 'idle' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, opacity: 0.9 }}>
          <BurstIllustration seed={19} rays={44} sx={{ maxWidth: 240 }} />
        </Box>
      )}

      {approved && mediaStatus.preview_url && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: t.card,
            border: `1px solid ${t.border}`,
            overflow: 'hidden',
          }}
        >
          <Preview url={mediaStatus.preview_url} contentType={mediaStatus.content_type} />
        </Box>
      )}

      {rows.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <KeyValues rows={rows} />
        </Box>
      )}
    </WindowFrame>
  );
}

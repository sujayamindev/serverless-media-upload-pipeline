import { Box, Button, Stack, Typography } from '@mui/material';
import { CloudArrowDownIcon } from '@phosphor-icons/react';
import Eyebrow from './Eyebrow';
import { formatBytes } from '../lib/format';
import { t } from '../lib/tokens';

const canPlayQuicktime = document.createElement('video').canPlayType('video/quicktime') !== '';

function Preview({ url, contentType }) {
  if (contentType?.startsWith('video/')) {
    if (contentType === 'video/quicktime' && !canPlayQuicktime) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ color: t.ink60 }}>
            This browser can't play MOV files. Download the file to view it.
          </Typography>
          <Button variant="outlined" href={url} download startIcon={<CloudArrowDownIcon />}>
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
        style={{ maxWidth: '100%', maxHeight: 360, display: 'block' }}
      >
        <source src={url} type={contentType} />
        Your browser does not support the video tag.
      </video>
    );
  }
  return <Box component="img" src={url} alt="Approved upload" sx={{ maxWidth: '100%', maxHeight: 360, display: 'block' }} />;
}

// Status chip tone and dot (DESIGN.md §2.3).
const CHIP = {
  approved: { tone: 'olive', dot: t.chartOlive },
  rejected: { tone: 'orange', dot: t.chartOrange },
};

const panel = { border: `1px solid ${t.border}`, bgcolor: t.card, p: { xs: 2, sm: 3 } };

// Output column next to the dropzone: a placeholder until the check finishes.
export default function ResultPanel({ mediaStatus, checking }) {
  if (!mediaStatus) {
    return (
      <Box sx={{ ...panel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Typography variant="h4" component="h2">
          Result
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: t.ink60 }}>
          {checking ? 'Checking the file…' : 'The result and a private preview appear here after the check.'}
        </Typography>
      </Box>
    );
  }

  const approved = mediaStatus.status === 'approved';
  const rejected = mediaStatus.status === 'rejected';
  const chip = CHIP[mediaStatus.status] ?? { tone: 'ink', dot: t.chartAmber };
  const facts = [
    mediaStatus.content_type,
    Number(mediaStatus.file_size) > 0 && formatBytes(Number(mediaStatus.file_size)),
    mediaStatus.media_id,
  ].filter(Boolean);

  return (
    <Box sx={panel}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="h3" component="h2">
          {approved ? 'Approved' : rejected ? 'Rejected' : 'Result'}
        </Typography>
        <Eyebrow tone={chip.tone} dot={chip.dot}>
          {mediaStatus.status}
        </Eyebrow>
      </Stack>
      <Typography variant="meta" component="p" sx={{ mt: 1, wordBreak: 'break-all' }}>
        {facts.join(' · ')}
      </Typography>

      {rejected && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {mediaStatus.rejection_reason || 'No reason was given.'}
        </Typography>
      )}

      {approved && mediaStatus.preview_url && (
        <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center', bgcolor: t.ink6, overflow: 'hidden' }}>
          <Preview url={mediaStatus.preview_url} contentType={mediaStatus.content_type} />
        </Box>
      )}
    </Box>
  );
}

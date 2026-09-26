import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';

const canPlayQuicktime = document.createElement('video').canPlayType('video/quicktime') !== '';

function Preview({ url, contentType }) {
  if (contentType?.startsWith('video/')) {
    if (contentType === 'video/quicktime' && !canPlayQuicktime) {
      return (
        <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            This browser can't play MOV files. Download the file to view it.
          </Typography>
          <Button
            variant="outlined"
            href={url}
            download
            startIcon={<CloudDownloadOutlinedIcon />}
          >
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
        style={{ maxWidth: '100%', maxHeight: 480, display: 'block' }}
      >
        <source src={url} type={contentType} />
        Your browser does not support the video tag.
      </video>
    );
  }
  return (
    <Box
      component="img"
      src={url}
      alt="Approved upload"
      sx={{ maxWidth: '100%', maxHeight: 480, display: 'block' }}
    />
  );
}

export default function ResultPanel({ mediaStatus }) {
  if (!mediaStatus) return null;

  const approved = mediaStatus.status === 'approved';
  const rejected = mediaStatus.status === 'rejected';

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: approved ? 2 : 0 }}>
        <Typography variant="h3" component="h2">
          {approved ? 'Approved' : rejected ? 'Rejected' : 'Result'}
        </Typography>
        <Chip
          size="small"
          label={mediaStatus.status}
          color={approved ? 'success' : rejected ? 'error' : 'warning'}
          variant="outlined"
        />
        {mediaStatus.content_type && (
          <Typography variant="body2" color="text.secondary">
            {mediaStatus.content_type}
          </Typography>
        )}
      </Stack>

      {rejected && (
        <Typography variant="body1" sx={{ mt: 1 }}>
          {mediaStatus.rejection_reason || 'No reason was given.'}
        </Typography>
      )}

      {approved && mediaStatus.preview_url && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            borderRadius: 0.5,
            overflow: 'hidden',
          }}
        >
          <Preview url={mediaStatus.preview_url} contentType={mediaStatus.content_type} />
        </Box>
      )}
    </Box>
  );
}

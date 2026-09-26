import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import PageShell from '../components/PageShell';
import Dropzone from '../components/Dropzone';
import PipelineStatus from '../components/PipelineStatus';
import ResultPanel from '../components/ResultPanel';
import TechnicalDetails from '../components/TechnicalDetails';
import Eyebrow from '../components/Eyebrow';
import BurstIllustration from '../components/BurstIllustration';
import { useMediaUpload, STEP } from '../hooks/useMediaUpload';
import { dottedRule, inset } from '../lib/layout';
import { t } from '../lib/tokens';

export default function UploadPage() {
  const upload = useMediaUpload();
  const {
    file,
    activeStep,
    failedAt,
    uploading,
    uploadProgress,
    statusLoading,
    notification,
    presignResponse,
    uploadResponse,
    mediaStatus,
  } = upload;

  return (
    <PageShell>
      {/* Hero */}
      <Box
        component="section"
        aria-labelledby="upload-title"
        sx={{
          ...inset,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.1fr) minmax(0, 0.9fr)' },
          alignItems: 'center',
          columnGap: 6,
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 600 }}>
          <Eyebrow tone="orange" sx={{ mb: 3 }}>
            Upload · verified by content
          </Eyebrow>
          <Typography id="upload-title" variant="h1">
            Drop it in. We&nbsp;look&nbsp;inside.
          </Typography>
          <Typography variant="lede" sx={{ mt: 3, maxWidth: 560 }}>
            Files are checked by what&rsquo;s inside them, not by their name. Approved files get a
            private preview link.
          </Typography>
          <Typography variant="meta" component="p" sx={{ mt: 4 }}>
            Presigned POST · 300 s · Magic bytes, Pillow, OpenCV
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-start' }}>
          <BurstIllustration seed={7} annotation="File bytes · direct to S3" sx={{ maxWidth: 400 }} />
        </Box>
      </Box>

      <Box component="hr" sx={dottedRule} />

      {/* Pipeline progress */}
      <Box component="section" aria-labelledby="progress-heading" sx={{ ...inset, pt: { xs: 6, md: 8 }, pb: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: { xs: 4, md: 5 } }}>
          <Typography id="progress-heading" variant="h4" component="h2">
            Progress
          </Typography>
          <Typography variant="meta">Five stages · Polls every 3 s</Typography>
        </Box>
        <PipelineStatus
          activeStep={activeStep}
          failedAt={failedAt}
          uploading={uploading}
          uploadProgress={uploadProgress}
          statusLoading={statusLoading}
          mediaStatus={mediaStatus}
        />
      </Box>

      {/* Dropzone + result */}
      <Box
        sx={{
          ...inset,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.2fr) minmax(0, 0.8fr)' },
          gap: { xs: 4, md: 5 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          {notification && (
            <Alert severity={notification.type} onClose={upload.dismissNotification}>
              {notification.message}
            </Alert>
          )}

          <Dropzone
            file={file}
            disabled={upload.busy}
            scanning={activeStep === STEP.CHECKING && statusLoading}
            onSelect={upload.selectFile}
            onClear={upload.clearFile}
            onReject={upload.rejectFile}
          >
            {upload.canUpload && (
              <Button variant="contained" onClick={upload.upload}>
                Upload file
              </Button>
            )}
          </Dropzone>
        </Stack>

        <ResultPanel
          mediaStatus={mediaStatus}
          activeStep={activeStep}
          statusLoading={statusLoading}
          failedAt={failedAt}
        />
      </Box>

      <Box sx={{ ...inset, mt: { xs: 5, md: 8 }, color: t.ink }}>
        <TechnicalDetails presignResponse={presignResponse} uploadResponse={uploadResponse} mediaStatus={mediaStatus} />
      </Box>
    </PageShell>
  );
}

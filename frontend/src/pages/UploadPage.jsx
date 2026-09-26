import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import TopBar from '../components/TopBar';
import Dropzone from '../components/Dropzone';
import PipelineStatus from '../components/PipelineStatus';
import ResultPanel from '../components/ResultPanel';
import TechnicalDetails from '../components/TechnicalDetails';
import { useMediaUpload, STEP } from '../hooks/useMediaUpload';
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
    <Box sx={{ minHeight: '100vh' }}>
      <TopBar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Box sx={{ mb: { xs: 3, md: 5 }, maxWidth: 640 }}>
          <Typography variant="h1" sx={{ mb: 1.5 }}>
            Upload media
          </Typography>
          <Typography variant="lede">
            Files are checked by what's inside them, not by their name. Approved files get a
            private preview link.
          </Typography>
        </Box>

        <Box
          component="section"
          aria-labelledby="progress-heading"
          sx={{
            border: `1px solid ${t.border}`,
            bgcolor: t.card,
            p: { xs: 2.5, sm: 3.5 },
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography id="progress-heading" variant="h4" component="h2" sx={{ mb: 3 }}>
            Progress
          </Typography>
          <PipelineStatus
            activeStep={activeStep}
            failedAt={failedAt}
            uploading={uploading}
            uploadProgress={uploadProgress}
            statusLoading={statusLoading}
            mediaStatus={mediaStatus}
          />
        </Box>

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
                Upload
              </Button>
            )}
          </Dropzone>
        </Stack>

        <Stack spacing={3} sx={{ mt: { xs: 3, md: 5 } }}>
          <ResultPanel mediaStatus={mediaStatus} />
          <TechnicalDetails
            presignResponse={presignResponse}
            uploadResponse={uploadResponse}
            mediaStatus={mediaStatus}
          />
        </Stack>
      </Container>
    </Box>
  );
}

import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { STEP } from '../hooks/useMediaUpload';

// `start`/`doneAt` are activeStep thresholds from useMediaUpload.
const STAGES = [
  {
    key: 'select',
    title: 'File chosen',
    note: 'Nothing leaves your browser yet.',
    start: STEP.SELECTED,
    doneAt: STEP.SELECTED,
  },
  {
    key: 'permission',
    title: 'Upload permission',
    note: 'Your sign-in token is checked and a short-lived upload link is issued.',
    services: 'API Gateway, Lambda',
    start: STEP.PERMISSION,
    doneAt: STEP.UPLOADING,
  },
  {
    key: 'upload',
    title: 'Upload to storage',
    note: 'Your browser sends the file straight to S3.',
    services: 'S3',
    start: STEP.UPLOADING,
    doneAt: STEP.UPLOADED,
  },
  {
    key: 'check',
    title: 'Content check',
    note: 'The file is opened and inspected, not just its extension.',
    services: 'S3 event, Lambda, DynamoDB',
    start: STEP.CHECKING,
    doneAt: STEP.DONE,
  },
  {
    key: 'result',
    title: 'Result',
    services: 'API Gateway, Lambda',
    start: STEP.DONE,
    doneAt: STEP.DONE,
  },
];

const STATUS_LABEL = { idle: 'Not started', active: 'In progress', done: 'Done', failed: 'Failed' };

function stageStatus(stage, { activeStep, failedAt, mediaStatus }) {
  if (failedAt === stage.key) return 'failed';
  if (stage.key === 'result') {
    if (activeStep < STEP.DONE) return 'idle';
    return mediaStatus?.status === 'approved' ? 'done' : 'failed';
  }
  if (activeStep >= stage.doneAt) return 'done';
  if (activeStep >= stage.start) return 'active';
  return 'idle';
}

function resultNote(mediaStatus) {
  if (!mediaStatus) return 'Approved files get a private preview link.';
  if (mediaStatus.status === 'approved') return 'Approved. The preview is below.';
  if (mediaStatus.status === 'rejected') return `Rejected: ${mediaStatus.rejection_reason || 'no reason given'}.`;
  return `Unexpected status: ${mediaStatus.status}.`;
}

function Node({ status, working, success }) {
  const filled = status === 'done' || status === 'failed';
  const color = status === 'failed' ? 'error.main' : success ? 'success.main' : 'primary.main';

  return (
    <Box
      role="img"
      aria-label={STATUS_LABEL[status]}
      sx={{
        position: 'relative',
        zIndex: 1,
        width: 28,
        height: 28,
        boxSizing: 'border-box',
        borderRadius: '50%',
        border: 2,
        borderColor: status === 'idle' ? 'divider' : color,
        bgcolor: filled ? color : 'background.paper',
        color: 'primary.contrastText',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {status === 'done' && <CheckRoundedIcon sx={{ fontSize: 16 }} />}
      {status === 'failed' && <CloseRoundedIcon sx={{ fontSize: 16 }} />}
      {status === 'active' &&
        (working ? (
          <CircularProgress size={14} thickness={6} />
        ) : (
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
        ))}
    </Box>
  );
}

export default function PipelineStatus({ activeStep, failedAt, uploading, uploadProgress, statusLoading, mediaStatus }) {
  const context = { activeStep, failedAt, mediaStatus };

  return (
    <Box
      component="ol"
      aria-label="Upload progress"
      sx={{ listStyle: 'none', m: 0, p: 0 }}
    >
      {STAGES.map((stage, index) => {
        const status = stageStatus(stage, context);
        const isLast = index === STAGES.length - 1;
        const working =
          (stage.key === 'permission' && uploading && activeStep === STEP.PERMISSION) ||
          (stage.key === 'upload' && uploading && activeStep === STEP.UPLOADING) ||
          (stage.key === 'check' && statusLoading);
        const showProgress = stage.key === 'upload' && (status === 'active' || uploadProgress > 0) && status !== 'failed';
        const note = stage.key === 'result' ? resultNote(mediaStatus) : stage.note;

        return (
          <Box
            component="li"
            key={stage.key}
            aria-current={status === 'active' ? 'step' : undefined}
            sx={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '28px 1fr',
              columnGap: 1.5,
              pb: isLast ? 0 : 3,
              // Rail between nodes; filled once the stage is done.
              '&::before': isLast
                ? undefined
                : {
                    content: '""',
                    position: 'absolute',
                    left: 13,
                    top: 28,
                    bottom: 0,
                    width: 2,
                    bgcolor: status === 'done' ? 'primary.main' : 'divider',
                  },
            }}
          >
            <Node status={status} working={working} success={stage.key === 'result'} />
            <Box sx={{ minWidth: 0, opacity: status === 'idle' ? 0.6 : 1 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: '28px' }}>
                {stage.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {note}
              </Typography>
              {stage.services && (
                <Typography variant="caption" color="text.secondary">
                  {stage.services}
                </Typography>
              )}
              {showProgress && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '3ch' }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

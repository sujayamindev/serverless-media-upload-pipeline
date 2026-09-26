import { Box, LinearProgress, Typography, useMediaQuery } from '@mui/material';
import { STEP } from '../hooks/useMediaUpload';
import StatusDot from './StatusDot';
import { t } from '../lib/tokens';

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

// Status dots in the chart palette (DESIGN.md §2.3).
function Node({ stage, status, working }) {
  const color = { active: t.chartAmber, failed: t.chartOrange, done: stage.key === 'result' ? t.chartOlive : t.chartInk }[status];
  return (
    <Box
      role="img"
      aria-label={`${stage.title}: ${STATUS_LABEL[status]}`}
      sx={{ position: 'relative', zIndex: 1, width: 28, height: 28, mx: 'auto', display: 'grid', placeItems: 'center' }}
    >
      <StatusDot size={11} color={color} hollow={status === 'idle'} pulse={status === 'active' && working} />
    </Box>
  );
}

function UploadBar({ value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <LinearProgress variant="determinate" value={value} aria-label="Upload progress" sx={{ flex: 1 }} />
      <Typography variant="meta" sx={{ minWidth: '4ch' }}>
        {value}%
      </Typography>
    </Box>
  );
}

// The stage to describe under the compact dots: a failure, else the one in progress,
// else the furthest one reached.
function currentIndex(stages) {
  const failed = stages.findIndex((s) => s.status === 'failed');
  if (failed !== -1) return failed;
  const active = stages.findIndex((s) => s.status === 'active');
  if (active !== -1) return active;
  const reached = stages.findLastIndex((s) => s.status !== 'idle');
  return Math.max(reached, 0);
}

// Horizontal stepper like the original: centred dots joined by a rail, labels below.
// Below md the labels are dropped and only the current stage is described.
export default function PipelineStatus({ activeStep, failedAt, uploading, uploadProgress, statusLoading, mediaStatus }) {
  const compact = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const context = { activeStep, failedAt, mediaStatus };

  const stages = STAGES.map((stage) => {
    const status = stageStatus(stage, context);
    return {
      ...stage,
      status,
      working:
        (stage.key === 'permission' && uploading && activeStep === STEP.PERMISSION) ||
        (stage.key === 'upload' && uploading && activeStep === STEP.UPLOADING) ||
        (stage.key === 'check' && statusLoading),
      showProgress: stage.key === 'upload' && (status === 'active' || uploadProgress > 0) && status !== 'failed',
      note: stage.key === 'result' ? resultNote(mediaStatus) : stage.note,
    };
  });
  const currentAt = currentIndex(stages);
  const current = stages[currentAt];

  return (
    <>
      <Box
        component="ol"
        aria-label="Upload progress"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage, index) => (
          <Box
            component="li"
            key={stage.key}
            aria-current={stage.status === 'active' ? 'step' : undefined}
            sx={{
              position: 'relative',
              textAlign: 'center',
              px: 1.5,
              // Rail to the next dot; solid once this stage is done.
              '&::after':
                index === stages.length - 1
                  ? undefined
                  : {
                      content: '""',
                      position: 'absolute',
                      top: 13.5,
                      left: 'calc(50% + 14px)',
                      right: 'calc(-50% + 14px)',
                      borderTop: `1px ${stage.status === 'done' ? `solid ${t.ink}` : `dotted ${t.rule}`}`,
                    },
            }}
          >
            <Node stage={stage} status={stage.status} working={stage.working} />
            {!compact && (
              <Box sx={{ mt: 1.5, opacity: stage.status === 'idle' ? 0.6 : 1 }}>
                <Typography variant="subtitle1">{stage.title}</Typography>
                <Typography variant="body2" sx={{ color: t.ink60, mt: 0.5 }}>
                  {stage.note}
                </Typography>
                {stage.services && (
                  <Typography variant="meta" component="p" sx={{ mt: 0.75 }}>
                    {stage.services}
                  </Typography>
                )}
                {stage.showProgress && <UploadBar value={uploadProgress} />}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {compact && (
        <Box aria-live="polite" sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="meta" component="p">
            Step {currentAt + 1} of {stages.length} ·{' '}
            {STATUS_LABEL[current.status]}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
            {current.title}
          </Typography>
          <Typography variant="body2" sx={{ color: t.ink60, mt: 0.5 }}>
            {current.note}
          </Typography>
          {current.showProgress && <UploadBar value={uploadProgress} />}
        </Box>
      )}
    </>
  );
}

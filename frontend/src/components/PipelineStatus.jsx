import { Box, LinearProgress, Typography } from '@mui/material';
import { STEP } from '../hooks/useMediaUpload';
import StatusDot from './StatusDot';
import Annotation from './Annotation';
import { srOnly } from '../lib/layout';
import { MONO, metaType, t } from '../lib/tokens';

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
    services: 'API Gateway · Lambda',
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
    services: 'S3 event · Lambda · DynamoDB',
    start: STEP.CHECKING,
    doneAt: STEP.DONE,
  },
  {
    key: 'result',
    title: 'Result',
    services: 'API Gateway · Lambda',
    start: STEP.DONE,
    doneAt: STEP.DONE,
  },
];

const STATUS_LABEL = { idle: 'Not started', active: 'In progress', done: 'Done', failed: 'Failed' };
const DOT = 9;

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
  if (mediaStatus.status === 'approved') return 'Approved. The preview is alongside.';
  if (mediaStatus.status === 'rejected') return `Rejected: ${mediaStatus.rejection_reason || 'no reason given'}.`;
  return `Unexpected status: ${mediaStatus.status}.`;
}

function dotColor(stage, status) {
  if (status === 'failed') return t.chartOrange;
  if (status === 'active') return t.chartAmber;
  if (status === 'done') return stage.key === 'result' ? t.chartOlive : t.chartInk;
  return undefined;
}

/**
 * Pipeline stages on a dotted rule (DESIGN.md §9): a dot plus a mono label per
 * stage, the current stage shown as an annotation chip. Horizontal from md up,
 * vertical on small screens.
 */
export default function PipelineStatus({ activeStep, failedAt, uploading, uploadProgress, statusLoading, mediaStatus }) {
  const context = { activeStep, failedAt, mediaStatus };

  return (
    <Box
      component="ol"
      aria-label="Upload progress"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(5, minmax(0, 1fr))' },
      }}
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
        const number = String(index + 1).padStart(2, '0');
        const current = status === 'active' || (status === 'failed' && stage.key !== 'result');
        const connectorColor = status === 'done' ? t.ink : t.rule;

        return (
          <Box
            component="li"
            key={stage.key}
            aria-current={status === 'active' ? 'step' : undefined}
            sx={{
              position: 'relative',
              display: 'grid',
              alignContent: 'start',
              gridTemplateColumns: { xs: `${DOT + 7}px minmax(0, 1fr)`, md: 'minmax(0, 1fr)' },
              columnGap: 1.5,
              pb: { xs: isLast ? 0 : 3.5, md: 0 },
              pr: { md: 3 },
              // Dotted rule to the next stage.
              '&::after': isLast
                ? undefined
                : {
                    content: '""',
                    position: 'absolute',
                    borderColor: connectorColor,
                    borderStyle: 'dotted',
                    borderWidth: 0,
                    // Vertical on xs, horizontal on md+.
                    left: { xs: (DOT + 7) / 2, md: DOT + 10 },
                    top: { xs: DOT + 14, md: (DOT + 7) / 2 },
                    bottom: { xs: 4, md: 'auto' },
                    right: { xs: 'auto', md: 10 },
                    borderLeftWidth: { xs: 1, md: 0 },
                    borderTopWidth: { xs: 0, md: 1 },
                  },
            }}
          >
            <Box sx={{ height: DOT + 7, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <StatusDot size={DOT} color={dotColor(stage, status)} hollow={status === 'idle'} pulse={status === 'active'} />
            </Box>

            <Box sx={{ minWidth: 0, mt: { xs: 0, md: 2 }, opacity: status === 'idle' ? 0.7 : 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 28, flexWrap: 'wrap' }}>
                {current ? (
                  <Annotation
                    dot={status === 'failed' ? t.chartOrange : t.chartAmber}
                    pulse={working}
                    leader={16}
                    side="top"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                  >
                    {number} · {stage.title}
                  </Annotation>
                ) : null}
                <Typography
                  component="span"
                  sx={{
                    ...metaType,
                    color: status === 'idle' ? t.ink42 : t.ink,
                    display: current ? { xs: 'inline', md: 'none' } : 'inline',
                  }}
                >
                  <Box component="span" sx={{ color: status === 'failed' ? t.orange : t.ink42, mr: 1 }}>
                    {number}
                  </Box>
                  {stage.title}
                </Typography>
                <Box component="span" sx={srOnly}>
                  {' '}— {STATUS_LABEL[status]}
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: t.ink60, mt: 1, fontSize: 13, lineHeight: '19px' }}>
                {note}
              </Typography>
              {stage.services && (
                <Typography variant="meta" component="p" sx={{ mt: 0.75, fontSize: 10, letterSpacing: '0.1em' }}>
                  {stage.services}
                </Typography>
              )}
              {showProgress && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    aria-label="Upload progress"
                    sx={{ flex: 1 }}
                  />
                  <Typography component="span" sx={{ fontFamily: MONO, fontSize: 11, color: t.ink60, minWidth: '4ch', textAlign: 'right' }}>
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

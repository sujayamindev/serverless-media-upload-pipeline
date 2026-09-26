import { Box, LinearProgress, Typography, useMediaQuery } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  FileIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { STEP } from '../hooks/useMediaUpload';
import { reducedMotion, t } from '../lib/tokens';

// `start`/`doneAt` are activeStep thresholds from useMediaUpload.
const STAGES = [
  { key: 'select', title: 'File chosen', Icon: FileIcon, start: STEP.SELECTED, doneAt: STEP.SELECTED },
  { key: 'permission', title: 'Upload permission', Icon: KeyIcon, start: STEP.PERMISSION, doneAt: STEP.UPLOADING },
  { key: 'upload', title: 'Upload to storage', Icon: CloudArrowUpIcon, start: STEP.UPLOADING, doneAt: STEP.UPLOADED },
  { key: 'check', title: 'Content check', Icon: MagnifyingGlassIcon, start: STEP.CHECKING, doneAt: STEP.DONE },
  { key: 'result', title: 'Result', Icon: CheckCircleIcon, start: STEP.DONE, doneAt: STEP.DONE },
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

// Same expanding ring as StatusDot's PENDING treatment (DESIGN.md §7).
const ring = keyframes`
  from { transform: scale(1); opacity: .9; }
  to { transform: scale(1.6); opacity: 0; }
`;

// Step icon in a circle, coloured by status with the chart palette (DESIGN.md §2.3):
// hollow when not started, amber outline in progress, filled when done or failed.
function StepIcon({ stage, size }) {
  const { status, working } = stage;
  const Icon = status === 'failed' ? WarningCircleIcon : stage.Icon;
  const fill = { done: stage.key === 'result' ? t.chartOlive : t.chartInk, failed: t.chartOrange }[status];
  const line = fill ?? (status === 'active' ? t.chartAmber : t.rule);
  return (
    <Box
      role="img"
      aria-label={`${stage.title}: ${STATUS_LABEL[status]}`}
      sx={{
        position: 'relative',
        zIndex: 1,
        width: size,
        height: size,
        mx: 'auto',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: `1px solid ${line}`,
        bgcolor: fill ?? t.card,
        color: fill ? t.card : status === 'active' ? t.chartAmber : t.ink42,
        ...(working && {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -1,
            borderRadius: '50%',
            border: `1px solid ${t.chartAmber}`,
            animation: `${ring} 1.8s var(--ease) infinite`,
          },
          [reducedMotion]: { '&::after': { animation: 'none', opacity: 0 } },
        }),
      }}
    >
      <Icon size={size * 0.5} />
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

// The stage to name under the compact row: a failure, else the one in progress,
// else the furthest one reached.
function currentIndex(stages) {
  const failed = stages.findIndex((s) => s.status === 'failed');
  if (failed !== -1) return failed;
  const active = stages.findIndex((s) => s.status === 'active');
  if (active !== -1) return active;
  return Math.max(stages.findLastIndex((s) => s.status !== 'idle'), 0);
}

// Horizontal stepper like the original: icons joined by a rail, titles below.
// Below md the titles are dropped and only the current stage is named.
export default function PipelineStatus({ activeStep, failedAt, uploading, uploadProgress, statusLoading, mediaStatus }) {
  const compact = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const context = { activeStep, failedAt, mediaStatus };
  const size = compact ? 28 : 32;

  const stages = STAGES.map((stage) => {
    const status = stageStatus(stage, context);
    return {
      ...stage,
      status,
      working:
        (stage.key === 'permission' && uploading && activeStep === STEP.PERMISSION) ||
        (stage.key === 'upload' && uploading && activeStep === STEP.UPLOADING) ||
        (stage.key === 'check' && statusLoading),
      showProgress: stage.key === 'upload' && status === 'active',
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
              // Rail to the next icon; solid once this stage is done.
              '&::after':
                index === stages.length - 1
                  ? undefined
                  : {
                      content: '""',
                      position: 'absolute',
                      top: size / 2,
                      left: `calc(50% + ${size / 2 + 6}px)`,
                      right: `calc(-50% + ${size / 2 + 6}px)`,
                      borderTop: `1px ${stage.status === 'done' ? `solid ${t.ink}` : `dotted ${t.rule}`}`,
                    },
            }}
          >
            <StepIcon stage={stage} size={size} />
            {!compact && (
              <Box sx={{ mt: 1, opacity: stage.status === 'idle' ? 0.6 : 1 }}>
                <Typography variant="subtitle2">{stage.title}</Typography>
                {stage.showProgress && <UploadBar value={uploadProgress} />}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {compact && (
        <Box aria-live="polite" sx={{ mt: 1.5, textAlign: 'center' }}>
          <Typography variant="meta" component="p">
            Step {currentAt + 1} of {stages.length} · {STATUS_LABEL[current.status]}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.25 }}>
            {current.title}
          </Typography>
          {current.showProgress && <UploadBar value={uploadProgress} />}
        </Box>
      )}
    </>
  );
}

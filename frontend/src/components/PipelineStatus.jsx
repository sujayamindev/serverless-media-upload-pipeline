import { Box, Typography, useMediaQuery } from '@mui/material';
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

// Upload progress drawn as the icon's outline: a faint full track with an amber arc
// filling clockwise from 12 o'clock.
function ProgressRing({ size, value }) {
  const stroke = 2;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      sx={{ position: 'absolute', inset: -1, width: size, height: size, transform: 'rotate(-90deg)' }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.rule} strokeWidth={1} />
      <Box
        component="circle"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={t.chartAmber}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value / 100)}
        sx={{ transition: 'stroke-dashoffset 200ms linear', [reducedMotion]: { transition: 'none' } }}
      />
    </Box>
  );
}

// Step icon in a circle, coloured by status with the chart palette (DESIGN.md §2.3):
// hollow when not started, amber outline in progress, filled when done or failed.
// With `progress` set, the outline becomes a progress ring.
function StepIcon({ stage, size, progress }) {
  const { status } = stage;
  const showRing = progress != null;
  const working = stage.working && !showRing;
  const Icon = status === 'failed' ? WarningCircleIcon : stage.Icon;
  const fill = { done: stage.key === 'result' ? t.chartOlive : t.chartInk, failed: t.chartOrange }[status];
  const line = fill ?? (status === 'active' ? t.chartAmber : t.rule);
  return (
    <Box
      {...(showRing
        ? { role: 'progressbar', 'aria-valuenow': progress, 'aria-valuemin': 0, 'aria-valuemax': 100 }
        : { role: 'img' })}
      aria-label={`${stage.title}: ${showRing ? `${progress}%` : STATUS_LABEL[status]}`}
      sx={{
        position: 'relative',
        zIndex: 1,
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: `1px solid ${showRing ? 'transparent' : line}`,
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
      {showRing && <ProgressRing size={size} value={progress} />}
      <Icon size={size * 0.5} />
    </Box>
  );
}

// Gap between an icon and the rail touching it.
const GAP = 6;

// Rail style for the segment after a stage: solid once that stage is done.
function rail(status) {
  return `1px ${status === 'done' ? `solid ${t.ink}` : `dotted ${t.rule}`}`;
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
      {/* One flex row. Each step is a block as wide as its title with the icon centred
          above it; the first block starts at the card's left edge and the last ends at
          its right edge. The rail runs icon to icon: half-rails inside each block reach
          the block edges, and a flexible rail fills the gap between blocks. */}
      <Box
        component="ol"
        aria-label="Upload progress"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'flex',
        }}
      >
        {stages.map((stage, index) => {
          const first = index === 0;
          const last = index === stages.length - 1;
          const railIn = !first && rail(stages[index - 1].status);
          const railOut = !last && rail(stage.status);
          const halfRail = { content: '""', position: 'absolute', top: size / 2 };
          return (
            <Box
              component="li"
              key={stage.key}
              aria-current={stage.status === 'active' ? 'step' : undefined}
              sx={{ display: 'flex', alignItems: 'flex-start', flex: first ? 'none' : 1, minWidth: 0 }}
            >
              {!first && (
                // Without titles the blocks are icon-width, so the gap comes from this rail's margin.
                <Box aria-hidden sx={{ flex: 1, mt: `${size / 2}px`, mx: compact ? `${GAP}px` : 0, borderTop: railIn }} />
              )}
              <Box
                sx={{
                  position: 'relative',
                  flex: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&::before': railIn ? { ...halfRail, left: 0, right: `calc(50% + ${size / 2 + GAP}px)`, borderTop: railIn } : undefined,
                  '&::after': railOut ? { ...halfRail, right: 0, left: `calc(50% + ${size / 2 + GAP}px)`, borderTop: railOut } : undefined,
                }}
              >
                <StepIcon stage={stage} size={size} progress={stage.showProgress ? uploadProgress : undefined} />
                {!compact && (
                  <Typography variant="subtitle2" sx={{ mt: 1, whiteSpace: 'nowrap', opacity: stage.status === 'idle' ? 0.6 : 1 }}>
                    {stage.title}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {compact && (
        <Box aria-live="polite" sx={{ mt: 1.5, textAlign: 'center' }}>
          <Typography variant="meta" component="p">
            Step {currentAt + 1} of {stages.length} · {current.showProgress ? `${uploadProgress}%` : STATUS_LABEL[current.status]}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.25 }}>
            {current.title}
          </Typography>
        </Box>
      )}
    </>
  );
}

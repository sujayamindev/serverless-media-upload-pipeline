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

// Gap between an icon and the rail touching it.
const GAP = 6;

// Rail style for the segment after a stage: solid once that stage is done.
function rail(status) {
  return `1px ${status === 'done' ? `solid ${t.ink}` : `dotted ${t.rule}`}`;
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
          pb: !compact && stages.some((s) => s.showProgress) ? '28px' : 0,
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
                <StepIcon stage={stage} size={size} />
                {!compact && (
                  <Box sx={{ position: 'relative', mt: 1, opacity: stage.status === 'idle' ? 0.6 : 1 }}>
                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                      {stage.title}
                    </Typography>
                    {stage.showProgress && (
                      <Box sx={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 140 }}>
                        <UploadBar value={uploadProgress} />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
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

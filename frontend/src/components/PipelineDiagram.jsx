import { Box } from '@mui/material';
import { MONO, t } from '../lib/tokens';

// Architecture diagram in the Antimetal chart language (DESIGN.md §9): thin
// grey lines, coloured data dots, dashed-orange annotation leaders.

const W = 1200;
const H = 500;

const N = {
  browser: { x: 90, y: 250, color: t.chartInk, r: 9, label: 'Browser', sub: 'React SPA' },
  api: { x: 340, y: 120, color: t.chartInk, r: 7, label: 'API Gateway', sub: 'Cognito JWT' },
  gen: { x: 600, y: 70, color: t.chartAmber, r: 7, label: 'λ generateUploadUrl', sub: 'Presigned POST' },
  status: { x: 600, y: 185, color: t.chartAmber, r: 7, label: 'λ getMediaStatus', sub: 'Owner check' },
  ddb: { x: 880, y: 125, color: t.chartOlive, r: 10, label: 'DynamoDB', sub: 'Status rows' },
  incoming: { x: 340, y: 385, color: t.chartInk, r: 7, label: 'S3 incoming/', sub: 'Direct upload' },
  validator: { x: 600, y: 385, color: t.chartAmber, r: 8, label: 'λ imageValidator', sub: 'Content check' },
  approved: { x: 880, y: 305, color: t.chartOlive, r: 7, label: 'S3 approved/', sub: 'Preview via GET' },
  rejected: { x: 880, y: 440, color: t.chartOrange, r: 7, label: 'S3 rejected/', sub: 'Kept for audit' },
  dlq: { x: 1110, y: 385, color: t.chartOrange, r: 5, label: 'SQS DLQ', sub: 'After 2 retries' },
};

const EDGES = [
  ['browser', 'api'],
  ['api', 'gen'],
  ['api', 'status'],
  ['gen', 'ddb'],
  ['status', 'ddb'],
  ['validator', 'ddb'],
  ['incoming', 'validator'],
  ['validator', 'approved'],
  ['validator', 'rejected'],
  ['status', 'approved', 'dotted'],
  ['validator', 'dlq', 'dashed'],
];

const STEPS = [
  { n: '01', between: ['browser', 'api'], dx: -26, dy: -12 },
  { n: '02', between: ['browser', 'incoming'], dx: -30, dy: 16 },
  { n: '03', between: ['incoming', 'validator'], dx: -8, dy: -12 },
  { n: '04', between: ['status', 'approved'], dx: 14, dy: -8 },
];

const NOTES = [
  { text: 'File bytes skip the backend', at: 'mid:browser:incoming', x: 40, y: 470 },
  { text: 'Magic bytes · Pillow · OpenCV', at: 'validator', x: 380, y: 270 },
  { text: 'Policy expires in 300 s', at: 'gen', x: 700, y: 26 },
];

const mid = (a, b) => ({ x: (N[a].x + N[b].x) / 2, y: (N[a].y + N[b].y) / 2 });
const point = (ref) => {
  if (ref.startsWith('mid:')) {
    const [, a, b] = ref.split(':');
    return mid(a, b);
  }
  return N[ref];
};

// Uppercase everything except λ (which would become Λ).
const upper = (s) => s.replace(/[^λ]+/g, (m) => m.toUpperCase());

const CHAR = 7.1; // Geist Mono 10px plus 1px tracking.

function Note({ text, at, x, y }) {
  const width = text.length * CHAR + 34;
  const target = point(at);
  // Leader from the nearest edge of the chip to the annotated point.
  const lx = target.x < x ? x : target.x > x + width ? x + width : target.x;
  const ly = target.y < y ? y - 13 : y + 13;
  return (
    <g>
      <line x1={lx} y1={ly} x2={target.x} y2={target.y} style={{ stroke: 'var(--chart-orange)', strokeWidth: 1, strokeDasharray: '3 3' }} />
      <g filter="url(#note-shadow)">
        <rect x={x} y={y - 13} width={width} height={26} rx={4} style={{ fill: 'var(--color-card)' }} />
      </g>
      <circle cx={x + 14} cy={y} r={3.5} style={{ fill: 'var(--chart-orange)' }} />
      <text x={x + 25} y={y + 3.5} style={{ fill: 'var(--ink)', fontSize: 10, letterSpacing: 1 }}>
        {upper(text)}
      </text>
    </g>
  );
}

export default function PipelineDiagram() {
  return (
    <Box
      component="figure"
      sx={{ m: 0 }}
    >
      <Box
        tabIndex={0}
        role="region"
        aria-label="Architecture diagram (scrolls horizontally on small screens)"
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          '&:focus-visible': { outline: `1px solid ${t.ink}`, outlineOffset: 4 },
        }}
      >
        <Box
          component="svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="diagram-title diagram-desc"
          sx={{ display: 'block', width: '100%', minWidth: 880, height: 'auto', fontFamily: MONO, overflow: 'visible' }}
        >
          <title id="diagram-title">How an upload moves through the pipeline</title>
          <desc id="diagram-desc">
            The browser asks API Gateway for a presigned POST from the generateUploadUrl Lambda, which writes a pending
            row to DynamoDB. The browser then uploads directly to the S3 incoming prefix. An S3 event runs the
            imageValidator Lambda, which moves the file to approved or rejected and updates DynamoDB; failed runs go to
            an SQS dead-letter queue. The browser polls getMediaStatus, which reads DynamoDB and returns a presigned GET
            link for approved files.
          </desc>
          <defs>
            <filter id="note-shadow" x="-20%" y="-60%" width="140%" height="260%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.16" />
            </filter>
          </defs>

          {EDGES.map(([a, b, style]) => (
            <line
              key={`${a}-${b}`}
              x1={N[a].x}
              y1={N[a].y}
              x2={N[b].x}
              y2={N[b].y}
              style={{
                stroke: 'var(--rule)',
                strokeWidth: 1,
                strokeDasharray: style === 'dashed' ? '5 4' : style === 'dotted' ? '1 4' : undefined,
                strokeLinecap: 'round',
              }}
            />
          ))}
          {/* The direct upload is the one path drawn in ink. */}
          <line
            x1={N.browser.x}
            y1={N.browser.y}
            x2={N.incoming.x}
            y2={N.incoming.y}
            style={{ stroke: 'var(--ink)', strokeWidth: 1.25 }}
          />

          {STEPS.map(({ n, between: [a, b], dx, dy }) => {
            const m = mid(a, b);
            return (
              <text key={n} x={m.x + dx} y={m.y + dy} style={{ fill: 'var(--orange)', fontSize: 11, letterSpacing: 0.66 }}>
                {n}
              </text>
            );
          })}

          {Object.entries(N).map(([key, n]) => (
            <g key={key}>
              <circle cx={n.x} cy={n.y} r={n.r} style={{ fill: n.color }} />
              <text x={n.x} y={n.y + n.r + 20} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 11, letterSpacing: 0.66 }}>
                {upper(n.label)}
              </text>
              <text x={n.x} y={n.y + n.r + 35} textAnchor="middle" style={{ fill: 'var(--ink-42)', fontSize: 10, letterSpacing: 1 }}>
                {upper(n.sub)}
              </text>
            </g>
          ))}

          {/* Hollow ring on the validator, as in the hero chart. */}
          <circle cx={N.validator.x} cy={N.validator.y} r={18} style={{ fill: 'none', stroke: 'var(--chart-orange)', strokeWidth: 2, opacity: 0.6 }} />

          {NOTES.map((note) => (
            <Note key={note.text} {...note} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { reducedMotion, t } from '../lib/tokens';
import Annotation from './Annotation';

// Static radial "burst" (DESIGN.md §5): thin grey rays from a common centre,
// each ending in a dot from the chart palette. Generated once from a seeded
// PRNG so it renders identically every time.

const SIZE = 520;
const C = SIZE / 2;
const PALETTE = [t.chartOrange, t.chartAmber, t.chartOlive, t.chartInk];

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBurst(seed, rays) {
  const rand = mulberry32(seed);
  const lines = [];
  for (let i = 0; i < rays; i += 1) {
    const angle = (i / rays) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    const length = 70 + rand() * 170;
    // Rays start slightly off-centre, like the reference, so the core isn't a solid knot.
    const ox = C + (rand() - 0.5) * 34;
    const oy = C + (rand() - 0.5) * 34;
    const x = C + Math.cos(angle) * length;
    const y = C + Math.sin(angle) * length;
    const big = rand() > 0.86;
    lines.push({
      x1: ox,
      y1: oy,
      x2: x,
      y2: y,
      r: big ? 8 + rand() * 7 : 2.5 + rand() * 5,
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
      // A few rays stop short of their dot, as on the reference.
      mid: rand() > 0.82 ? { x: C + Math.cos(angle) * length * 0.55, y: C + Math.sin(angle) * length * 0.55, r: 1.5 + rand() * 2.5, color: PALETTE[Math.floor(rand() * PALETTE.length)] } : null,
    });
  }
  const specks = Array.from({ length: 14 }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = 60 + rand() * 200;
    return { x: C + Math.cos(angle) * dist, y: C + Math.sin(angle) * dist, r: 0.8 + rand() * 1.2 };
  });
  return { lines, specks };
}

const drift = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const BURSTS = {};
function getBurst(seed, rays) {
  const key = `${seed}:${rays}`;
  BURSTS[key] ??= buildBurst(seed, rays);
  return BURSTS[key];
}

/**
 * `annotation` (optional) renders a floating data chip on the right edge,
 * joined to a dot by a dashed orange leader.
 */
export default function BurstIllustration({ seed = 7, rays = 88, annotation, sx }) {
  const { lines, specks } = getBurst(seed, rays);
  const target = lines.reduce((best, line) => (line.x2 > best.x2 && line.y2 > C ? line : best), lines[0]);

  return (
    <Box aria-hidden sx={[{ position: 'relative', width: '100%', maxWidth: SIZE, aspectRatio: '1 / 1' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        component="svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        sx={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <Box
          component="g"
          sx={{
            transformOrigin: `${C}px ${C}px`,
            animation: `${drift} 480s linear infinite`,
            [reducedMotion]: { animation: 'none' },
          }}
        >
          {lines.map((l, i) => (
            <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} style={{ stroke: 'var(--rule)', strokeWidth: 0.7 }} />
          ))}
          {specks.map((s, i) => (
            <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} style={{ fill: 'var(--chart-ink)' }} />
          ))}
          {lines.map((l, i) =>
            l.mid ? <circle key={`m${i}`} cx={l.mid.x} cy={l.mid.y} r={l.mid.r} style={{ fill: l.mid.color }} /> : null,
          )}
          {lines.map((l, i) => (
            <circle key={`d${i}`} cx={l.x2} cy={l.y2} r={l.r} style={{ fill: l.color }} />
          ))}
          {/* Hollow rings, as in the reference hero. */}
          <circle cx={C - 10} cy={C - 55} r={17} style={{ fill: 'none', stroke: 'var(--chart-orange)', strokeWidth: 2.5, opacity: 0.8 }} />
          <circle cx={C - 140} cy={C + 88} r={20} style={{ fill: 'none', stroke: 'var(--chart-orange)', strokeWidth: 2.5, opacity: 0.35 }} />
        </Box>
        {annotation && (
          <line
            x1={target.x2}
            y1={target.y2}
            x2={SIZE - 10}
            y2={target.y2 - 50}
            style={{ stroke: 'var(--chart-orange)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
        )}
      </Box>
      {annotation && (
        <Annotation
          dot={t.chartOlive}
          sx={{
            position: 'absolute',
            left: `${((SIZE - 10) / SIZE) * 100}%`,
            top: `${((target.y2 - 50) / SIZE) * 100}%`,
            transform: 'translateY(-50%)',
          }}
        >
          {annotation}
        </Annotation>
      )}
    </Box>
  );
}

// Small dotted mark: a rising staircase of dots, like a bar chart drawn in data points.
const DOTS = [
  [2, 13],
  [6, 13],
  [6, 9],
  [10, 13],
  [10, 9],
  [10, 5],
  [14, 13],
  [14, 9],
  [14, 5],
  [14, 1],
];

export default function BrandMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 15" fill="currentColor" aria-hidden="true">
      {DOTS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 1 ? 1.1 : 1.35} />
      ))}
    </svg>
  );
}

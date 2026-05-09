import './ProgressBar.css';

interface Props {
  value: number;
  max: number;
  label?: string;
  color?: string;
}

export default function ProgressBar({ value, max, label, color }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="progress-bar-wrapper">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color ?? 'var(--color-accent)' }}
        />
      </div>
      <span className="progress-pct">{pct}%</span>
    </div>
  );
}

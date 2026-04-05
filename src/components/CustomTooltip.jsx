import { fmt } from '../utils/helpers';

export default function CustomTooltip({ active, payload, label, bg, border, muted }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}>
      <p style={{ color: muted, fontWeight: 600, margin: '0 0 6px' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '3px 0', fontWeight: 700 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}
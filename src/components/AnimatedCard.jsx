import useCountUp from '../hooks/useCountUp';

export default function AnimatedCard({ label, value, sub, icon, gradient, badge, delay = 0 }) {
  const num = useCountUp(value);
  return (
    <div
      style={{
        background: gradient, borderRadius: 20, padding: '22px 24px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,.25)',
        animation: `fadeUp .4s ease ${delay}s both`,
        cursor: 'default', transition: 'transform .2s, box-shadow .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.25)'; }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 72, opacity: .1 }}>{icon}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
        ₹{Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{sub}</span>
        {badge && (
          <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 600 }}>{badge}</span>
        )}
      </div>
    </div>
  );
}
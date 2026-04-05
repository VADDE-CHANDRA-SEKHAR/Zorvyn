import Skeleton from './Skeleton';

export default function LoadingScreen({ C }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,.3)', animation: 'pulse 1.2s infinite' }} />
        <Skeleton w={160} h={18} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            <Skeleton w="60%" h={11} style={{ marginBottom: 16 }} />
            <Skeleton w="80%" h={28} style={{ marginBottom: 12 }} />
            <Skeleton w="50%" h={11} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
          <Skeleton w="40%" h={16} style={{ marginBottom: 8 }} />
          <Skeleton w="60%" h={11} style={{ marginBottom: 24 }} />
          <Skeleton w="100%" h={200} r={12} />
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
          <Skeleton w="70%" h={16} style={{ marginBottom: 24 }} />
          <Skeleton w="100%" h={110} r={999} style={{ marginBottom: 16 }} />
          {[0,1,2,3,4,5].map(i => <Skeleton key={i} w="100%" h={10} style={{ marginBottom: 10 }} />)}
        </div>
      </div>
    </div>
  );
}
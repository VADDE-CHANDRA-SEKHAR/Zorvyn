export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      padding: '12px 18px', borderRadius: 14, fontWeight: 600, fontSize: 13,
      background: toast.type === 'error' ? 'rgba(239,68,68,.95)' : 'rgba(34,197,94,.95)',
      color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      animation: 'toastIn .3s ease',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {toast.type === 'error' ? '🗑' : '✓'} {toast.msg}
    </div>
  );
}
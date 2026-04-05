import { CAT_META } from '../constants/categories';
import { fmtDate, fmt } from '../utils/helpers';

export default function TxTable({ rows, isAdmin, C, onEdit, onDelete }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.thBg }}>
          {['Date', 'Description', 'Category', 'Type', 'Amount (₹)', ...(isAdmin ? [''] : [])].map(h => (
            <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(t => (
          <tr key={t.id} className="rh" style={{ borderBottom: `1px solid ${C.border}` }}>
            <td style={{ padding: '13px 20px', color: C.muted, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
            <td style={{ padding: '13px 20px', fontWeight: 600, color: C.text }}>{t.description}</td>
            <td style={{ padding: '13px 20px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: (CAT_META[t.category]?.color || '#94a3b8') + '28', color: CAT_META[t.category]?.color || '#94a3b8' }}>
                {CAT_META[t.category]?.icon} {t.category}
              </span>
            </td>
            <td style={{ padding: '13px 20px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: t.type === 'income' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.12)', color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
                {t.type === 'income' ? '▲' : '▼'} {t.type}
              </span>
            </td>
            <td style={{ padding: '13px 20px', fontWeight: 800, fontSize: 14, color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
              {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
            </td>
            {isAdmin && (
              <td style={{ padding: '13px 20px' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => onEdit(t)} className="bh" style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>Edit</button>
                  <button onClick={() => onDelete(t.id)} className="bh" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>Delete</button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
import { useState } from 'react';
import { INCOME_CATS, EXPENSE_CATS } from '../constants/categories';

export default function Modal({ tx, onSave, onClose, C }) {
  const [f, setF] = useState(tx || { date: '', description: '', category: 'Food', amount: '', type: 'expense' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.6)', animation: 'fadeIn .2s ease' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,.5)', animation: 'slideUp .25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{tx ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button onClick={onClose} style={{ background: C.inpBg, border: `1px solid ${C.border}`, color: C.text, width: 32, height: 32, borderRadius: 99, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        {[['description','text','Description','e.g. Grocery Shopping'],['amount','number','Amount (₹)','0'],['date','date','Date','']].map(([k,t,l,p]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</label>
            <input type={t} placeholder={p} value={f[k]} onChange={e => set(k, e.target.value)}
              style={{ width: '100%', background: C.inpBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            ['type','Type',[['income','Income'],['expense','Expense']]],
            ['category','Category',(f.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => [c, c])],
          ].map(([k, l, opts]) => (
            <div key={k}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</label>
              <select value={f[k]} onChange={e => { set(k, e.target.value); if (k === 'type') set('category', e.target.value === 'income' ? 'Salary' : 'Food'); }}
                style={{ width: '100%', background: C.inpBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none' }}>
                {opts.map(([v, lb]) => <option key={v} value={v} style={{ background: C.card }}>{lb}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button
            onClick={() => { if (!f.date || !f.description || !f.amount) return; onSave({ ...f, amount: parseFloat(f.amount), id: tx?.id || Date.now() }); }}
            style={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(99,102,241,.4)' }}>
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
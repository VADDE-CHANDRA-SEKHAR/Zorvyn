import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { INIT_TXS }            from './data/transactions';
import { ALL_CATS, CAT_META }  from './constants/categories';
import { getDarkTheme, getLightTheme } from './theme/colors';
import { fmt, fmtDate, monthLabel }    from './utils/helpers';
import AnimatedCard   from './components/AnimatedCard';
import Modal          from './components/Modal';
import Toast          from './components/Toast';
import LoadingScreen  from './components/LoadingScreen';
import TxTable        from './components/TxTable';
import CustomTooltip  from './components/CustomTooltip';

export default function App() {
  const [txs, setTxs]             = useState(INIT_TXS);
  const [role, setRole]           = useState('viewer');
  const [tab, setTab]             = useState('dashboard');
  const [dark, setDark]           = useState(true);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy]       = useState('date_desc');
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');
  const [groupByMonth, setGroupByMonth] = useState(false);
  const [modal, setModal]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [toast, setToast]         = useState(null);
  const isAdmin = role === 'admin';

  const C = dark ? getDarkTheme() : getLightTheme();

  // Mock API + localStorage persistence
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setApiStatus('connecting');
      await new Promise(r => setTimeout(r, 1600));
      try {
        const saved = localStorage.getItem('zorvyn_txs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setTxs(parsed);
        }
        setApiStatus('live');
      } catch {
        setApiStatus('live');
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem('zorvyn_txs', JSON.stringify(txs));
  }, [txs, loading]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const card = (extra = {}) => ({
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 20, padding: 24, boxShadow: C.shadow, ...extra,
  });
  const inp = () => ({
    background: C.inpBg, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none',
  });
  const tt = ({ active, payload, label }) => (
    <CustomTooltip active={active} payload={payload} label={label} bg={C.tooltipBg} border={C.border} muted={C.muted} />
  );

  const income  = useMemo(() => txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [txs]);
  const expense = useMemo(() => txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [txs]);
  const balance = income - expense;

  const monthlyData = useMemo(() => {
    const m = {};
    txs.forEach(t => {
      const k = t.date.slice(0, 7);
      if (!m[k]) m[k] = { inc: 0, exp: 0 };
      t.type === 'income' ? m[k].inc += t.amount : m[k].exp += t.amount;
    });
    return Object.entries(m).sort().map(([k, v]) => ({
      month: new Date(k + '-02').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      Income: v.inc, Expenses: v.exp, Net: +(v.inc - v.exp).toFixed(0),
    }));
  }, [txs]);

  const catData = useMemo(() => {
    const c = {};
    txs.filter(t => t.type === 'expense').forEach(t => { c[t.category] = (c[t.category] || 0) + t.amount; });
    return Object.entries(c)
      .map(([name, value]) => ({ name, value, pct: ((value / expense) * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value);
  }, [txs, expense]);

  const filtered = useMemo(() => {
    let r = txs.filter(t => {
      const ms = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
      return ms && (filterCat === 'All' || t.category === filterCat) && (filterType === 'All' || t.type === filterType) && (!fromDate || t.date >= fromDate) && (!toDate || t.date <= toDate);
    });
    const [field, dir] = sortBy.split('_');
    r.sort((a, b) => { const av = field === 'amount' ? a.amount : a[field], bv = field === 'amount' ? b.amount : b[field]; return dir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1); });
    return r;
  }, [txs, search, filterCat, filterType, sortBy, fromDate, toDate]);

  const groupedTxs = useMemo(() => {
    if (!groupByMonth) return null;
    const groups = {};
    filtered.forEach(t => { const k = t.date.slice(0, 7); if (!groups[k]) groups[k] = []; groups[k].push(t); });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, groupByMonth]);

  const savingsRate   = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
  const avgMonthExp   = monthlyData.length > 0 ? (expense / monthlyData.length).toFixed(0) : 0;
  const last2         = monthlyData.slice(-2);
  const avgNet        = (monthlyData.reduce((s, m) => s + m.Net, 0) / Math.max(1, monthlyData.length)).toFixed(0);
  const topCat        = catData.length > 0 ? catData[0] : null;

  const saveTx = tx => { setTxs(p => p.find(t => t.id === tx.id) ? p.map(t => t.id === tx.id ? tx : t) : [...p, tx]); setModal(null); showToast(tx.id ? 'Transaction updated!' : 'Transaction added!'); };
  const delTx  = id  => { setTxs(p => p.filter(t => t.id !== id)); showToast('Transaction deleted.', 'error'); };

  const exportCSV = () => {
    const rows = [['Date','Description','Category','Type','Amount (₹)'], ...filtered.map(t => [t.date, t.description, t.category, t.type, t.amount])];
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n')); a.download = 'zorvyn.csv'; a.click();
    showToast(`Exported ${filtered.length} transactions as CSV`);
  };
  const exportJSON = () => {
    const a = document.createElement('a'); a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2)); a.download = 'zorvyn.json'; a.click();
    showToast(`Exported ${filtered.length} transactions as JSON`);
  };
  const clearFilters = () => { setSearch(''); setFilterCat('All'); setFilterType('All'); setFromDate(''); setToDate(''); setSortBy('date_desc'); };

  const tabs = [{ id: 'dashboard', l: 'Dashboard', i: '▦' }, { id: 'transactions', l: 'Transactions', i: '≡' }, { id: 'insights', l: 'Insights', i: '✦' }];

  return (
    <div style={{ minHeight: '100vh', background: C.root, color: C.text, fontFamily: "'Inter',system-ui,sans-serif", transition: 'background .3s,color .3s' }}>
      <style>{`select option{background:${dark?'#1a1d2e':'#fff'}}`}</style>

      {/* HEADER */}
      <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: dark ? '0 2px 16px rgba(0,0,0,.5)' : '0 2px 8px rgba(0,0,0,.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 13, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,.5)' }}>Z</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>Zorvyn</span>
            <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'rgba(99,102,241,.18)', color: '#a5b4fc', fontWeight: 600 }}>Finance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, padding: '3px 10px', borderRadius: 99, background: apiStatus === 'live' ? 'rgba(34,197,94,.12)' : 'rgba(251,191,36,.12)', border: `1px solid ${apiStatus === 'live' ? 'rgba(34,197,94,.3)' : 'rgba(251,191,36,.3)'}` }}>
            {apiStatus === 'connecting'
              ? <div style={{ width: 7, height: 7, borderRadius: 99, border: '2px solid #fbbf24', borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} />
              : <div style={{ width: 7, height: 7, borderRadius: 99, background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />}
            <span style={{ fontSize: 10, fontWeight: 700, color: apiStatus === 'live' ? '#4ade80' : '#fbbf24', letterSpacing: '0.06em' }}>{apiStatus === 'connecting' ? 'CONNECTING…' : 'API LIVE'}</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="bh"
              style={{ padding: '8px 18px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s', background: tab === t.id ? C.pillActiveBg : C.pillInactiveBg, color: tab === t.id ? '#fff' : C.pillInactiveText, boxShadow: tab === t.id ? '0 4px 16px rgba(99,102,241,.4)' : 'none' }}>
              {t.i} {t.l}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setDark(!dark)} className="bh" style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.border}`, background: C.inpBg, cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <div style={{ fontSize: 11, padding: '5px 13px', borderRadius: 99, fontWeight: 700, background: isAdmin ? 'rgba(99,102,241,.18)' : C.inpBg, color: isAdmin ? '#a5b4fc' : C.muted, border: isAdmin ? '1px solid rgba(99,102,241,.35)' : `1px solid ${C.border}` }}>
            {isAdmin ? '⚙ ADMIN' : '👁 VIEWER'}
          </div>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp(), padding: '7px 12px', fontSize: 12, fontWeight: 600 }}>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </header>

      {loading ? <LoadingScreen C={C} /> : (
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 20px', display: 'flex', flexDirection: 'column', gap: 22 }} className="fu" key={tab + dark}>

          {/* DASHBOARD */}
          {tab === 'dashboard' && <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <AnimatedCard label="Net Balance"    value={balance} sub="Total portfolio"   icon="💰" gradient="linear-gradient(135deg,#667eea,#764ba2)" badge={balance >= 0 ? '▲ Positive' : '▼ Negative'} delay={0} />
              <AnimatedCard label="Total Income"   value={income}  sub={`${txs.filter(t => t.type === 'income').length} transactions`}  icon="📈" gradient="linear-gradient(135deg,#11998e,#38ef7d)" delay={0.07} />
              <AnimatedCard label="Total Expenses" value={expense} sub={`${txs.filter(t => t.type === 'expense').length} transactions`} icon="📉" gradient="linear-gradient(135deg,#f093fb,#f5576c)" delay={0.14} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 16 }}>
              <div style={card()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Income vs Expenses</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>Monthly (Apr 2025 – Mar 2026)</p>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 600 }}>
                    {[['#4ade80','Income'],['#f87171','Expenses'],['#818cf8','Net']].map(([c,l]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      {[['ai','#4ade80'],['ae','#f87171'],['an','#818cf8']].map(([id,c]) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c} stopOpacity={dark ? .25 : .15} />
                          <stop offset="95%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={tt} />
                    <Area type="monotone" dataKey="Income"   stroke="#4ade80" fill="url(#ai)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="Expenses" stroke="#f87171" fill="url(#ae)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="Net"      stroke="#818cf8" fill="url(#an)" strokeWidth={2} strokeDasharray="5 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={card()}>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Spending Breakdown</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.muted }}>By category</p>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {catData.map(e => <Cell key={e.name} fill={CAT_META[e.name]?.color || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip content={tt} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                  {catData.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, width: 18, textAlign: 'center', flexShrink: 0 }}>{CAT_META[c.name]?.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{c.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{c.pct}%</span>
                        </div>
                        <div style={{ height: 3, background: C.progressBg, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 99, background: CAT_META[c.name]?.color, width: `${c.pct}%`, transition: 'width 1.1s ease' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={card()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Monthly Net Savings</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>Green = surplus · Red = deficit</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>Avg {fmt(avgNet)}/mo</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={tt} />
                  <Bar dataKey="Net" radius={[6,6,0,0]}>
                    {monthlyData.map((e, i) => <Cell key={i} fill={e.Net >= 0 ? '#4ade80' : '#f87171'} fillOpacity={0.88} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>}

          {/* TRANSACTIONS */}
          {tab === 'transactions' && <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Transactions</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>Showing {filtered.length} of {txs.length} records</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => setGroupByMonth(!groupByMonth)} className="bh" style={{ padding: '8px 14px', borderRadius: 12, border: `1px solid ${groupByMonth ? '#6366f1' : C.border}`, background: groupByMonth ? 'rgba(99,102,241,.15)' : C.inpBg, color: groupByMonth ? '#818cf8' : C.muted, fontSize: 12, fontWeight: 600 }}>
                  {groupByMonth ? '✓ Grouped' : '⊞ Group by Month'}
                </button>
                {(search || filterCat !== 'All' || filterType !== 'All' || fromDate || toDate) && (
                  <button onClick={clearFilters} className="bh" style={{ padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.1)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>✕ Clear</button>
                )}
                <button onClick={exportCSV}  className="bh" style={{ padding: '9px 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.inpBg, color: C.muted, fontSize: 12, fontWeight: 600 }}>⬇ CSV</button>
                <button onClick={exportJSON} className="bh" style={{ padding: '9px 14px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.inpBg, color: C.muted, fontSize: 12, fontWeight: 600 }}>⬇ JSON</button>
                {isAdmin && <button onClick={() => setModal('add')} className="bh" style={{ padding: '9px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 14px rgba(99,102,241,.4)' }}>+ Add</button>}
              </div>
            </div>
            <div style={card({ padding: 16 })}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: .4, fontSize: 13 }}>🔍</span>
                  <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp(), width: '100%', paddingLeft: 34 }} />
                </div>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inp(), minWidth: 130 }}>{['All',...ALL_CATS].map(o=><option key={o}>{o === 'All' ? 'All Categories' : o}</option>)}</select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inp(), minWidth: 110 }}>{['All','income','expense'].map(o=><option key={o}>{o === 'All' ? 'All Types' : o}</option>)}</select>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ ...inp(), minWidth: 130 }} />
                <input type="date" value={toDate}   onChange={e => setToDate(e.target.value)}   style={{ ...inp(), minWidth: 130 }} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inp(), minWidth: 120 }}>
                  {[['date_desc','Date ↓'],['date_asc','Date ↑'],['amount_desc','Amount ↓'],['amount_asc','Amount ↑']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={card({ padding: 0, overflow: 'hidden' })}>
              {filtered.length === 0
                ? <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <div style={{ color: C.muted, fontSize: 14 }}>No transactions found.</div>
                    <button onClick={clearFilters} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.inpBg, color: C.muted, cursor: 'pointer', fontSize: 13 }}>Clear Filters</button>
                  </div>
                : groupByMonth && groupedTxs
                  ? <div style={{ overflowX: 'auto' }}>
                      {groupedTxs.map(([key, rows]) => {
                        const mInc = rows.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
                        const mExp = rows.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
                        return (
                          <div key={key}>
                            <div style={{ padding: '10px 20px', background: C.groupHeader, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{monthLabel(key + '-01')}</span>
                              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                <span style={{ color: '#4ade80', fontWeight: 600 }}>+{fmt(mInc)}</span>
                                <span style={{ color: '#f87171', fontWeight: 600 }}>-{fmt(mExp)}</span>
                                <span style={{ color: '#818cf8', fontWeight: 700 }}>Net {fmt(mInc - mExp)}</span>
                              </div>
                            </div>
                            <TxTable rows={rows} isAdmin={isAdmin} C={C} onEdit={setModal} onDelete={delTx} />
                          </div>
                        );
                      })}
                    </div>
                  : <div style={{ overflowX: 'auto' }}><TxTable rows={filtered} isAdmin={isAdmin} C={C} onEdit={setModal} onDelete={delTx} /></div>
              }
            </div>
          </>}

          {/* INSIGHTS */}
          {tab === 'insights' && <>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Insights</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>Patterns & observations · Apr 2025 – Mar 2026</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[
                { label: 'Savings Rate',      val: `${savingsRate}%`, sub: 'of income retained',   icon: '💎', col: '#818cf8', bar: Math.min(100, Math.max(0, savingsRate)) },
                { label: 'Top Expense',       val: topCat?.name || '—', sub: topCat ? fmt(topCat.value) : '', icon: CAT_META[topCat?.name]?.icon || '📊', col: CAT_META[topCat?.name]?.color || '#94a3b8', bar: null },
                { label: 'Avg Monthly Spend', val: fmt(avgMonthExp), sub: `across ${monthlyData.length} months`, icon: '📅', col: '#f87171', bar: null },
                { label: 'MoM Change', val: last2.length === 2 ? `${last2[1].Expenses <= last2[0].Expenses ? '▼' : '▲'} ${fmt(Math.abs(last2[1].Expenses - last2[0].Expenses))}` : '—', sub: last2.length === 2 ? `${last2[0].month} → ${last2[1].month}` : '', icon: '📊', col: last2.length === 2 && last2[1].Expenses <= last2[0].Expenses ? '#4ade80' : '#f87171', bar: null },
              ].map((item, idx) => (
                <div key={item.label} style={{ ...card({ position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'transform .2s, box-shadow .2s', animation: `fadeUp .35s ${idx * 0.07}s ease both` }) }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = C.shadow; }}>
                  <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 56, opacity: C.iconOp }}>{item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: item.col, marginBottom: 4 }}>{item.val}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{item.sub}</div>
                  {item.bar !== null && <div style={{ marginTop: 12, height: 5, background: C.progressBg, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: item.col, borderRadius: 99, width: `${item.bar}%`, transition: 'width 1.3s ease' }} />
                  </div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={card()}>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Category Spend Comparison</h3>
                <p style={{ margin: '0 0 18px', fontSize: 12, color: C.muted }}>Total spending per category (₹)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={catData} layout="vertical" margin={{ left: 10, right: 24, top: 0, bottom: 0 }} barCategoryGap="25%">
                    <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} width={95} />
                    <Tooltip content={tt} />
                    <Bar dataKey="value" radius={[0,6,6,0]}>{catData.map(e => <Cell key={e.name} fill={CAT_META[e.name]?.color || '#94a3b8'} fillOpacity={0.85} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={card()}>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>💡 Key Observations</h3>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: C.muted }}>Derived from your data</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[
                    { icon: '💰', text: `Savings rate is ${savingsRate}% — ${parseFloat(savingsRate) >= 20 ? 'exceeding the 20% target. Excellent!' : 'below the 20% target. Trim discretionary spend.'}`, col: parseFloat(savingsRate) >= 20 ? '#4ade80' : '#f87171' },
                    topCat && { icon: CAT_META[topCat.name]?.icon || '📊', text: `${topCat.name} is your top expense at ${fmt(topCat.value)} (${topCat.pct}% of total).`, col: CAT_META[topCat.name]?.color || '#94a3b8' },
                    last2.length === 2 && { icon: '📆', text: `Spending ${last2[1].Expenses <= last2[0].Expenses ? 'dropped by' : 'rose by'} ${fmt(Math.abs(last2[1].Expenses - last2[0].Expenses))} from ${last2[0].month} to ${last2[1].month}.`, col: last2[1].Expenses <= last2[0].Expenses ? '#4ade80' : '#f87171' },
                    { icon: '📊', text: `Avg monthly net savings: ${fmt(avgNet)} across ${monthlyData.length} months.`, col: '#818cf8' },
                    { icon: '🗂', text: `${txs.length} total transactions — ${txs.filter(t=>t.type==='income').length} income & ${txs.filter(t=>t.type==='expense').length} expense entries.`, col: '#38bdf8' },
                  ].filter(Boolean).map((obs, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 14px', borderRadius: 12, background: C.obsBg, border: `1px solid ${C.border}`, animation: `fadeUp .3s ${i * 0.06}s ease both` }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{obs.icon}</span>
                      <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{obs.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>}
        </main>
      )}

      <Toast toast={toast} />
      {modal && isAdmin && <Modal tx={modal === 'add' ? null : modal} onSave={saveTx} onClose={() => setModal(null)} C={C} />}
    </div>
  );
}
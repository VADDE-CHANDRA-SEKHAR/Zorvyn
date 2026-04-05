export const fmt = n =>
  `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const fmtDate = d =>
  new Date(d + 'T00:00').toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

export const monthLabel = d =>
  new Date(d + 'T00:00').toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  });
export const EXPENSE_CATS = ['Food','Transport','Entertainment','Shopping','Utilities','Health'];
export const INCOME_CATS  = ['Salary','Freelance'];
export const ALL_CATS     = [...INCOME_CATS, ...EXPENSE_CATS];

export const CAT_META = {
  Food:          { color: '#f97316', icon: '🍔' },
  Transport:     { color: '#3b82f6', icon: '🚗' },
  Entertainment: { color: '#a855f7', icon: '🎬' },
  Shopping:      { color: '#ec4899', icon: '🛍️' },
  Utilities:     { color: '#14b8a6', icon: '⚡' },
  Health:        { color: '#ef4444', icon: '❤️' },
  Salary:        { color: '#22c55e', icon: '💼' },
  Freelance:     { color: '#84cc16', icon: '💻' },
};
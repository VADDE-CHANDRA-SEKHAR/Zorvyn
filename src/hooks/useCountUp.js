import { useState, useEffect } from 'react';

export default function useCountUp(target) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0, raf;
    const step = target / 55;
    const tick = () => {
      cur = Math.min(cur + step, target);
      setV(cur);
      if (cur < target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
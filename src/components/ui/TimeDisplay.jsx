import { useEffect, useState } from 'react';

export default function TimeDisplay({ timeZone = 'UTC' }) {
  const [t, setT] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000); // minute precision: no need to re-render every second
    return () => clearInterval(id);
  }, [timeZone]);
  return <time suppressHydrationWarning>{t}</time>;
}

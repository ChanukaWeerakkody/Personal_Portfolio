import React, { useState, useEffect } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasLoaded');
    }
    return true;
  });

  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const t1 = setTimeout(() => setFade(true), 800);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('hasLoaded', 'true');
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="preloader-core" aria-hidden="true">
        <div className="preloader-ring preloader-ring-outer" />
        <div className="preloader-ring preloader-ring-inner" />
        <div className="preloader-orbit preloader-orbit-one"><span /></div>
        <div className="preloader-orbit preloader-orbit-two"><span /></div>
        <div className="preloader-node preloader-node-one" />
        <div className="preloader-node preloader-node-two" />
        <div className="preloader-node preloader-node-three" />
        <div className="preloader-center">
          <span className="font-mono text-3xl font-extrabold gradient-text">&lt;/&gt;</span>
        </div>
      </div>
      <div className="preloader-status mt-8">
        <span className="preloader-status-dot" />
        <span className="font-mono text-[11px] tracking-[0.35em] text-muted-foreground uppercase">Initializing System</span>
        <span className="preloader-progress"><span /></span>
      </div>
    </div>
  );
}
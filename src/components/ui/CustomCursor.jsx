import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth & zero-lag cursor physics using Motion Values
  const springConfig = { damping: 25, stiffness: 400, mass: 0.1 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.tagName?.toLowerCase() === 'button' ||
        target.tagName?.toLowerCase() === 'a' ||
        target.tagName?.toLowerCase() === 'input' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList?.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY, isVisible]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[rgb(var(--accent))] rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_rgb(var(--accent))]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isMouseDown ? 0.5 : isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border border-[rgb(var(--accent)/0.4)] backdrop-blur-[1px] bg-[rgb(var(--accent)/0.05)]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          scale: isMouseDown ? 0.85 : 1,
          borderColor: isHovering ? 'rgb(var(--accent))' : 'rgb(var(--accent) / 0.4)',
          backgroundColor: isHovering ? 'rgb(var(--accent) / 0.15)' : 'rgb(var(--accent) / 0.03)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.2 }}
      />
    </>
  );
}
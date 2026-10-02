'use client';

/**
 * ClickSpark, from React Bits (reactbits.dev, @react-bits/ClickSpark-TS-CSS;
 * MIT + Commons Clause), added through the shadcn registry. The spark drawing
 * is the published one. Changes: the frame loop runs only while sparks are in
 * flight (the original drew every frame for the life of the page), the canvas
 * reaches past its button so a burst is not clipped at the edge, the colour
 * defaults to the theme's champagne, the wrapper sits inline around a button,
 * and nothing is drawn under reduced motion.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion/policy';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  className?: string;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

/** How far the canvas reaches past the wrapped element, in CSS pixels. */
const BLEED = 32;

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor,
  sparkSize = 10,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 420,
  easing = 'ease-out',
  extraScale = 1.0,
  className,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = Math.round((width + BLEED * 2) * ratio);
      canvas.height = Math.round((height + BLEED * 2) * ratio);
      canvas.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const ease = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing],
  );

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const rect = canvas.getBoundingClientRect();
    // Keyboard activation has no pointer position: burst from the centre.
    const x = event.detail === 0 ? rect.width / 2 : event.clientX - rect.left;
    const y = event.detail === 0 ? rect.height / 2 : event.clientY - rect.top;
    const now = performance.now();
    for (let i = 0; i < sparkCount; i++) sparksRef.current.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, startTime: now });
    if (frameRef.current) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const color = sparkColor ?? (getComputedStyle(canvas).getPropertyValue('--color-champagne').trim() || '#ecd8b7');
    // Draws while sparks are in flight, then stops.
    const step = (timestamp: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        const eased = ease(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(spark.x + distance * Math.cos(spark.angle), spark.y + distance * Math.sin(spark.angle));
        context.lineTo(spark.x + (distance + lineLength) * Math.cos(spark.angle), spark.y + (distance + lineLength) * Math.sin(spark.angle));
        context.stroke();
        return true;
      });
      frameRef.current = sparksRef.current.length ? requestAnimationFrame(step) : 0;
    };
    frameRef.current = requestAnimationFrame(step);
  };

  return (
    <span className={['click-spark', className].filter(Boolean).join(' ')} onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark__canvas" aria-hidden="true" />
      {children}
    </span>
  );
};

export default ClickSpark;

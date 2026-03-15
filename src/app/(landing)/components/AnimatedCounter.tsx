'use client';

import { useEffect, useRef } from 'react';
import { useSpring, useTransform, motion, useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

function formatWithSpaces(num: number): string {
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1,
  className = '',
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const nodeRef = useRef<HTMLSpanElement>(null);

  const springValue = useSpring(0, {
    stiffness: 75,
    damping: 15,
    duration: prefersReducedMotion ? 0 : duration,
  });

  const displayValue = useTransform(springValue, (latest) =>
    formatWithSpaces(latest)
  );

  useEffect(() => {
    springValue.set(value);
  }, [springValue, value]);

  useEffect(() => {
    const unsubscribe = displayValue.on('change', (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = `${prefix}${latest}${suffix}`;
      }
    });
    return unsubscribe;
  }, [displayValue, prefix, suffix]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}{formatWithSpaces(value)}{suffix}
      </span>
    );
  }

  return (
    <motion.span ref={nodeRef} className={className}>
      {prefix}{formatWithSpaces(value)}{suffix}
    </motion.span>
  );
}

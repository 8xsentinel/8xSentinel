'use client';

import React, { useEffect, useState } from 'react';

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function StatCounter({ value, prefix = '', suffix = '', duration = 1500 }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const start = 0;
    const end = value;
    const steps = 40;
    const increment = end / steps;
    let current = start;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

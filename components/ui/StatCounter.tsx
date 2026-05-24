'use client';

import React, { useEffect, useState } from 'react';

interface StatCounterProps {
  value: number;
  duration?: number; // duration in ms
  prefix?: string;
  suffix?: string;
}

export default function StatCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = ''
}: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeProgress * endValue);
      
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatNumber = (num: number) => {
    if (suffix === '₹' || prefix === '₹') {
      return num.toLocaleString('en-IN');
    }
    return num.toString();
  };

  return (
    <span className="font-mono font-bold tracking-tight">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

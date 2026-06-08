'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'red' | 'green' | 'none';
}

export default function GlowCard({ children, className, glowColor = 'cyan' }: GlowCardProps) {
  const glowClasses = {
    cyan: 'hover:border-accent-cyan/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]',
    purple: 'hover:border-accent-purple/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]',
    red: 'hover:border-accent-red/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.08)]',
    green: 'hover:border-accent-green/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl transition-all duration-300',
        glowClasses[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}

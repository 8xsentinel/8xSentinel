'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'red' | 'green' | 'gold' | 'none';
}

export default function GlowCard({ children, className, glowColor = 'cyan' }: GlowCardProps) {
  const glowClasses = {
    cyan: 'card-glow-cyan hover:border-accent-cyan/40',
    purple: 'hover:border-accent-purple/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]',
    red: 'card-glow-red hover:border-accent-red/40',
    green: 'card-glow-green hover:border-accent-green/40',
    gold: 'card-glow-gold hover:border-[#ffd700]/40',
    none: '',
  };

  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1',
        glowClasses[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}

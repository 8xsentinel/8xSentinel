'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'purple' | 'red' | 'green' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function CyberButton({
  variant = 'cyan',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: CyberButtonProps) {
  const variantClasses = {
    cyan: 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5 hover:bg-accent-cyan/10 hover:border-accent-cyan/80 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    purple: 'border-accent-purple/40 text-accent-purple bg-accent-purple/5 hover:bg-accent-purple/10 hover:border-accent-purple/80 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    red: 'border-accent-red/40 text-accent-red bg-accent-red/5 hover:bg-accent-red/10 hover:border-accent-red/80 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    green: 'border-accent-green/40 text-accent-green bg-accent-green/5 hover:bg-accent-green/10 hover:border-accent-green/80 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    ghost: 'border-border-subtle text-text-secondary bg-transparent hover:bg-white/[0.03] hover:text-text-primary',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-[10px] gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
    lg: 'px-8 py-3.5 text-sm gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-mono font-bold uppercase tracking-widest border rounded transition-all duration-200 cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

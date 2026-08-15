'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'purple' | 'red' | 'green' | 'gold' | 'ghost' | 'gradient-cyan';
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
    'gradient-cyan': 'btn-cyan text-white',
    cyan: 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5 hover:bg-accent-cyan/15 hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    purple: 'border-accent-purple/40 text-accent-purple bg-accent-purple/5 hover:bg-accent-purple/15 hover:border-accent-purple hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]',
    red: 'btn-red text-white',
    green: 'btn-green text-white',
    gold: 'btn-gold text-black font-extrabold',
    ghost: 'btn-outline text-text-secondary hover:text-white',
  };

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-[11px] gap-1.5 rounded-lg min-h-[36px]',
    md: 'px-5 py-2.5 text-xs gap-2 rounded-xl min-h-[44px]',
    lg: 'px-7 py-3.5 text-sm gap-2.5 rounded-xl min-h-[50px]',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      style={{ fontFamily: 'var(--font-h)' }}
      {...props}
    >
      {children}
    </button>
  );
}

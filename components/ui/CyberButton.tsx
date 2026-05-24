'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'purple' | 'green' | 'red' | 'amber' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glow?: boolean;
}

export default function CyberButton({
  children,
  variant = 'cyan',
  size = 'md',
  fullWidth = false,
  glow = true,
  className = '',
  ...props
}: CyberButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan hover:text-bg-void hover:shadow-glow-cyan';
      case 'blue':
        return 'bg-accent-blue/10 border-accent-blue/40 text-text-primary hover:bg-accent-blue hover:text-bg-void hover:shadow-glow-blue';
      case 'purple':
        return 'bg-accent-purple/10 border-accent-purple/40 text-accent-purple hover:bg-accent-purple hover:text-bg-void hover:shadow-glow-purple';
      case 'green':
        return 'bg-accent-green/10 border-accent-green/40 text-accent-green hover:bg-accent-green hover:text-bg-void hover:shadow-glow-green';
      case 'red':
        return 'bg-accent-red/10 border-accent-red/40 text-accent-red hover:bg-accent-red hover:text-bg-void hover:shadow-glow-red';
      case 'amber':
        return 'bg-accent-amber/10 border-accent-amber/40 text-accent-amber hover:bg-accent-amber hover:text-bg-void hover:shadow-glow-amber';
      case 'subtle':
      default:
        return 'bg-white/[0.02] border-border-subtle text-text-secondary hover:text-text-primary hover:bg-white/[0.06] hover:border-border-subtle/80';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-1.5 text-xs';
      case 'lg':
        return 'px-8 py-4 text-base tracking-wider';
      case 'md':
      default:
        return 'px-6 py-2.5 text-sm';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        clip-cyber-btn border font-mono font-bold uppercase tracking-widest
        transition-all duration-300 ease-out select-none outline-none focus:outline-none
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${props.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-current hover:shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

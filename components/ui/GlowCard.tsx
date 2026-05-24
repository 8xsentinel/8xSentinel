'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'blue' | 'amber' | 'red' | 'green' | 'purple' | 'subtle';
  onClick?: () => void;
  hoverGlow?: boolean;
  cyberBorder?: boolean;
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  onClick,
  hoverGlow = true,
  cyberBorder = true
}: GlowCardProps) {
  const getGlowStyles = () => {
    switch (glowColor) {
      case 'cyan':
        return 'hover:border-accent-cyan/40 hover:shadow-glow-cyan';
      case 'blue':
        return 'hover:border-accent-blue/40 hover:shadow-glow-blue';
      case 'amber':
        return 'hover:border-accent-amber/40 hover:shadow-glow-amber';
      case 'red':
        return 'hover:border-accent-red/40 hover:shadow-glow-red';
      case 'green':
        return 'hover:border-accent-green/40 hover:shadow-glow-green';
      case 'purple':
        return 'hover:border-accent-purple/40 hover:shadow-glow-purple';
      case 'subtle':
      default:
        return 'hover:border-border-subtle/80 hover:shadow-[0_0_20px_rgba(18,27,51,0.25)]';
    }
  };

  const getBorderColor = () => {
    switch (glowColor) {
      case 'cyan': return 'border-accent-cyan/15';
      case 'blue': return 'border-accent-blue/15';
      case 'amber': return 'border-accent-amber/15';
      case 'red': return 'border-accent-red/15';
      case 'green': return 'border-accent-green/15';
      case 'purple': return 'border-accent-purple/15';
      default: return 'border-border-subtle';
    }
  };

  const cardContent = (
    <div
      onClick={onClick}
      className={`
        relative backdrop-blur-md bg-bg-surface/80 border ${getBorderColor()} p-6 
        transition-all duration-300 ease-out overflow-hidden
        ${cyberBorder ? 'clip-cyber' : 'rounded-xl'}
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverGlow ? getGlowStyles() : ''}
        ${className}
      `}
    >
      {/* Visual cyber decorations: diagonal corner highlights */}
      {cyberBorder && (
        <>
          <span className="absolute top-0 right-0 w-3.5 h-[1px] bg-accent-cyan/35 transform rotate-45 translate-x-1 translate-y-[2px]" />
          <span className="absolute bottom-0 left-0 w-3.5 h-[1px] bg-accent-cyan/35 transform rotate-45 -translate-x-1 -translate-y-[2px]" />
        </>
      )}
      
      {children}
    </div>
  );

  if (hoverGlow) {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

'use client';

import React from 'react';

interface TrustScoreRingProps {
  score: number; // 0–100
  size?: 'sm' | 'md' | 'lg' | number;
  type?: 'trust' | 'scammer' | 'reseller';
}

const presetMap: Record<string, { r: number; stroke: number; viewBox: number; fontSize: string; labelSize: string }> = {
  sm: { r: 18, stroke: 4, viewBox: 48, fontSize: '8px',  labelSize: '6px' },
  md: { r: 28, stroke: 5, viewBox: 72, fontSize: '10px', labelSize: '7px' },
  lg: { r: 40, stroke: 6, viewBox: 100, fontSize: '14px', labelSize: '9px' },
};

function getCfg(size: 'sm' | 'md' | 'lg' | number) {
  if (typeof size === 'number') {
    const r = size * 0.38;
    const stroke = size * 0.06;
    const fontSize = `${Math.floor(size * 0.14)}px`;
    const labelSize = `${Math.floor(size * 0.09)}px`;
    return { r, stroke, viewBox: size, fontSize, labelSize };
  }
  return presetMap[size] ?? presetMap.md;
}

export default function TrustScoreRing({ score, size = 'md', type = 'trust' }: TrustScoreRingProps) {
  const cfg = getCfg(size);
  const circumference = 2 * Math.PI * cfg.r;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  // For scammer type: low score = most dangerous (red), high score = less dangerous (amber/green)
  const color =
    type === 'scammer'
      ? score <= 30  ? '#ef4444'
        : score <= 60 ? '#f59e0b'
        : '#22c55e'
      : score >= 80 ? '#22c55e'
        : score >= 50 ? '#f59e0b'
        : '#ef4444';

  const cx = cfg.viewBox / 2;
  const cy = cfg.viewBox / 2;

  return (
    <svg
      width={cfg.viewBox}
      height={cfg.viewBox}
      viewBox={`0 0 ${cfg.viewBox} ${cfg.viewBox}`}
      className="rotate-[-90deg]"
    >
      <circle cx={cx} cy={cy} r={cfg.r} fill="none" stroke="#1a2535" strokeWidth={cfg.stroke} />
      <circle
        cx={cx} cy={cy} r={cfg.r}
        fill="none"
        stroke={color}
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={cfg.fontSize}
        fontFamily="var(--font-mono), monospace"
        fontWeight="bold"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        {score}
      </text>
      <text
        x={cx} y={cy + parseInt(cfg.fontSize) + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#3d4f63"
        fontSize={cfg.labelSize}
        fontFamily="var(--font-mono), monospace"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        {type === 'scammer' ? 'RISK' : 'TRUST'}
      </text>
    </svg>
  );
}

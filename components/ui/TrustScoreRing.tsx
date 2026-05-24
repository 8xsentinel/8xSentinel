import React from 'react';

interface TrustScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  type?: 'scammer' | 'reseller';
}

export default function TrustScoreRing({
  score,
  size = 64,
  strokeWidth = 6,
  showText = true,
  type = 'reseller'
}: TrustScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Get color based on score and type
  const getColor = () => {
    if (type === 'scammer') {
      // For scammers, LOWER score is MORE dangerous (higher risk). Coded as danger/warning
      if (score <= 15) return 'text-red-500'; // Highly dangerous
      if (score <= 35) return 'text-orange-500';
      if (score <= 60) return 'text-amber-500';
      return 'text-lime-500'; // Low risk
    } else {
      // For resellers, HIGHER score is BETTER (more trusted)
      if (score >= 90) return 'text-emerald-500';
      if (score >= 70) return 'text-green-500';
      if (score >= 50) return 'text-amber-500';
      return 'text-red-500'; // Untrusted
    }
  };

  const ringColor = getColor();

  return (
    <div className="relative flex items-center justify-center font-mono" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="text-border-subtle"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`transition-all duration-500 ease-out ${ringColor}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold font-mono tracking-tighter" style={{ fontSize: size * 0.28 }}>
            {score}
          </span>
          <span className="text-[8px] text-text-muted font-sans font-medium uppercase tracking-widest scale-75 -mt-0.5">
            {type === 'scammer' ? 'Risk' : 'Trust'}
          </span>
        </div>
      )}
    </div>
  );
}

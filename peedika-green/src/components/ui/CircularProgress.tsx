import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { getEcoScoreLevel } from '@/types/product';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  label,
  animated = true,
  className,
}: CircularProgressProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const level = getEcoScoreLevel(value);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorClasses = {
    high: 'stroke-eco-high',
    medium: 'stroke-eco-medium',
    low: 'stroke-eco-low',
  };

  const glowClasses = {
    high: 'drop-shadow-[0_0_8px_hsl(147,49%,35%,0.6)]',
    medium: 'drop-shadow-[0_0_8px_hsl(43,74%,49%,0.6)]',
    low: 'drop-shadow-[0_0_8px_hsl(0,63%,46%,0.6)]',
  };

  useEffect(() => {
    if (!animated) return;

    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.2, ease: 'power2.out' }
      );
    }

    if (valueRef.current && showValue) {
      gsap.fromTo(
        valueRef.current,
        { innerText: 0 },
        {
          innerText: value,
          duration: 1.2,
          ease: 'power2.out',
          snap: { innerText: 1 },
        }
      );
    }
  }, [value, circumference, offset, animated, showValue]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className={cn('-rotate-90', glowClasses[level])}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          className={cn('transition-all', colorClasses[level])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span ref={valueRef} className="text-2xl font-bold text-foreground">
            {animated ? 0 : value}
          </span>
        )}
        {label && <span className="text-xs text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

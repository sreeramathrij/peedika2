import { cn } from '@/lib/utils';
import { getEcoScoreLevel } from '@/types/product';

interface EcoScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const EcoScoreBadge = ({ score, size = 'md', showLabel = true, className }: EcoScoreBadgeProps) => {
  const level = getEcoScoreLevel(score);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const colorClasses = {
    high: 'bg-eco-high text-white shadow-glow-green',
    medium: 'bg-eco-medium text-white shadow-glow-amber',
    low: 'bg-eco-low text-white shadow-glow-red',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold transition-transform hover:scale-110',
        sizeClasses[size],
        colorClasses[level],
        className
      )}
    >
      {showLabel ? score : null}
    </div>
  );
};

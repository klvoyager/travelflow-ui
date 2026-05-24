import { cn } from '@/lib/utils';
import type { HotnessFlag as HotnessFlagType } from '@/lib/types';

const HOTNESS_CONFIG: Record<HotnessFlagType, { label: string; emoji: string; className: string }> = {
  LOW:      { label: 'Low',      emoji: '🟢', className: 'text-gray-500' },
  MEDIUM:   { label: 'Medium',   emoji: '🟡', className: 'text-yellow-600' },
  HIGH:     { label: 'High',     emoji: '🔴', className: 'text-red-600' },
  CRITICAL: { label: 'Critical', emoji: '🔥', className: 'text-purple-700 font-bold' },
};

interface HotnessFlagProps {
  flag: HotnessFlagType;
  showLabel?: boolean;
  className?: string;
}

export function HotnessFlag({ flag, showLabel = true, className }: HotnessFlagProps) {
  const config = HOTNESS_CONFIG[flag];
  return (
    <span className={cn('flex items-center gap-1 text-sm', config.className, className)}>
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

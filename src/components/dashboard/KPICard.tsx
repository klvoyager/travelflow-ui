import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  severity?: 'normal' | 'warning' | 'critical';
  icon?: React.ElementType;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  trendLabel,
  severity = 'normal',
  icon: Icon,
  className,
}: KPICardProps) {
  const severityClass = {
    normal:   'border-border',
    warning:  'border-l-4 border-l-yellow-400',
    critical: 'border-l-4 border-l-red-500',
  }[severity];

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className={cn('shadow-card', severityClass, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        {trend && trendLabel && (
          <div className={cn('mt-3 flex items-center gap-1 text-xs', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy');
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy, HH:mm');
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}

export function formatDaysUntil(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

export function generateEnquiryRef(tenantCode: string, year: number, seq: number): string {
  return `ENQ-${tenantCode}-${year}-${String(seq).padStart(5, '0')}`;
}

export function generateTripRef(tenantCode: string, year: number, seq: number): string {
  return `TRP-${tenantCode}-${year}-${String(seq).padStart(5, '0')}`;
}

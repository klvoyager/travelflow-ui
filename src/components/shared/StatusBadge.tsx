import { Badge } from '@/components/ui/badge';
import { getStageConfig } from '@/lib/constants/enquiryStages';
import type { EnquiryStatus, Priority, HotnessFlag, TripStatus } from '@/lib/types';

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  const stage = getStageConfig(status);
  return (
    <Badge variant="outline" className={stage.bgClass + ' text-xs font-medium border'}>
      {stage.label}
    </Badge>
  );
}

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  LOW:    { label: 'Low',    className: 'bg-gray-100 text-gray-600 border-gray-200' },
  MEDIUM: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  HIGH:   { label: 'High',   className: 'bg-orange-50 text-orange-700 border-orange-200' },
  URGENT: { label: 'Urgent', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge variant="outline" className={config.className + ' text-xs font-medium border'}>
      {config.label}
    </Badge>
  );
}

const TRIP_STATUS_CONFIG: Record<TripStatus, { label: string; className: string }> = {
  NOT_STARTED: { label: 'Not Started', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ESCALATION:  { label: 'Escalation',  className: 'bg-red-50 text-red-700 border-red-200' },
  COMPLETED:   { label: 'Completed',   className: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const config = TRIP_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className + ' text-xs font-medium border'}>
      {config.label}
    </Badge>
  );
}
